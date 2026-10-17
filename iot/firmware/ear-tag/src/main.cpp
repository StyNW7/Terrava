/*
 * Terrava smart ear tag firmware.
 *
 * Every wake cycle (default 5 minutes):
 *   1. measure body temperature, heart rate / SpO2 and a 10 s activity window
 *   2. take a GPS fix every few cycles (or on a "locate" command)
 *   3. encode a 22-byte vitals payload (protocol/terrava_payload.h) and send it
 *      over LoRaWAN (or LoRa P2P to the Terrava gateway)
 *   4. apply any downlink command (restart, diagnostics, interval, locate)
 *   5. replay readings buffered in flash while out of coverage
 *   6. deep sleep until the next cycle (~10 uA between wakes on the T-Beam)
 */
#include <Arduino.h>
#include <esp_sleep.h>
#include <time.h>

#include "config.h"
#include "radio.h"
#include "sensors.h"
#include "storage.h"
#include "terrava_payload.h"

// State that must survive deep sleep lives in RTC RAM.
RTC_DATA_ATTR uint32_t bootCount = 0;
RTC_DATA_ATTR uint32_t cycle = 0;
RTC_DATA_ATTR uint32_t reportInterval = DEFAULT_REPORT_INTERVAL_S;
RTC_DATA_ATTR uint32_t uptimeSeconds = 0;
RTC_DATA_ATTR uint8_t lastCmdSeq = 0;
RTC_DATA_ATTR uint8_t lastCmdResult = 0;
RTC_DATA_ATTR bool statusPending = true;  // announce firmware/config after boot
RTC_DATA_ATTR bool locateRequested = false;
RTC_DATA_ATTR bool lastDiagnosticsOk = true;

static uint32_t wakeStartedMs = 0;

static uint32_t nowUnix() {
  time_t now = time(nullptr);
  return now > 1700000000 ? (uint32_t)now : 0;  // 0 tells the backend to use receive time
}

static void sendStatus() {
  trv_status_t status = {};
  status.fw_major = TERRAVA_FW_MAJOR;
  status.fw_minor = TERRAVA_FW_MINOR;
  status.fw_patch = TERRAVA_FW_PATCH;
  status.uptime_hours = (uint16_t)min<uint32_t>(uptimeSeconds / 3600, 0xFFFF);
  status.report_interval = (uint16_t)min<uint32_t>(reportInterval, 0xFFFF);
  status.battery = sensors::readPower().batteryPercent;
  status.buffered = (uint16_t)min<size_t>(storage::count(), 0xFFFF);
  status.last_cmd_seq = lastCmdSeq;
  status.last_cmd_result = lastCmdResult;
  uint8_t payload[TRV_STATUS_LEN];
  trv_encode_status(&status, payload);
  if (radio::send(TRV_FPORT_STATUS, payload, sizeof(payload), nullptr, nullptr) != radio::Result::Failed) statusPending = false;
}

// Returns true when the tag should restart right after this cycle.
static bool applyCommand(const uint8_t *data, size_t len) {
  trv_command_t cmd;
  if (!trv_decode_command(data, len, &cmd)) {
    Serial.println("[cmd] invalid downlink ignored");
    return false;
  }
  lastCmdSeq = cmd.seq;
  lastCmdResult = 0;
  statusPending = true;  // every command is confirmed by a status uplink
  bool restart = false;
  switch (cmd.code) {
    case TRV_CMD_RESTART:
      Serial.println("[cmd] restart");
      restart = true;
      break;
    case TRV_CMD_DIAGNOSTICS: {
      Serial.println("[cmd] diagnostics");
      VitalSample probe = sensors::measureVitals();
      lastDiagnosticsOk = !probe.tempFault && !probe.hrFault;
      lastCmdResult = lastDiagnosticsOk ? 0 : 2;
      break;
    }
    case TRV_CMD_SET_INTERVAL:
      reportInterval = constrain(cmd.interval_s, (uint32_t)MIN_REPORT_INTERVAL_S, (uint32_t)MAX_REPORT_INTERVAL_S);
      Serial.printf("[cmd] report interval -> %lu s\n", (unsigned long)reportInterval);
      break;
    case TRV_CMD_LOCATE:
      Serial.println("[cmd] locate");
      sensors::blink(10);
      locateRequested = true;
      break;
    case TRV_CMD_FIRMWARE_UPDATE:
      // Over-the-air updates over LoRa are impractical at these data rates; the tag
      // reports "rejected" and the update is done in maintenance mode (USB / BLE).
      Serial.printf("[cmd] firmware update to v%u.%u.%u requested (maintenance mode required)\n", cmd.version[0], cmd.version[1], cmd.version[2]);
      lastCmdResult = 1;
      break;
  }
  return restart;
}

