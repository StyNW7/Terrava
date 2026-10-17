#include "sensors.h"

#include <Adafruit_MLX90614.h>
#include <Adafruit_MPU6050.h>
#include <MAX30105.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <spo2_algorithm.h>
#include <sys/time.h>
#include <time.h>

#define XPOWERS_CHIP_AXP192
#include <XPowersLib.h>

#include "config.h"

namespace {

XPowersPMU pmu;
MAX30105 pulseOx;
Adafruit_MLX90614 irTemp;
Adafruit_MPU6050 imu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

bool pmuOk = false, pulseOk = false, tempOk = false, imuOk = false;

// Maxim's reference algorithm expects 32-bit buffers on 32-bit MCUs.
uint32_t irBuffer[HR_SAMPLE_COUNT];
uint32_t redBuffer[HR_SAMPLE_COUNT];

float readBodyTemperature(bool &fault) {
  if (!tempOk) {
    fault = true;
    return NAN;
  }
  // Average several readings; the IR sensor is noisy at the ear surface.
  float sum = 0;
  int valid = 0;
  for (int i = 0; i < 8; i++) {
    float t = irTemp.readObjectTempC();
    if (!isnan(t) && t > 20 && t < 45) {
      sum += t;
      valid++;
    }
    delay(40);
  }
  if (valid < 3) {
    fault = true;
    return NAN;
  }
  return (sum / valid) * TEMP_CAL_GAIN + TEMP_CAL_OFFSET_C;
}

void readHeart(VitalSample &out) {
  if (!pulseOk) {
    out.hrFault = true;
    return;
  }
  pulseOx.wakeUp();
  // ledBrightness, sampleAverage, ledMode (2 = red + IR), sampleRate, pulseWidth, adcRange
  pulseOx.setup(60, 4, 2, 100, 411, 4096);
  uint32_t deadline = millis() + 8000;
  for (int i = 0; i < HR_SAMPLE_COUNT && millis() < deadline; i++) {
    while (!pulseOx.available()) {
      pulseOx.check();
      if (millis() > deadline) break;
    }
    redBuffer[i] = pulseOx.getRed();
    irBuffer[i] = pulseOx.getIR();
    pulseOx.nextSample();
  }
  pulseOx.shutDown();

  // An IR level this low means the sensor is not touching skin.
  if (irBuffer[HR_SAMPLE_COUNT / 2] < 30000) {
    out.hrFault = true;
    return;
  }
  int32_t spo2 = 0, heartRate = 0;
  int8_t spo2Valid = 0, hrValid = 0;
  maxim_heart_rate_and_oxygen_saturation(irBuffer, HR_SAMPLE_COUNT, redBuffer, &spo2, &spo2Valid, &heartRate, &hrValid);
  // Cattle resting HR is 48-84 bpm; reject algorithm outliers.
  if (hrValid && heartRate >= 30 && heartRate <= 200) out.heartRate = (int16_t)heartRate;
  else out.hrFault = true;
  if (spo2Valid && spo2 >= 70 && spo2 <= 100) out.oxygen = (int16_t)spo2;
}

// Activity index and steps from the accelerometer: dynamic acceleration energy
// (gravity removed by a high-pass filter) scaled to 0-100, steps by peak detection.
void readActivity(VitalSample &out) {
  if (!imuOk) return;
  imu.enableSleep(false);
  delay(50);
  const uint32_t periodMs = 1000 / ACTIVITY_SAMPLE_HZ;
  const uint32_t end = millis() + ACTIVITY_WINDOW_MS;
  float gravity = 9.81f, energy = 0;
  bool above = false;
  uint32_t samples = 0, lastStep = 0;
  uint16_t steps = 0;
  while (millis() < end) {
    sensors_event_t a, g, t;
    imu.getEvent(&a, &g, &t);
    float magnitude = sqrtf(a.acceleration.x * a.acceleration.x + a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z);
    gravity = 0.95f * gravity + 0.05f * magnitude;
    float dynamic = fabsf(magnitude - gravity);
    energy += dynamic;
    samples++;
    // A step is a dynamic peak above 1.2 m/s^2, at most ~3 per second for cattle.
    if (dynamic > 1.2f && !above && millis() - lastStep > 330) {
      steps++;
      lastStep = millis();
      above = true;
    } else if (dynamic < 0.6f) {
      above = false;
    }
    delay(periodMs);
  }
  imu.enableSleep(true);
  float meanDynamic = samples ? energy / samples : 0;
  // ~0.05 m/s^2 lying down, ~1.5 m/s^2 walking briskly.
  out.activity = (uint8_t)constrain((int)roundf(meanDynamic / 1.5f * 100.0f), 0, 100);
  // Scale the window's steps to the whole reporting interval is done by the caller.
  out.steps = steps;
}

}  // namespace

