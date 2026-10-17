# Smart ear tag dan perangkat / Smart ear tag and devices

## Spesifikasi ear tag
MCU 32-bit hemat daya, sensor suhu digital, sensor detak jantung dan oksigen optik, akselerometer + giroskop 6 sumbu, GPS hemat daya, LoRa jarak jauh, memori flash eksternal untuk buffer data, baterai isi ulang 60–80 hari tanpa panel surya (target), panel surya opsional, interval pengiriman dapat diatur.

## Ear tag specifications
Low-power 32-bit MCU, digital temperature sensor, optical heart-rate and oxygen sensor, 6-axis accelerometer + gyroscope, low-power GPS, long-range LoRa, external flash to buffer data, rechargeable battery lasting 60–80 days without solar (target), optional solar panel, configurable transmission interval.

## Baterai rendah / Low battery
Bila baterai < 20% muncul alert "Baterai perangkat rendah". Isi daya atau ganti baterai; bersihkan panel surya dari kotoran. Memperpanjang interval pengiriman (mis. 5 → 10 menit) lewat Devices → Commands menghemat baterai hampir dua kali lipat.

Below 20% battery Terrava raises a "Low device battery" alert. Recharge or replace the battery and clean the solar panel. Lengthening the transmission interval (e.g. 5 → 10 minutes) from Devices → Commands nearly doubles battery life.

## Sinyal lemah atau offline / Weak signal or offline
Kualitas sinyal dihitung dari RSSI dan SNR LoRa. Penyebab sinyal lemah: ternak jauh dari gateway (> 2–5 km di area berbukit), antena terhalang bangunan logam, gateway mati listrik atau internet. Langkah: cek status gateway di Devices, pastikan gateway menyala dan online, pindahkan gateway ke posisi lebih tinggi, jalankan Diagnostics. Perangkat dianggap offline bila tidak mengirim data selama 2 jam (dapat diatur).

Link quality is derived from LoRa RSSI and SNR. Weak signal causes: the animal is far from the gateway (over 2–5 km in hilly terrain), metal buildings block the antenna, or the gateway lost power or internet. Steps: check the gateway in Devices, make sure it is powered and online, mount it higher, and run Diagnostics. A device is considered offline after 2 hours without data (configurable).

## Memasang ear tag / Fitting an ear tag
Pasang di sepertiga tengah daun telinga, hindari pembuluh darah besar, gunakan aplikator yang bersih dan desinfektan. Setelah dipasang, pasangkan (pair) perangkat ke ternak di halaman Livestock atau Devices agar data masuk ke profil yang benar.

Fit it in the middle third of the ear, avoiding large blood vessels, with a clean applicator and disinfectant. Then pair the device with the animal on the Livestock or Devices page so data reaches the right profile.
