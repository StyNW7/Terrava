# Menggunakan Terrava / Using Terrava

## Alur kerja Terrava
Smart ear tag merekam suhu, detak jantung, oksigen, aktivitas, dan lokasi → dikirim lewat LoRa ke gateway → cloud Terrava menyimpan dan menganalisis dengan AI → dashboard dan alert → peternak bertindak. Data dikirim berkala (default tiap 5 menit) dan disimpan sementara di memori ear tag bila sinyal hilang.

## How Terrava works
The smart ear tag records temperature, heart rate, oxygen, activity and location → sends it over LoRa to a gateway → the Terrava cloud stores and analyses it with AI → dashboard and alerts → the farmer acts. Data is sent periodically (every 5 minutes by default) and buffered in the tag's flash memory if the signal drops.

## Halaman dashboard / Dashboard pages
- Dashboard Overview: KPI ternak, tren kesehatan, alert, perangkat bermasalah, rekomendasi AI, tugas / herd KPIs, health trend, alerts, device issues, AI recommendations, tasks.
- Livestock: daftar, filter, detail ternak (tanda vital, rekam medis, lokasi, perangkat, timeline) / list, filters, animal detail.
- Live Monitoring: tanda vital real-time dan ternak yang melewati ambang batas / live vitals and threshold breaches; Control Room Mode untuk layar besar.
- Alerts Center: acknowledge, resolve, assign, catatan, buat tugas / acknowledge, resolve, assign, notes, create task.
- AI Insights: wawasan per kategori dan prioritas; tandai ditinjau, abaikan, atau jadikan tugas.
- Farm Map: posisi ternak, gateway, dan geofence / animal positions, gateways and geofences.
- Devices: ear tag dan gateway, baterai, sinyal, firmware, restart, diagnostik, maintenance.
- Reports: 6 laporan (kesehatan, alert, perangkat, operasional, lingkungan/THI, staf) dalam PDF/CSV dan bisa dijadwalkan.
- Settings: profil, notifikasi, ambang batas alert, tampilan, keamanan, privasi data.

## Arti tingkat keparahan alert / Alert severity
Info = informasi; Warning = perlu dipantau; High = tangani hari ini; Critical = tangani segera. Alert otomatis selesai (auto-resolve) bila kondisi kembali normal, dan naik tingkat (eskalasi) bila memburuk.

Info = for information; Warning = keep an eye on it; High = handle today; Critical = act now. Alerts auto-resolve when the condition returns to normal and escalate if it worsens.

## Ambang batas alert / Alert thresholds
Default: suhu tinggi 39,5 °C, suhu rendah 37,5 °C, detak jantung 100 bpm, penurunan aktivitas 30%, baterai 20%, sinyal 25%, durasi keluar geofence 15 menit. Ubah di Settings → Alert Thresholds (hanya Owner).

Defaults: high temperature 39.5 °C, low temperature 37.5 °C, heart rate 100 bpm, activity drop 30%, battery 20%, signal 25%, time outside geofence 15 minutes. Change them in Settings → Alert Thresholds (Owner only).

## Peran pengguna / User roles
Owner (akses penuh), Farm Manager, Operational, Staff, Veterinarian, Cooperative Admin, Viewer (hanya lihat). Hanya Owner yang bisa mengubah pengaturan organisasi.
