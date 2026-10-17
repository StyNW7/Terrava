/** Temperature-Humidity Index for cattle; above ~72 animals start to feel heat stress. */
export function temperatureHumidityIndex(temperature: number, humidity: number): number {
  return Math.round((0.8 * temperature + (humidity / 100) * (temperature - 14.4) + 46.4) * 10) / 10;
}

export type ThiBand = 'normal' | 'mild' | 'moderate' | 'severe';

export function thiBand(thi: number): ThiBand {
  if (thi < 72) return 'normal';
  if (thi < 80) return 'mild';
  if (thi < 90) return 'moderate';
  return 'severe';
}

/** Normalise LoRa RSSI (dBm) and SNR (dB) into a 0-100 link-quality figure. */
export function signalQuality(rssi?: number | null, snr?: number | null): number {
  if (rssi == null) return 0;
  // -120 dBm (edge of sensitivity) -> 0, -40 dBm (very strong) -> 100.
  const rssiScore = Math.min(100, Math.max(0, ((rssi + 120) / 80) * 100));
  if (snr == null) return Math.round(rssiScore);
  // SNR -20 dB -> 0, +10 dB -> 100.
  const snrScore = Math.min(100, Math.max(0, ((snr + 20) / 30) * 100));
  return Math.round(rssiScore * 0.7 + snrScore * 0.3);
}
