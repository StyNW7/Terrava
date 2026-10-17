// Host-side tests of protocol/terrava_payload.h against protocol/test-vectors.json.
// Run with: pio test -e native   (requires a host C/C++ compiler)
#include <math.h>
#include <stdio.h>
#include <string.h>
#include <unity.h>

#include "terrava_payload.h"

static void hex(const char *s, uint8_t *out, size_t *len) {
  *len = strlen(s) / 2;
  for (size_t i = 0; i < *len; i++) sscanf(s + 2 * i, "%2hhx", &out[i]);
}

void setUp() {}
void tearDown() {}

void test_vitals_vector_with_gps() {
  trv_vitals_t v = {};
  v.temperature = 38.65f;
  v.heart_rate = 72;
  v.oxygen = 97;
  v.activity = 64;
  v.steps = 412;
  v.has_fix = true;
  v.latitude = -7.531204;
  v.longitude = 110.602113;
  v.battery = 84;
  v.timestamp = 1792216800;
  uint8_t out[TRV_VITALS_LEN], expected[32];
  size_t n;
  trv_encode_vitals(&v, out);
  hex("110f19486140019cff8d153c0697a78154016ad30ee0", expected, &n);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(expected, out, TRV_VITALS_LEN);

  trv_vitals_t back;
  TEST_ASSERT_TRUE(trv_decode_vitals(out, sizeof(out), &back));
  TEST_ASSERT_FLOAT_WITHIN(0.001, 38.65, back.temperature);
  TEST_ASSERT_TRUE(back.has_fix);
}

void test_vitals_vector_without_fix() {
  trv_vitals_t v = {};
  v.temperature = 40.82f;
  v.heart_rate = 112;
  v.oxygen = 94;
  v.activity = 18;
  v.steps = 35;
  v.battery = 61;
  v.timestamp = 1792220400;
  uint8_t out[TRV_VITALS_LEN], expected[32];
  size_t n;
  trv_encode_vitals(&v, out);
  hex("110ff2705e1200237fffffff7fffffff3d006ad31cf0", expected, &n);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(expected, out, TRV_VITALS_LEN);
}

void test_set_interval_command() {
  uint8_t in[8];
  size_t n;
  hex("03030258", in, &n);
  trv_command_t cmd;
  TEST_ASSERT_TRUE(trv_decode_command(in, n, &cmd));
  TEST_ASSERT_EQUAL(TRV_CMD_SET_INTERVAL, cmd.code);
  TEST_ASSERT_EQUAL(600, cmd.interval_s);
  uint8_t out[8];
  TEST_ASSERT_EQUAL(4, trv_encode_command(&cmd, out, sizeof(out)));
  TEST_ASSERT_EQUAL_UINT8_ARRAY(in, out, 4);
}

void test_crc_and_p2p_frame() {
  TEST_ASSERT_EQUAL_HEX16(0x29B1, trv_crc16((const uint8_t *)"123456789", 9));
  uint8_t payload[3] = {1, 2, 3}, frame[32];
  size_t len = trv_p2p_frame(13, 7, payload, sizeof(payload), frame, sizeof(frame));
  uint32_t id;
  uint16_t fcnt;
  const uint8_t *p;
  size_t plen;
  TEST_ASSERT_TRUE(trv_p2p_unframe(frame, len, &id, &fcnt, &p, &plen));
  TEST_ASSERT_EQUAL(13, id);
  TEST_ASSERT_EQUAL(7, fcnt);
  frame[8] ^= 0xFF;
  TEST_ASSERT_FALSE(trv_p2p_unframe(frame, len, &id, &fcnt, &p, &plen));
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_vitals_vector_with_gps);
  RUN_TEST(test_vitals_vector_without_fix);
  RUN_TEST(test_set_interval_command);
  RUN_TEST(test_crc_and_p2p_frame);
  return UNITY_END();
}
