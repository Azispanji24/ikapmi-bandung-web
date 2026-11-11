/**
 * ============================================================================
 * BACKEND DATABASE ALUMNI IKAPMI BANDUNG (100% GRATIS SELAMANYA - $0)
 * Menggunakan Google Sheets sebagai Database & Google Apps Script sebagai API
 * ============================================================================
 *
 * PANDUAN CEPAT MEMASANG (1–2 Menit):
 * 1. Buka https://sheets.google.com pakai akun Google khusus admin/organisasi.
 * 2. Buat Spreadsheet baru, beri nama: "Database Alumni IKAPMI Bandung".
 * 3. Di menu atas, klik: Ekstensi (Extensions) -> Apps Script.
 * 4. Hapus semua kode bawaan di editor Apps Script, lalu COPY & PASTE seluruh isi file ini.
 * 5. Klik ikon "Simpan" (Ctrl+S).
 * 6. Klik tombol biru di kanan atas: "Terapkan" (Deploy) -> "Penerapan baru" (New deployment).
 * 7. Pada ikon gerigi "Pilih jenis", pilih "Aplikasi web" (Web app).
 * 8. Konfigurasi:
 *    - Deskripsi: Database Alumni IKAPMI v1
 *    - Jalankan sebagai (Execute as): Saya (Me)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone)  <-- WAJIB agar form web bisa mengirim data!
 *      (Tenang: Spreadsheet tetap PRIVATE di akun Google Anda, dan skrip ini TIDAK membuka data alumni lewat GET.)
 * 9. Klik "Terapkan" (Deploy) -> beri izin (Authorize access) -> Advanced -> Buka Apps Script -> Izinkan.
 * 10. Salin "URL Aplikasi Web" yang berakhiran /exec.
 * 11. Buka file `js/app.js` di project website, cari konstanta:
 *       const ALUMNI_DB_SCRIPT_URL = '';
 *     Lalu tempelkan URL `/exec` Anda di antara tanda kutip tersebut, simpan, dan push ke GitHub!
 *
 * SELESAI! Setiap alumni yang mengisi `database.html` dari HP/laptop mana pun akan langsung masuk ke Google Sheets ini.
 */

var HEADERS = [
  "Timestamp (WIB)",
  "Nama Lengkap & Panggilan",
  "Angkatan / Tahun Lulus",
  "Nomor WhatsApp",
  "Kampus / Universitas",
  "Fakultas / Program Studi",
  "Status Saat Ini",
  "Alamat Domisili / Area Kost"
];

function getTargetSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Database_Alumni") || ss.getActiveSheet();

  // Inisialisasi header kolom otomatis jika sheet masih kosong
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange
      .setFontWeight("bold")
      .setBackground("#081326")
      .setFontColor("#ffffff")
      .setVerticalAlignment("middle");
    sheet.setRowHeight(1, 34);
    sheet.setFrozenRows(1);

    // Format kolom D (Nomor WhatsApp) sebagai Plain Text agar angka 0 di depan (08xxx) tidak hilang
    sheet.getRange("D:D").setNumberFormat("@");

    // Atur lebar kolom agar langsung rapi saat dibuka pengurus
    var widths = [165, 230, 180, 150, 220, 220, 200, 280];
    for (var i = 0; i < widths.length; i++) {
      sheet.setColumnWidth(i + 1, widths[i]);
    }
  }

  return sheet;
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      // Fallback jika dikirim sebagai form-urlencoded
    }
  }
  return (e && e.parameter) ? e.parameter : {};
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Tunggu antrean jika ada 2 alumni submit bersamaan
    lock.waitLock(10000);

    var data = parsePayload_(e);
    var nama = (data.nama || "").toString().trim();
    var angkatan = (data.angkatan || "").toString().trim();
    var whatsapp = (data.whatsapp || "").toString().trim();
    var kampus = (data.kampus || "").toString().trim();
    var jurusan = (data.jurusan || "-").toString().trim() || "-";
    var status = (data.status || "-").toString().trim() || "-";
    var domisili = (data.domisili || "-").toString().trim() || "-";

    if (!nama || !angkatan || !whatsapp || !kampus) {
      return responseJSON({
        status: "error",
        message: "Field wajib (Nama, Angkatan, Nomor WhatsApp, dan Kampus) harus diisi."
      });
    }

    var sheet = getTargetSheet_();
    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss") + " WIB";

    var targetRow = sheet.getLastRow() + 1;
    // Pastikan sel WhatsApp diformat Plain Text sebelum diisi
    sheet.getRange(targetRow, 4).setNumberFormat("@");
    sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([[
      timestamp,
      nama,
      angkatan,
      whatsapp,
      kampus,
      jurusan,
      status,
      domisili
    ]]);

    return responseJSON({
      status: "success",
      message: "Data alumni berhasil disimpan ke Database IKAPMI Regional Bandung."
    });
  } catch (err) {
    return responseJSON({
      status: "error",
      message: "Gagal menyimpan data: " + err.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      // Ignore if lock was not acquired
    }
  }
}

function doGet(e) {
  // Demi privasi data WhatsApp & domisili alumni, endpoint GET TIDAK mengembalikan isi baris sheet.
  try {
    var sheet = getTargetSheet_();
    var totalRegistered = Math.max(0, sheet.getLastRow() - 1);
    return responseJSON({
      status: "success",
      message: "API Database Alumni IKAPMI Regional Bandung aktif.",
      total_terdata: totalRegistered
    });
  } catch (err) {
    return responseJSON({
      status: "error",
      message: err.toString()
    });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
