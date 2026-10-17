#include "storage.h"

#include <LittleFS.h>

#include "config.h"

namespace {

const char *DATA_PATH = "/buffer.bin";
const char *HEAD_PATH = "/buffer.head";
bool mounted = false;

uint32_t readHead() {
  File f = LittleFS.open(HEAD_PATH, "r");
  if (!f) return 0;
  uint32_t head = 0;
  f.read(reinterpret_cast<uint8_t *>(&head), sizeof(head));
  f.close();
  return head;
}

void writeHead(uint32_t head) {
  File f = LittleFS.open(HEAD_PATH, "w");
  if (!f) return;
  f.write(reinterpret_cast<const uint8_t *>(&head), sizeof(head));
  f.close();
}

size_t fileRecords() {
  File f = LittleFS.open(DATA_PATH, "r");
  if (!f) return 0;
  size_t n = f.size() / TRV_VITALS_LEN;
  f.close();
  return n;
}

// Drop already-delivered records from the front of the file.
void compact(uint32_t head) {
  File in = LittleFS.open(DATA_PATH, "r");
  File out = LittleFS.open("/buffer.tmp", "w");
  if (!in || !out) return;
  in.seek(head * TRV_VITALS_LEN);
  uint8_t record[TRV_VITALS_LEN];
  while (in.read(record, TRV_VITALS_LEN) == TRV_VITALS_LEN) out.write(record, TRV_VITALS_LEN);
  in.close();
  out.close();
  LittleFS.remove(DATA_PATH);
  LittleFS.rename("/buffer.tmp", DATA_PATH);
  writeHead(0);
}

}  // namespace

namespace storage {

bool begin() {
  mounted = LittleFS.begin(true);  // format on first use
  return mounted;
}

size_t count() {
  if (!mounted) return 0;
  size_t total = fileRecords();
  uint32_t head = readHead();
  return total > head ? total - head : 0;
}

bool push(const uint8_t payload[TRV_VITALS_LEN]) {
  if (!mounted) return false;
  if (count() >= BUFFER_MAX_RECORDS) {
    // Full: drop the oldest reading so the most recent history is kept.
    pop();
  }
  File f = LittleFS.open(DATA_PATH, "a");
  if (!f) return false;
  bool ok = f.write(payload, TRV_VITALS_LEN) == TRV_VITALS_LEN;
  f.close();
  return ok;
}

bool peek(uint8_t out[TRV_VITALS_LEN]) {
  if (count() == 0) return false;
  File f = LittleFS.open(DATA_PATH, "r");
  if (!f) return false;
  f.seek(readHead() * TRV_VITALS_LEN);
  bool ok = f.read(out, TRV_VITALS_LEN) == TRV_VITALS_LEN;
  f.close();
  return ok;
}

void pop() {
  if (count() == 0) return;
  uint32_t head = readHead() + 1;
  if (head >= fileRecords()) {
    LittleFS.remove(DATA_PATH);
    writeHead(0);
  } else if (head > 256) {
    compact(head);
  } else {
    writeHead(head);
  }
}

}  // namespace storage
