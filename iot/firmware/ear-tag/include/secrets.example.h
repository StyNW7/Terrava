#pragma once
// Copy to secrets.h (git-ignored) and replace with the values from your
// LoRaWAN network server (The Things Stack / ChirpStack) device registration.

#include <stdint.h>

// LoRaWAN 1.1 OTAA (for LoRaWAN 1.0.x, use the same key for NWK_KEY and APP_KEY).
#define LORAWAN_JOIN_EUI 0x0000000000000000ULL
#define LORAWAN_DEV_EUI 0x70B3D57ED0005A10ULL  // register this DevEUI on the Terrava Devices page too
#define LORAWAN_APP_KEY 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
#define LORAWAN_NWK_KEY 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00

// Regional plan: Indonesia uses AS923-2 (920-923 MHz).
#define LORAWAN_BAND AS923_2

// P2P mode: numeric device id, e.g. serial DEV-001 -> 1 (see protocol/PAYLOAD.md).
#define P2P_DEVICE_ID 1UL
