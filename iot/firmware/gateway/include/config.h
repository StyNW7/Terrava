#pragma once

#define GATEWAY_FIRMWARE "v1.8.2"

// SX1276 on TTGO LoRa32 v2.1
#define PIN_LORA_SCK 5
#define PIN_LORA_MISO 19
#define PIN_LORA_MOSI 27
#define PIN_LORA_CS 18
#define PIN_LORA_RST 23
#define PIN_LORA_DIO0 26
#define PIN_LORA_DIO1 33
#define PIN_LED 25

// Must match the ear tag P2P settings (iot/firmware/ear-tag/include/config.h).
#define P2P_FREQUENCY_MHZ 921.4f
#define P2P_BANDWIDTH_KHZ 125.0f
#define P2P_SPREADING_FACTOR 9
#define P2P_CODING_RATE 7
#define P2P_SYNC_WORD 0x12
#define P2P_TX_POWER_DBM 17

#define FORWARD_EVERY_MS 10000UL     // batch uplinks to the backend
#define FORWARD_BATCH_MAX 40
#define COMMAND_POLL_EVERY_MS 30000UL
#define HEARTBEAT_EVERY_MS 60000UL
#define QUEUE_CAPACITY 400           // readings kept in RAM while the backhaul is down
#define DOWNLINK_DELAY_MS 150        // tags open a 2 s receive window right after transmitting

#if __has_include("secrets.h")
#include "secrets.h"
#else
#warning "include/secrets.h not found - using placeholder settings from secrets.example.h"
#include "secrets.example.h"
#endif
