#pragma once
// Terrava ear tag configuration. Pin map for LilyGO T-Beam v1.1 / v1.2.

#include <stdint.h>

#define TERRAVA_FW_MAJOR 2
#define TERRAVA_FW_MINOR 4
#define TERRAVA_FW_PATCH 1

// ---- Radio (SX1276) ---------------------------------------------------------
#define PIN_LORA_SCK 5
#define PIN_LORA_MISO 19
#define PIN_LORA_MOSI 27
#define PIN_LORA_CS 18
#define PIN_LORA_RST 23
#define PIN_LORA_DIO0 26
#define PIN_LORA_DIO1 33

// LoRa P2P parameters (must match the Terrava gateway firmware).
#define P2P_FREQUENCY_MHZ 921.4f  // inside Indonesia's 920-923 MHz band
#define P2P_BANDWIDTH_KHZ 125.0f
#define P2P_SPREADING_FACTOR 9
#define P2P_CODING_RATE 7
#define P2P_SYNC_WORD 0x12  // private network
#define P2P_TX_POWER_DBM 14
#define P2P_DOWNLINK_WINDOW_MS 2000

// ---- GPS (u-blox on UART1) --------------------------------------------------
#define PIN_GPS_RX 34
#define PIN_GPS_TX 12
#define GPS_BAUD 9600
#define GPS_FIX_TIMEOUT_MS 45000UL     // first fix after cold start can take a while
#define GPS_REFIX_TIMEOUT_MS 15000UL   // warm fix on later wakes
#define GPS_EVERY_N_CYCLES 3           // save power: position every 3rd reading

// ---- I2C sensors and PMU -----------------------------------------------------
#define PIN_I2C_SDA 21
#define PIN_I2C_SCL 22
#define PIN_LED 4

// ---- Measurement -------------------------------------------------------------
#define DEFAULT_REPORT_INTERVAL_S 300   // matches the backend default
#define MIN_REPORT_INTERVAL_S 30
#define MAX_REPORT_INTERVAL_S 86400
#define HR_SAMPLE_COUNT 100             // 4 s at 25 Hz effective rate for the Maxim algorithm
#define ACTIVITY_WINDOW_MS 10000UL      // accelerometer sampling window per wake
#define ACTIVITY_SAMPLE_HZ 25

// Ear-surface IR temperature runs below core body temperature; linear calibration
// fitted against rectal readings during the pilot (adjust per breed / climate).
#define TEMP_CAL_GAIN 1.0f
#define TEMP_CAL_OFFSET_C 1.6f

// ---- Buffering ---------------------------------------------------------------
#define BUFFER_MAX_RECORDS 2000         // ~7 days at 5-minute intervals
#define BUFFER_FLUSH_PER_WAKE 6         // replay at most N stored readings per wake

// ---- Credentials ---------------------------------------------------------------
// Copy include/secrets.example.h to include/secrets.h and fill in your keys.
#if __has_include("secrets.h")
#include "secrets.h"
#else
#warning "include/secrets.h not found - using placeholder keys from secrets.example.h"
#include "secrets.example.h"
#endif
