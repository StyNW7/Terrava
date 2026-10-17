/*
 * Terrava ear tag payload protocol v1 — header-only C/C++ implementation.
 * Spec: iot/protocol/PAYLOAD.md. Verified against test-vectors.json.
 *
 * No dynamic allocation, no dependencies beyond <stdint.h>/<string.h>, so it
 * builds for ESP32, nRF52, STM32 or a desktop test harness alike.
 */
#ifndef TERRAVA_PAYLOAD_H
#define TERRAVA_PAYLOAD_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

#define TRV_VERSION 1
#define TRV_TYPE_VITALS 1
#define TRV_TYPE_STATUS 2
#define TRV_TYPE_ENVIRONMENT 3

#define TRV_FPORT_VITALS 1
#define TRV_FPORT_STATUS 2
#define TRV_FPORT_ENVIRONMENT 3
#define TRV_FPORT_COMMANDS 10

#define TRV_VITALS_LEN 22
#define TRV_STATUS_LEN 13
#define TRV_ENV_LEN 8

#define TRV_NA_U8 0xFF
#define TRV_NA_U16 0xFFFF
#define TRV_NO_FIX 0x7FFFFFFF

#define TRV_FLAG_GPS_FIX (1u << 0)
#define TRV_FLAG_CHARGING (1u << 1)
#define TRV_FLAG_REPLAYED (1u << 2)
#define TRV_FLAG_TEMP_FAULT (1u << 3)
#define TRV_FLAG_HR_FAULT (1u << 4)
#define TRV_FLAG_LOW_POWER (1u << 5)

#define TRV_CMD_RESTART 0x01
#define TRV_CMD_DIAGNOSTICS 0x02
#define TRV_CMD_SET_INTERVAL 0x03
#define TRV_CMD_LOCATE 0x04
#define TRV_CMD_FIRMWARE_UPDATE 0x05

#define TRV_P2P_MAGIC 0xA5
#define TRV_P2P_OVERHEAD 9 /* magic(1) + id(4) + fcnt(2) + crc(2) */

typedef struct {
  float temperature;   /* °C, NAN or < 0 when unavailable */
  int16_t heart_rate;  /* bpm, -1 when unavailable */
  int16_t oxygen;      /* %, -1 when unavailable */
  uint8_t activity;    /* 0-100 */
  uint16_t steps;
  bool has_fix;
  double latitude;
  double longitude;
  uint8_t battery;     /* % */
  uint8_t flags;       /* TRV_FLAG_* (GPS fix bit is set automatically) */
  uint32_t timestamp;  /* Unix seconds, 0 = use receive time */
} trv_vitals_t;

typedef struct {
  uint8_t fw_major, fw_minor, fw_patch;
  uint16_t uptime_hours;
  uint16_t report_interval;
  uint8_t battery;
  uint16_t buffered;
  uint8_t last_cmd_seq;
  uint8_t last_cmd_result; /* 0 ok, 1 rejected, 2 failed */
} trv_status_t;

typedef struct {
  uint8_t code;
  uint8_t seq;
  uint32_t interval_s;  /* TRV_CMD_SET_INTERVAL */
  uint8_t version[3];   /* TRV_CMD_FIRMWARE_UPDATE */
} trv_command_t;

/* ---- big-endian helpers ------------------------------------------------- */

static inline void trv_put_u16(uint8_t *p, uint16_t v) { p[0] = (uint8_t)(v >> 8); p[1] = (uint8_t)v; }
static inline void trv_put_u32(uint8_t *p, uint32_t v) {
  p[0] = (uint8_t)(v >> 24); p[1] = (uint8_t)(v >> 16); p[2] = (uint8_t)(v >> 8); p[3] = (uint8_t)v;
}
static inline uint16_t trv_get_u16(const uint8_t *p) { return (uint16_t)((p[0] << 8) | p[1]); }
static inline uint32_t trv_get_u32(const uint8_t *p) {
  return ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16) | ((uint32_t)p[2] << 8) | (uint32_t)p[3];
}
static inline long trv_round(double v) { return (long)(v < 0 ? v - 0.5 : v + 0.5); }
static inline long trv_clamp(long v, long lo, long hi) { return v < lo ? lo : (v > hi ? hi : v); }