namespace sensors {

bool begin() {
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, HIGH);  // LED is active low on the T-Beam
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  pmuOk = pmu.begin(Wire, AXP192_SLAVE_ADDRESS, PIN_I2C_SDA, PIN_I2C_SCL);
  if (pmuOk) {
    pmu.setLDO2Voltage(3300);  // LoRa radio
    pmu.enableLDO2();
    pmu.setDC1Voltage(3300);   // ESP32 / sensors rail
    pmu.enableDC1();
    pmu.enableBattVoltageMeasure();
    pmu.enableVbusVoltageMeasure();
  }
  pulseOk = pulseOx.begin(Wire, I2C_SPEED_FAST);
  tempOk = irTemp.begin();
  imuOk = imu.begin();
  if (imuOk) {
    imu.setAccelerometerRange(MPU6050_RANGE_4_G);
    imu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }
  Serial.printf("[sensors] pmu=%d max30102=%d mlx90614=%d mpu6050=%d\n", pmuOk, pulseOk, tempOk, imuOk);
  return pmuOk;
}

VitalSample measureVitals() {
  VitalSample out;
  out.temperatureC = readBodyTemperature(out.tempFault);
  readHeart(out);
  readActivity(out);
  return out;
}

GpsFix readGps(uint32_t timeoutMs) {
  GpsFix fix;
  if (pmuOk) {
    pmu.setLDO3Voltage(3300);  // GPS power
    pmu.enableLDO3();
  }
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  uint32_t deadline = millis() + timeoutMs;
  while (millis() < deadline) {
    while (gpsSerial.available()) gps.encode(gpsSerial.read());
    if (gps.location.isValid() && gps.location.age() < 2000 && gps.satellites.value() >= 4) break;
    delay(20);
  }
  if (gps.location.isValid()) {
    fix.valid = true;
    fix.latitude = gps.location.lat();
    fix.longitude = gps.location.lng();
  }
  if (gps.date.isValid() && gps.time.isValid() && gps.date.year() >= 2024) {
    struct tm t = {};
    t.tm_year = gps.date.year() - 1900;
    t.tm_mon = gps.date.month() - 1;
    t.tm_mday = gps.date.day();
    t.tm_hour = gps.time.hour();
    t.tm_min = gps.time.minute();
    t.tm_sec = gps.time.second();
    setenv("TZ", "UTC0", 1);
    tzset();
    time_t epoch = mktime(&t);
    fix.unixTime = (uint32_t)epoch;
    // Keep the RTC in sync; it survives deep sleep, so later wakes have a clock without GPS.
    struct timeval tv = {epoch, 0};
    settimeofday(&tv, nullptr);
  }
  gpsSerial.end();
  if (pmuOk) pmu.disableLDO3();
  return fix;
}

PowerState readPower() {
  PowerState p;
  if (!pmuOk) return p;
  p.batteryVolts = pmu.getBattVoltage() / 1000.0f;
  int percent = pmu.getBatteryPercent();
  if (percent < 0) {
    // Fall back to a Li-ion discharge approximation (3.3 V empty, 4.15 V full).
    percent = (int)roundf((p.batteryVolts - 3.3f) / (4.15f - 3.3f) * 100.0f);
  }
  p.batteryPercent = (uint8_t)constrain(percent, 0, 100);
  p.charging = pmu.isCharging();
  return p;
}

void sleep() {
  if (pulseOk) pulseOx.shutDown();
  if (imuOk) imu.enableSleep(true);
  if (pmuOk) pmu.disableLDO3();
  digitalWrite(PIN_LED, HIGH);
}

void blink(uint8_t times) {
  for (uint8_t i = 0; i < times; i++) {
    digitalWrite(PIN_LED, LOW);
    delay(150);
    digitalWrite(PIN_LED, HIGH);
    delay(150);
  }
}

}  // namespace sensors
