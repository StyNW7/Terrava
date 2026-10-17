/**
 * Terrava payload formatter for The Things Stack (TTN v3) and ChirpStack v4.
 *
 * Paste into: Console -> Applications -> Payload formatters -> Custom JavaScript.
 * The decoded uplink matches what the Terrava backend expects on
 * POST /api/v1/ingest/ttn (see backend/src/modules/telemetry/ttn.mapper.ts).
 *
 * Protocol: iot/protocol/PAYLOAD.md (v1).
 */

var COMMANDS = { restart: 1, 'run-diagnostics': 2, 'set-interval': 3, locate: 4, 'firmware-update': 5 };
var COMMAND_NAMES = { 1: 'restart', 2: 'run-diagnostics', 3: 'set-interval', 4: 'locate', 5: 'firmware-update' };

function u16(b, i) { return (b[i] << 8) | b[i + 1]; }
function i16(b, i) { var v = u16(b, i); return v & 0x8000 ? v - 0x10000 : v; }
function u32(b, i) { return ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3]; }
function i32(b, i) { return (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]; }

function decodeUplink(input) {
  var b = input.bytes;
  if (!b || b.length === 0) return { errors: ['empty payload'] };
  var version = b[0] >> 4;
  var type = b[0] & 0x0f;
  if (version !== 1) return { errors: ['unsupported protocol version ' + version] };

  if (type === 1) {
    if (b.length !== 22) return { errors: ['vitals payload must be 22 bytes'] };
    var t = u16(b, 1), hr = b[3], ox = b[4], lat = i32(b, 8), lng = i32(b, 12), ts = u32(b, 18);
    var fix = lat !== 0x7fffffff && lng !== 0x7fffffff;
    var flags = b[17];
    var data = {
      type: 'vitals',
      temperature: t === 0xffff ? null : t / 100,
      heartRate: hr === 0xff ? null : hr,
      oxygen: ox === 0xff ? null : ox,
      activity: b[5],
      steps: u16(b, 6),
      latitude: fix ? lat / 1e6 : null,
      longitude: fix ? lng / 1e6 : null,
      battery: b[16],
      flags: {
        gpsFix: !!(flags & 1),
        charging: !!(flags & 2),
        replayed: !!(flags & 4),
        temperatureFault: !!(flags & 8),
        heartRateFault: !!(flags & 16),
        lowPower: !!(flags & 32),
      },
      timestamp: ts ? new Date(ts * 1000).toISOString() : null,
    };
    var warnings = [];
    if (data.flags.temperatureFault) warnings.push('temperature sensor fault');
    if (data.flags.heartRateFault) warnings.push('heart-rate sensor fault');
    return { data: data, warnings: warnings };
  }

  if (type === 2) {
    if (b.length !== 13) return { errors: ['status payload must be 13 bytes'] };
    return {
      data: {
        type: 'status',
        firmware: 'v' + b[1] + '.' + b[2] + '.' + b[3],
        uptimeHours: u16(b, 4),
        reportInterval: u16(b, 6),
        battery: b[8],
        buffered: u16(b, 9),
        lastCommandSeq: b[11],
        lastCommandResult: ['ok', 'rejected', 'failed'][b[12]] || 'unknown',
      },
    };
  }

  if (type === 3) {
    if (b.length !== 8) return { errors: ['environment payload must be 8 bytes'] };
    return { data: { type: 'environment', temperature: i16(b, 1) / 100, humidity: u16(b, 3) / 100, battery: b[5] } };
  }

  return { errors: ['unknown message type ' + type] };
}

function encodeDownlink(input) {
  var d = input.data || {};
  var code = COMMANDS[d.command];
  if (!code) return { errors: ['unknown command ' + d.command] };
  var bytes = [code, (d.seq || 0) & 0xff];
  if (d.command === 'set-interval') {
    var s = Number(d.interval);
    if (!(s >= 30 && s <= 86400)) return { errors: ['interval must be 30-86400 seconds'] };
    var raw = s <= 0x7fff ? s : 0x8000 | Math.floor(s / 60);
    bytes.push((raw >> 8) & 0xff, raw & 0xff);
  } else if (d.command === 'firmware-update') {
    var parts = String(d.version || '0.0.0').replace(/^v/, '').split('.');
    for (var i = 0; i < 3; i++) bytes.push(Number(parts[i] || 0) & 0xff);
  }
  return { bytes: bytes, fPort: 10 };
}

function decodeDownlink(input) {
  var b = input.bytes;
  var name = COMMAND_NAMES[b[0]];
  if (!name || b.length < 2) return { errors: ['invalid command'] };
  var data = { command: name, seq: b[1] };
  if (name === 'set-interval') {
    var raw = u16(b, 2);
    data.interval = raw & 0x8000 ? (raw & 0x7fff) * 60 : raw;
  } else if (name === 'firmware-update') {
    data.version = 'v' + b[2] + '.' + b[3] + '.' + b[4];
  }
  return { data: data };
}

// Allow `require()` in tests and Node tooling; ignored by TTN / ChirpStack.
if (typeof module !== 'undefined') module.exports = { decodeUplink: decodeUplink, encodeDownlink: encodeDownlink, decodeDownlink: decodeDownlink };