/* ---- uplinks -------------------------------------------------------------- */

/* Writes 22 bytes into out. Returns the length. */
static inline size_t trv_encode_vitals(const trv_vitals_t *v, uint8_t out[TRV_VITALS_LEN]) {
  out[0] = (TRV_VERSION << 4) | TRV_TYPE_VITALS;
  bool temp_ok = v->temperature == v->temperature && v->temperature > 0; /* NaN check */
  trv_put_u16(out + 1, temp_ok ? (uint16_t)trv_clamp(trv_round(v->temperature * 100.0), 0, 0xFFFE) : TRV_NA_U16);
  out[3] = v->heart_rate < 0 ? TRV_NA_U8 : (uint8_t)trv_clamp(v->heart_rate, 0, 0xFE);
  out[4] = v->oxygen < 0 ? TRV_NA_U8 : (uint8_t)trv_clamp(v->oxygen, 0, 100);
  out[5] = (uint8_t)trv_clamp(v->activity, 0, 100);
  trv_put_u16(out + 6, v->steps);
  trv_put_u32(out + 8, v->has_fix ? (uint32_t)(int32_t)trv_round(v->latitude * 1e6) : TRV_NO_FIX);
  trv_put_u32(out + 12, v->has_fix ? (uint32_t)(int32_t)trv_round(v->longitude * 1e6) : TRV_NO_FIX);
  out[16] = (uint8_t)trv_clamp(v->battery, 0, 100);
  out[17] = v->has_fix ? (uint8_t)(v->flags | TRV_FLAG_GPS_FIX) : (uint8_t)(v->flags & ~TRV_FLAG_GPS_FIX);
  trv_put_u32(out + 18, v->timestamp);
  return TRV_VITALS_LEN;
}

static inline bool trv_decode_vitals(const uint8_t *in, size_t len, trv_vitals_t *v) {
  if (len != TRV_VITALS_LEN || in[0] != ((TRV_VERSION << 4) | TRV_TYPE_VITALS)) return false;
  uint16_t t = trv_get_u16(in + 1);
  int32_t lat = (int32_t)trv_get_u32(in + 8), lng = (int32_t)trv_get_u32(in + 12);
  v->temperature = t == TRV_NA_U16 ? -1.0f : t / 100.0f;
  v->heart_rate = in[3] == TRV_NA_U8 ? -1 : in[3];
  v->oxygen = in[4] == TRV_NA_U8 ? -1 : in[4];
  v->activity = in[5];
  v->steps = trv_get_u16(in + 6);
  v->has_fix = lat != TRV_NO_FIX && lng != TRV_NO_FIX;
  v->latitude = v->has_fix ? lat / 1e6 : 0;
  v->longitude = v->has_fix ? lng / 1e6 : 0;
  v->battery = in[16];
  v->flags = in[17];
  v->timestamp = trv_get_u32(in + 18);
  return true;
}

static inline size_t trv_encode_status(const trv_status_t *s, uint8_t out[TRV_STATUS_LEN]) {
  out[0] = (TRV_VERSION << 4) | TRV_TYPE_STATUS;
  out[1] = s->fw_major; out[2] = s->fw_minor; out[3] = s->fw_patch;
  trv_put_u16(out + 4, s->uptime_hours);
  trv_put_u16(out + 6, s->report_interval);
  out[8] = s->battery;
  trv_put_u16(out + 9, s->buffered);
  out[11] = s->last_cmd_seq;
  out[12] = s->last_cmd_result;
  return TRV_STATUS_LEN;
}

