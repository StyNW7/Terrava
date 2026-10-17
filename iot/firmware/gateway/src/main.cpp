/*
 * Terrava single-channel LoRa gateway.
 *
 *   ear tag --LoRa P2P--> gateway --Wi-Fi/HTTPS--> POST /api/v1/ingest/telemetry
 *   backend --GET /api/v1/ingest/commands?scope=farm--> gateway --LoRa--> ear tag
 *
 * Readings are queued in RAM while the backhaul is down and sent in batches; the
 * backend drops duplicates by (device, frame counter, timestamp).
 */
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <RadioLib.h>
#include <SPI.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <time.h>

#include "config.h"
#include "terrava_payload.h"

SX1276 lora = new Module(PIN_LORA_CS, PIN_LORA_DIO0, PIN_LORA_RST, PIN_LORA_DIO1);

volatile bool packetReady = false;
void IRAM_ATTR onPacket() { packetReady = true; }

struct QueuedReading {
  bool environment;
  char serial[12];
  uint16_t fcnt;
  trv_vitals_t vitals;
  float envTemperature, envHumidity;
  uint8_t envBattery;
  int16_t rssi;
  float snr;
  uint32_t receivedAt;
};

QueuedReading queue[QUEUE_CAPACITY];
size_t queueHead = 0, queueCount = 0;

struct PendingCommand {
  bool active;
  uint32_t deviceId;
  char id[40];
  uint8_t bytes[8];
  size_t len;
};
PendingCommand commands[16];
uint8_t commandSeq = 0;

uint32_t packetsForwarded = 0, lastForward = 0, lastPoll = 0, lastHeartbeat = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static void idToSerial(uint32_t id, char *out, size_t cap) {
  const char *prefix = (id >> 24) == 1 ? "TAG" : (id >> 24) == 2 ? "ENV" : "DEV";
  snprintf(out, cap, "%s-%03lu", prefix, (unsigned long)(id & 0xFFFFFF));
}

static uint32_t serialToId(const char *serial) {
  uint32_t base = strncmp(serial, "TAG", 3) == 0 ? 0x01000000 : strncmp(serial, "ENV", 3) == 0 ? 0x02000000 : 0;
  const char *dash = strchr(serial, '-');
  return dash ? base + (uint32_t)strtoul(dash + 1, nullptr, 10) : 0;
}

static void isoTime(uint32_t unix, char *out, size_t cap) {
  time_t t = unix;
  struct tm tm;
  gmtime_r(&t, &tm);
  strftime(out, cap, "%Y-%m-%dT%H:%M:%SZ", &tm);
}

static uint32_t nowUnix() {
  time_t now = time(nullptr);
  return now > 1700000000 ? (uint32_t)now : 0;
}

static void enqueue(const QueuedReading &r) {
  if (queueCount == QUEUE_CAPACITY) {  // full: drop the oldest
    queueHead = (queueHead + 1) % QUEUE_CAPACITY;
    queueCount--;
  }
  queue[(queueHead + queueCount) % QUEUE_CAPACITY] = r;
  queueCount++;
}

