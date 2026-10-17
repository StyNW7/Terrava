#pragma once
#include <Arduino.h>

struct VitalSample {
  float temperatureC = NAN;  // calibrated core-equivalent body temperature
  int16_t heartRate = -1;    // bpm, -1 if not measured
  int16_t oxygen = -1;       // SpO2 %, -1 if not measured
  uint8_t activity = 0;      // 0-100 index
  uint16_t steps = 0;
  bool tempFault = false;
  bool hrFault = false;
};

struct GpsFix {
  bool valid = false;
  double latitude = 0;
  double longitude = 0;
  uint32_t unixTime = 0;  // from GPS date/time when available
};

struct PowerState {
  uint8_t batteryPercent = 0;
  float batteryVolts = 0;
  bool charging = false;
};

namespace sensors {

// Power up the PMU rails, I2C bus and sensors. Returns false only on a PMU failure.
bool begin();

// Body temperature, heart rate / SpO2 and an activity window. Blocks ~15 s.
VitalSample measureVitals();

// Try for a GPS fix within timeoutMs (keeps the receiver powered only while needed).
GpsFix readGps(uint32_t timeoutMs);

PowerState readPower();

// Cut power to GPS and put sensors into their lowest-power modes before deep sleep.
void sleep();

// Blink the status LED (used by the locate command).
void blink(uint8_t times);

}  // namespace sensors
