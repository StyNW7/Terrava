#pragma once
#include <Arduino.h>

// Radio abstraction: LoRaWAN (OTAA, session kept across deep sleep) or
// LoRa point-to-point with the Terrava gateway, selected at build time.
namespace radio {

enum class Result { Sent, SentWithDownlink, Failed };

bool begin();

// Send one uplink on fPort; if a downlink arrives in the receive window it is
// copied to downlink (up to *downlinkLen bytes) and *downlinkLen is updated.
Result send(uint8_t fport, const uint8_t *data, size_t len, uint8_t *downlink, size_t *downlinkLen);

// Persist session state into RTC memory before deep sleep.
void saveSession();

// Time on air budget remaining is handled by the stack; this reports join state.
bool joined();

}  // namespace radio