static bool request(const char *method, const String &path, const String &body, String *response) {
  if (WiFi.status() != WL_CONNECTED) return false;
  String url = String(TERRAVA_API_URL) + path;
  HTTPClient http;
  WiFiClientSecure secure;
  WiFiClient plain;
  if (url.startsWith("https")) {
    // Production: replace setInsecure() with secure.setCACert(<root CA PEM>).
    secure.setInsecure();
    http.begin(secure, url);
  } else {
    http.begin(plain, url);
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", TERRAVA_GATEWAY_KEY);
  http.setTimeout(8000);
  int code = strcmp(method, "GET") == 0 ? http.GET() : http.POST(body);
  if (response) *response = http.getString();
  http.end();
  if (code < 200 || code >= 300) {
    Serial.printf("[http] %s %s -> %d\n", method, path.c_str(), code);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// LoRa receive / downlink
// ---------------------------------------------------------------------------

static void sendDownlinkIfPending(uint32_t deviceId) {
  for (auto &cmd : commands) {
    if (!cmd.active || cmd.deviceId != deviceId) continue;
    uint8_t frame[32];
    size_t len = trv_p2p_frame(deviceId, ++commandSeq, cmd.bytes, cmd.len, frame, sizeof(frame));
    delay(DOWNLINK_DELAY_MS);
    int16_t state = lora.transmit(frame, len);
    lora.startReceive();
    char serial[12];
    idToSerial(deviceId, serial, sizeof(serial));
    Serial.printf("[downlink] %s command %s -> %d\n", serial, cmd.id, state);
    JsonDocument doc;
    doc["success"] = state == RADIOLIB_ERR_NONE;
    doc["result"]["via"] = "p2p-gateway";
    String body;
    serializeJson(doc, body);
    request("POST", String("/ingest/commands/") + cmd.id + "/ack", body, nullptr);
    cmd.active = false;
  }
}

static void handlePacket() {
  uint8_t frame[64];
  size_t len = lora.getPacketLength();
  if (len == 0 || len > sizeof(frame) || lora.readData(frame, len) != RADIOLIB_ERR_NONE) {
    lora.startReceive();
    return;
  }
  int16_t rssi = (int16_t)lora.getRSSI();
  float snr = lora.getSNR();

  uint32_t deviceId;
  uint16_t fcnt;
  const uint8_t *payload;
  size_t payloadLen;
  if (!trv_p2p_unframe(frame, len, &deviceId, &fcnt, &payload, &payloadLen)) {
    Serial.println("[lora] ignored non-Terrava or corrupted frame");
    lora.startReceive();
    return;
  }
  digitalWrite(PIN_LED, HIGH);
  QueuedReading r = {};
  idToSerial(deviceId, r.serial, sizeof(r.serial));
  r.fcnt = fcnt;
  r.rssi = rssi;
  r.snr = snr;
  r.receivedAt = nowUnix();
  uint8_t type = payload[0] & 0x0F;

  if (type == TRV_TYPE_VITALS && trv_decode_vitals(payload, payloadLen, &r.vitals)) {
    enqueue(r);
    Serial.printf("[lora] %s fcnt=%u T=%.2f HR=%d RSSI=%d SNR=%.1f\n", r.serial, fcnt, r.vitals.temperature, r.vitals.heart_rate, rssi, snr);
  } else if (type == TRV_TYPE_ENVIRONMENT && payloadLen == TRV_ENV_LEN) {
    r.environment = true;
    r.envTemperature = (int16_t)trv_get_u16(payload + 1) / 100.0f;
    r.envHumidity = trv_get_u16(payload + 3) / 100.0f;
    r.envBattery = payload[5];
    enqueue(r);
  } else if (type == TRV_TYPE_STATUS && payloadLen == TRV_STATUS_LEN) {
    Serial.printf("[lora] %s status fw v%u.%u.%u interval %us battery %u%% buffered %u cmd#%u=%u\n", r.serial, payload[1], payload[2],
                  payload[3], trv_get_u16(payload + 6), payload[8], trv_get_u16(payload + 9), payload[11], payload[12]);
  }
  digitalWrite(PIN_LED, LOW);
  sendDownlinkIfPending(deviceId);
  lora.startReceive();
}

// ---------------------------------------------------------------------------
// Backend sync
// ---------------------------------------------------------------------------

static void forward() {
  size_t vitalsSent = 0, envSent = 0;
  JsonDocument telemetry, environment;
  JsonArray readings = telemetry["readings"].to<JsonArray>();
  JsonArray envReadings = environment["readings"].to<JsonArray>();
  size_t n = queueCount < FORWARD_BATCH_MAX ? queueCount : FORWARD_BATCH_MAX;
  char iso[24];
  for (size_t i = 0; i < n; i++) {
    const QueuedReading &r = queue[(queueHead + i) % QUEUE_CAPACITY];
    if (r.environment) {
      JsonObject e = envReadings.add<JsonObject>();
      e["deviceSerial"] = r.serial;
      e["temperature"] = r.envTemperature;
      e["humidity"] = r.envHumidity;
      e["battery"] = r.envBattery;
      e["rssi"] = r.rssi;
      e["snr"] = r.snr;
      if (r.receivedAt) {
        isoTime(r.receivedAt, iso, sizeof(iso));
        e["recordedAt"] = iso;
      }
      envSent++;
      continue;
    }
    JsonObject o = readings.add<JsonObject>();
    o["deviceSerial"] = r.serial;
    o["sequence"] = r.fcnt;
    if (r.vitals.temperature > 0) o["temperature"] = r.vitals.temperature;
    if (r.vitals.heart_rate >= 0) o["heartRate"] = r.vitals.heart_rate;
    if (r.vitals.oxygen >= 0) o["oxygen"] = r.vitals.oxygen;
    o["activity"] = r.vitals.activity;
    o["steps"] = r.vitals.steps;
    if (r.vitals.has_fix) {
      o["latitude"] = r.vitals.latitude;
      o["longitude"] = r.vitals.longitude;
    }
    o["battery"] = r.vitals.battery;
    o["rssi"] = r.rssi;
    o["snr"] = r.snr;
    uint32_t sampled = r.vitals.timestamp ? r.vitals.timestamp : r.receivedAt;
    if (sampled) {
      isoTime(sampled, iso, sizeof(iso));
      o["recordedAt"] = iso;
    }
    vitalsSent++;
  }
  bool ok = true;
  String body;
  if (vitalsSent) {
    serializeJson(telemetry, body);
    ok = request("POST", "/ingest/telemetry", body, nullptr);
  }
  if (ok && envSent) {
    body = "";
    serializeJson(environment, body);
    ok = request("POST", "/ingest/environment", body, nullptr);
  }
  if (ok) {
    queueHead = (queueHead + n) % QUEUE_CAPACITY;
    queueCount -= n;
    packetsForwarded += n;
  }
}

static void pollCommands() {
  String response;
  if (!request("GET", "/ingest/commands?scope=farm", "", &response)) return;
  JsonDocument doc;
  if (deserializeJson(doc, response)) return;
  for (JsonObject c : doc.as<JsonArray>()) {
    const char *type = c["type"] | "";
    trv_command_t cmd = {};
    cmd.seq = commandSeq;
    if (!strcmp(type, "restart")) cmd.code = TRV_CMD_RESTART;
    else if (!strcmp(type, "run-diagnostics")) cmd.code = TRV_CMD_DIAGNOSTICS;
    else if (!strcmp(type, "locate")) cmd.code = TRV_CMD_LOCATE;
    else if (!strcmp(type, "set-interval")) {
      cmd.code = TRV_CMD_SET_INTERVAL;
      cmd.interval_s = c["payload"]["interval"] | 300;
    } else if (!strcmp(type, "firmware-update")) {
      cmd.code = TRV_CMD_FIRMWARE_UPDATE;
    } else {
      continue;
    }
    for (auto &slot : commands) {
      if (slot.active) continue;
      slot.active = true;
      slot.deviceId = serialToId(c["deviceSerial"] | "");
      strlcpy(slot.id, c["id"] | "", sizeof(slot.id));
      slot.len = trv_encode_command(&cmd, slot.bytes, sizeof(slot.bytes));
      Serial.printf("[command] queued %s for %s\n", type, (const char *)(c["deviceSerial"] | "?"));
      break;
    }
  }
}

static void heartbeat() {
  JsonDocument doc;
  doc["firmware"] = GATEWAY_FIRMWARE;
  doc["uptimeSeconds"] = millis() / 1000;
  doc["packetsForwarded"] = packetsForwarded;
  doc["rssi"] = WiFi.RSSI();
  doc["backhaul"] = "wifi";
  String body;
  serializeJson(doc, body);
  request("POST", "/ingest/heartbeat", body, nullptr);
}

// ---------------------------------------------------------------------------

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  Serial.printf("\n[terrava] gateway %s\n", GATEWAY_FIRMWARE);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  Serial.printf("[wifi] %s %s\n", WiFi.status() == WL_CONNECTED ? "connected" : "offline (will retry)", WiFi.localIP().toString().c_str());
  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC timestamps for readings

  SPI.begin(PIN_LORA_SCK, PIN_LORA_MISO, PIN_LORA_MOSI, PIN_LORA_CS);
  int16_t state = lora.begin(P2P_FREQUENCY_MHZ, P2P_BANDWIDTH_KHZ, P2P_SPREADING_FACTOR, P2P_CODING_RATE, P2P_SYNC_WORD, P2P_TX_POWER_DBM);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.printf("[lora] init failed (%d) - check wiring/frequency\n", state);
    while (true) delay(1000);
  }
  lora.setCRC(true);
  lora.setPacketReceivedAction(onPacket);
  lora.startReceive();
  Serial.printf("[lora] listening on %.1f MHz SF%d\n", P2P_FREQUENCY_MHZ, P2P_SPREADING_FACTOR);
}

void loop() {
  if (packetReady) {
    packetReady = false;
    handlePacket();
  }
  uint32_t now = millis();
  if (WiFi.status() != WL_CONNECTED && now % 30000 < 20) WiFi.reconnect();
  if (queueCount && (now - lastForward > FORWARD_EVERY_MS || queueCount >= FORWARD_BATCH_MAX)) {
    lastForward = now;
    forward();
  }
  if (now - lastPoll > COMMAND_POLL_EVERY_MS) {
    lastPoll = now;
    pollCommands();
  }
  if (now - lastHeartbeat > HEARTBEAT_EVERY_MS) {
    lastHeartbeat = now;
    heartbeat();
  }
  delay(2);
}
