import type { TelemetryReadingDto } from './telemetry.dto';

/**
 * The Things Network (TTS v3) webhook uplink, trimmed to the fields we use.
 * `decoded_payload` is produced by the payload formatter in
 * iot/protocol/ttn-decoder.js.
 */
export interface TtnUplink {
  end_device_ids?: { device_id?: string; dev_eui?: string };
  received_at?: string;
  uplink_message?: {
    f_cnt?: number;
    f_port?: number;
    decoded_payload?: Record<string, unknown>;
    rx_metadata?: { rssi?: number; channel_rssi?: number; snr?: number }[];
    settings?: { time?: string };
  };
}

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const int = (value: unknown) => {
  const n = num(value);
  return n === undefined ? undefined : Math.round(n);
};

export function mapTtnUplink(uplink: TtnUplink): TelemetryReadingDto | null {
  const message = uplink.uplink_message;
  const decoded = message?.decoded_payload;
  const devEui = uplink.end_device_ids?.dev_eui;
  if (!message || !decoded || !devEui) return null;
  if (decoded.type && decoded.type !== 'vitals') return null;

  // Best gateway reception wins.
  const best = [...(message.rx_metadata ?? [])].sort(
    (a, b) => (b.rssi ?? b.channel_rssi ?? -999) - (a.rssi ?? a.channel_rssi ?? -999),
  )[0];
  return {
    devEui: devEui.toUpperCase(),
    recordedAt: typeof decoded.timestamp === 'string' ? decoded.timestamp : uplink.received_at,
    sequence: int(decoded.sequence) ?? message.f_cnt,
    temperature: num(decoded.temperature),
    heartRate: int(decoded.heartRate),
    oxygen: int(decoded.oxygen),
    activity: int(decoded.activity),
    steps: int(decoded.steps),
    latitude: num(decoded.latitude),
    longitude: num(decoded.longitude),
    battery: int(decoded.battery),
    rssi: int(best?.rssi ?? best?.channel_rssi),
    snr: num(best?.snr),
    firmware: typeof decoded.firmware === 'string' ? decoded.firmware : undefined,
  };
}