static void sleepUntilNextCycle() {
  radio::saveSession();
  sensors::sleep();
  uint32_t awakeMs = millis() - wakeStartedMs;
  uint32_t intervalS = locateRequested ? MIN_REPORT_INTERVAL_S : reportInterval;
  uptimeSeconds += intervalS;
  uint64_t sleepUs = (uint64_t)intervalS * 1000000ULL;
  uint64_t awakeUs = (uint64_t)awakeMs * 1000ULL;
  sleepUs = sleepUs > awakeUs + 1000000ULL ? sleepUs - awakeUs : 1000000ULL;
  Serial.printf("[sleep] awake %lu ms, sleeping %llu s\n", (unsigned long)awakeMs, sleepUs / 1000000ULL);
  Serial.flush();
  esp_sleep_enable_timer_wakeup(sleepUs);
  esp_deep_sleep_start();
}

void setup() {
  wakeStartedMs = millis();
  Serial.begin(115200);
  bootCount++;
  cycle++;
  Serial.printf("\n[terrava] ear tag v%d.%d.%d boot %lu cycle %lu\n", TERRAVA_FW_MAJOR, TERRAVA_FW_MINOR, TERRAVA_FW_PATCH, (unsigned long)bootCount, (unsigned long)cycle);

  sensors::begin();
  storage::begin();
  bool radioOk = radio::begin();

  // ---- Measure ------------------------------------------------------------------
  GpsFix fix;
  if (cycle == 1 || locateRequested || cycle % GPS_EVERY_N_CYCLES == 0) {
    fix = sensors::readGps(cycle == 1 ? GPS_FIX_TIMEOUT_MS : GPS_REFIX_TIMEOUT_MS);
    locateRequested = false;
  }
  VitalSample vitals = sensors::measureVitals();
  PowerState power = sensors::readPower();

  trv_vitals_t reading = {};
  reading.temperature = vitals.temperatureC;
  reading.heart_rate = vitals.heartRate;
  reading.oxygen = vitals.oxygen;
  reading.activity = vitals.activity;
  // Extrapolate the 10 s window's steps to the whole reporting interval.
  reading.steps = (uint16_t)min<uint32_t>((uint32_t)vitals.steps * (reportInterval * 1000UL / ACTIVITY_WINDOW_MS), 0xFFFF);
  reading.has_fix = fix.valid;
  reading.latitude = fix.latitude;
  reading.longitude = fix.longitude;
  reading.battery = power.batteryPercent;
  reading.flags = (power.charging ? TRV_FLAG_CHARGING : 0) | (vitals.tempFault ? TRV_FLAG_TEMP_FAULT : 0) |
                  (vitals.hrFault ? TRV_FLAG_HR_FAULT : 0) | (reportInterval > DEFAULT_REPORT_INTERVAL_S ? TRV_FLAG_LOW_POWER : 0);
  reading.timestamp = fix.unixTime ? fix.unixTime : nowUnix();

  uint8_t payload[TRV_VITALS_LEN];
  trv_encode_vitals(&reading, payload);
  Serial.printf("[vitals] T=%.2fC HR=%d SpO2=%d ACT=%u steps=%u fix=%d bat=%u%%\n", reading.temperature, reading.heart_rate,
                reading.oxygen, reading.activity, reading.steps, reading.has_fix, reading.battery);

  // ---- Transmit -------------------------------------------------------------------
  bool restart = false;
  if (!radioOk) {
    storage::push(payload);
    sleepUntilNextCycle();
  }
  if (statusPending || cycle % max<uint32_t>(1, 86400 / reportInterval) == 0) sendStatus();

  uint8_t downlink[16];
  size_t downlinkLen = sizeof(downlink);
  radio::Result result = radio::send(TRV_FPORT_VITALS, payload, sizeof(payload), downlink, &downlinkLen);
  if (result == radio::Result::Failed) {
    storage::push(payload);
    Serial.printf("[buffer] stored, %u reading(s) waiting\n", (unsigned)storage::count());
  } else {
    if (result == radio::Result::SentWithDownlink) restart = applyCommand(downlink, downlinkLen);

    // Coverage is back: replay a few buffered readings, flagged as historical.
    uint8_t stored[TRV_VITALS_LEN];
    for (int i = 0; i < BUFFER_FLUSH_PER_WAKE && storage::peek(stored); i++) {
      stored[17] |= TRV_FLAG_REPLAYED;
      size_t none = 0;
      if (radio::send(TRV_FPORT_VITALS, stored, sizeof(stored), nullptr, &none) == radio::Result::Failed) break;
      storage::pop();
    }
    if (statusPending) sendStatus();
  }

  if (restart) {
    radio::saveSession();
    delay(200);
    ESP.restart();
  }
  sleepUntilNextCycle();
}

void loop() {
  // Never reached: every cycle ends in deep sleep.
}