static inline size_t trv_encode_environment(float temperature, float humidity, uint8_t battery, uint8_t out[TRV_ENV_LEN]) {
  out[0] = (TRV_VERSION << 4) | TRV_TYPE_ENVIRONMENT;
  trv_put_u16(out + 1, (uint16_t)(int16_t)trv_round(temperature * 100.0));
  trv_put_u16(out + 3, (uint16_t)trv_clamp(trv_round(humidity * 100.0), 0, 10000));
  out[5] = battery;
  out[6] = 0; out[7] = 0;
  return TRV_ENV_LEN;
}

/* ---- downlinks ------------------------------------------------------------ */

static inline bool trv_decode_command(const uint8_t *in, size_t len, trv_command_t *cmd) {
  if (len < 2 || in[0] < TRV_CMD_RESTART || in[0] > TRV_CMD_FIRMWARE_UPDATE) return false;
  memset(cmd, 0, sizeof(*cmd));
  cmd->code = in[0];
  cmd->seq = in[1];
  if (cmd->code == TRV_CMD_SET_INTERVAL) {
    if (len < 4) return false;
    uint16_t raw = trv_get_u16(in + 2);
    cmd->interval_s = (raw & 0x8000) ? (uint32_t)(raw & 0x7FFF) * 60u : raw;
    if (cmd->interval_s < 30 || cmd->interval_s > 86400) return false;
  } else if (cmd->code == TRV_CMD_FIRMWARE_UPDATE) {
    if (len < 5) return false;
    memcpy(cmd->version, in + 2, 3);
  }
  return true;
}

static inline size_t trv_encode_command(const trv_command_t *cmd, uint8_t *out, size_t cap) {
  if (cap < 5) return 0;
  out[0] = cmd->code;
  out[1] = cmd->seq;
  if (cmd->code == TRV_CMD_SET_INTERVAL) {
    uint16_t raw = cmd->interval_s <= 0x7FFF ? (uint16_t)cmd->interval_s : (uint16_t)(0x8000 | (cmd->interval_s / 60));
    trv_put_u16(out + 2, raw);
    return 4;
  }
  if (cmd->code == TRV_CMD_FIRMWARE_UPDATE) {
    memcpy(out + 2, cmd->version, 3);
    return 5;
  }
  return 2;
}

/* ---- P2P framing (LoRa without LoRaWAN) ----------------------------------- */

static inline uint16_t trv_crc16(const uint8_t *data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (int b = 0; b < 8; b++) crc = (crc & 0x8000) ? (uint16_t)((crc << 1) ^ 0x1021) : (uint16_t)(crc << 1);
  }
  return crc;
}

/* Returns the frame length, or 0 if cap is too small. */
static inline size_t trv_p2p_frame(uint32_t device_id, uint16_t fcnt, const uint8_t *payload, size_t len, uint8_t *out, size_t cap) {
  if (cap < len + TRV_P2P_OVERHEAD) return 0;
  out[0] = TRV_P2P_MAGIC;
  trv_put_u32(out + 1, device_id);
  trv_put_u16(out + 5, fcnt);
  memcpy(out + 7, payload, len);
  trv_put_u16(out + 7 + len, trv_crc16(out, 7 + len));
  return len + TRV_P2P_OVERHEAD;
}

/* Validates magic and CRC; on success points *payload into frame. */
static inline bool trv_p2p_unframe(const uint8_t *frame, size_t len, uint32_t *device_id, uint16_t *fcnt, const uint8_t **payload, size_t *payload_len) {
  if (len < TRV_P2P_OVERHEAD || frame[0] != TRV_P2P_MAGIC) return false;
  if (trv_crc16(frame, len - 2) != trv_get_u16(frame + len - 2)) return false;
  *device_id = trv_get_u32(frame + 1);
  *fcnt = trv_get_u16(frame + 5);
  *payload = frame + 7;
  *payload_len = len - TRV_P2P_OVERHEAD;
  return true;
}

#ifdef __cplusplus
}
#endif

#endif /* TERRAVA_PAYLOAD_H */
