# Coding Rules

## Bahasa dan Style

- Gunakan TypeScript untuk semua kode aplikasi.
- Hindari `any` kecuali benar-benar diperlukan dan diberi alasan.
- Ikuti pola folder yang sudah ada.
- Gunakan nama variabel yang jelas dan sesuai domain.
- Komponen React menggunakan PascalCase.
- Function dan variable menggunakan camelCase.
- Type dan interface menggunakan PascalCase.

## React

- Simpan logic lintas-komponen di context/controller/helper, bukan diduplikasi di UI.
- Komponen UI harus fokus pada render dan interaksi.
- Hindari komponen terlalu besar jika sudah sulit dibaca.
- Jaga state form tetap eksplisit.

## Data dan Domain

- Semua bentuk data domain harus didefinisikan di `src/types/index.ts`.
- Perubahan entity harus disinkronkan dengan mock data, controller, dan dokumentasi.
- Data klinis diperlakukan sebagai data sensitif.

## UI

- Ikuti desain yang sudah ada: dashboard padat, jelas, dan mudah dipindai.
- Jangan menambahkan landing page marketing jika task meminta fitur aplikasi.
- Pastikan teks tidak saling menimpa di mobile dan desktop.

## Verifikasi

- Jalankan test/build hanya jika developer mengizinkan.
- Untuk sesi ini, jangan menjalankan `npm run dev` dan `npm run build`.
