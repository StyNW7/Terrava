#include "radio.h"

#include <Preferences.h>
#include <RadioLib.h>
#include <SPI.h>

#include "config.h"
#include "terrava_payload.h"

namespace {

SX1276 lora = new Module(PIN_LORA_CS, PIN_LORA_DIO0, PIN_LORA_RST, PIN_LORA_DIO1);

}  // namespace

#if defined(TERRAVA_RADIO_LORAWAN)
// ============================================================================
// LoRaWAN (OTAA)
// ============================================================================

namespace {

LoRaWANNode node(&lora, &LORAWAN_BAND);
const uint64_t joinEui = LORAWAN_JOIN_EUI;
const uint64_t devEui = LORAWAN_DEV_EUI;
uint8_t appKey[] = {LORAWAN_APP_KEY};
uint8_t nwkKey[] = {LORAWAN_NWK_KEY};

// The session lives in RTC RAM so a wake from deep sleep does not need a new join.
RTC_DATA_ATTR uint8_t sessionBuffer[RADIOLIB_LORAWAN_SESSION_BUF_SIZE];
RTC_DATA_ATTR bool sessionValid = false;
bool active = false;

}  // namespace

namespace radio {

bool begin() {
  SPI.begin(PIN_LORA_SCK, PIN_LORA_MISO, PIN_LORA_MOSI, PIN_LORA_CS);
  int16_t state = lora.begin();
  if (state != RADIOLIB_ERR_NONE) {
    Serial.printf("[radio] SX1276 init failed (%d)\n", state);
    return false;
  }
  node.beginOTAA(joinEui, devEui, nwkKey, appKey);

  // Join nonces must persist across power cycles (LoRaWAN 1.1 replay protection).
  Preferences store;
  store.begin("terrava-lw");
  if (store.isKey("nonces")) {
    uint8_t nonces[RADIOLIB_LORAWAN_NONCES_BUF_SIZE];
    store.getBytes("nonces", nonces, sizeof(nonces));
    node.setBufferNonces(nonces);
  }
  if (sessionValid) node.setBufferSession(sessionBuffer);

  // Back off between join attempts to respect duty cycle and save battery.
  for (int attempt = 0; attempt < 3; attempt++) {
    state = node.activateOTAA();
    if (state == RADIOLIB_LORAWAN_NEW_SESSION || state == RADIOLIB_LORAWAN_SESSION_RESTORED) break;
    Serial.printf("[radio] join failed (%d), retrying\n", state);
    delay(10000UL * (attempt + 1));
  }
  if (state == RADIOLIB_LORAWAN_NEW_SESSION) {
    store.putBytes("nonces", node.getBufferNonces(), RADIOLIB_LORAWAN_NONCES_BUF_SIZE);
    Serial.println("[radio] joined (new session)");
  }
  store.end();
  active = state == RADIOLIB_LORAWAN_NEW_SESSION || state == RADIOLIB_LORAWAN_SESSION_RESTORED;
  return active;
}

Result send(uint8_t fport, const uint8_t *data, size_t len, uint8_t *downlink, size_t *downlinkLen) {
  if (!active) return Result::Failed;
  uint8_t buffer[64];
  size_t received = 0;
  LoRaWANEvent_t up, down;
  int16_t state = node.sendReceive(data, len, fport, buffer, &received, false, &up, &down);
  if (state < RADIOLIB_ERR_NONE) {
    Serial.printf("[radio] uplink failed (%d)\n", state);
    return Result::Failed;
  }
  if (state > 0 && received > 0 && down.fPort == TRV_FPORT_COMMANDS && downlink && downlinkLen) {
    size_t n = received < *downlinkLen ? received : *downlinkLen;
    memcpy(downlink, buffer, n);
    *downlinkLen = n;
    return Result::SentWithDownlink;
  }
  if (downlinkLen) *downlinkLen = 0;
  return Result::Sent;
}

void saveSession() {
  if (!active) return;
  memcpy(sessionBuffer, node.getBufferSession(), RADIOLIB_LORAWAN_SESSION_BUF_SIZE);
  sessionValid = true;
}

bool joined() { return active; }

}  // namespace radio

#elif defined(TERRAVA_RADIO_P2P)
// ============================================================================
// LoRa point-to-point with the Terrava gateway
// ============================================================================

namespace {

RTC_DATA_ATTR uint16_t frameCounter = 0;
volatile bool packetReceived = false;
bool ready = false;

void IRAM_ATTR onPacket() { packetReceived = true; }

}  // namespace

namespace radio {

bool begin() {
  SPI.begin(PIN_LORA_SCK, PIN_LORA_MISO, PIN_LORA_MOSI, PIN_LORA_CS);
  int16_t state = lora.begin(P2P_FREQUENCY_MHZ, P2P_BANDWIDTH_KHZ, P2P_SPREADING_FACTOR, P2P_CODING_RATE, P2P_SYNC_WORD, P2P_TX_POWER_DBM);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.printf("[radio] SX1276 init failed (%d)\n", state);
    return false;
  }
  lora.setCRC(true);
  lora.setPacketReceivedAction(onPacket);
  ready = true;
  return true;
}

Result send(uint8_t fport, const uint8_t *data, size_t len, uint8_t *downlink, size_t *downlinkLen) {
  (void)fport;  // the message type is carried in the payload header
  if (!ready) return Result::Failed;
  uint8_t frame[64];
  size_t frameLen = trv_p2p_frame(P2P_DEVICE_ID, ++frameCounter, data, len, frame, sizeof(frame));
  if (!frameLen || lora.transmit(frame, frameLen) != RADIOLIB_ERR_NONE) return Result::Failed;

  // Listen briefly for a command from the gateway.
  packetReceived = false;
  lora.startReceive();
  uint32_t deadline = millis() + P2P_DOWNLINK_WINDOW_MS;
  while (!packetReceived && millis() < deadline) delay(5);
  if (downlinkLen) *downlinkLen = 0;
  if (!packetReceived) {
    lora.standby();
    return Result::Sent;
  }
  uint8_t rx[64];
  size_t rxLen = lora.getPacketLength();
  if (rxLen > sizeof(rx) || lora.readData(rx, rxLen) != RADIOLIB_ERR_NONE) return Result::Sent;
  lora.standby();

  uint32_t target;
  uint16_t fcnt;
  const uint8_t *payload;
  size_t payloadLen;
  if (trv_p2p_unframe(rx, rxLen, &target, &fcnt, &payload, &payloadLen) && target == P2P_DEVICE_ID && downlink && downlinkLen) {
    size_t n = payloadLen < *downlinkLen ? payloadLen : *downlinkLen;
    memcpy(downlink, payload, n);
    *downlinkLen = n;
    return Result::SentWithDownlink;
  }
  return Result::Sent;
}

void saveSession() {}

bool joined() { return ready; }

}  // namespace radio

#else
#error "Define TERRAVA_RADIO_LORAWAN or TERRAVA_RADIO_P2P (see platformio.ini)"
#endif
