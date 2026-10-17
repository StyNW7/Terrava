#pragma once
#include <Arduino.h>

#include "terrava_payload.h"

// Flash-backed FIFO of vitals payloads that could not be delivered (no gateway in
// range, network down). Survives deep sleep and power loss; replayed oldest first
// with the "replayed" flag so the backend knows they are historical.
namespace storage {

bool begin();
bool push(const uint8_t payload[TRV_VITALS_LEN]);
bool peek(uint8_t out[TRV_VITALS_LEN]);
void pop();
size_t count();

}  // namespace storage
