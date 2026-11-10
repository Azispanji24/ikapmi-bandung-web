/**
 * ============================================================================
 * BACKEND ULASAN SANTRI IKAPMI BANDUNG (100% GRATIS SELAMANYA - $0)
 * Menggunakan Google Sheets sebagai Database & Google Apps Script sebagai API
 * ============================================================================
 * 
 * PANDUAN CEPAT MEMASANG (Hanya butuh 1 menit):
 * 1. Buka https://sheets.google.com di akun Google Anda, buat spreadsheet baru.
 * 2. Beri nama file: "Database Ulasan IKAPMI Bandung".
 * 3. Di menu atas, klik: Ekstensi (Extensions) -> Apps Script.
 * 4. Hapus semua tulisan di editor Apps Script, lalu COPY & PASTE seluruh kode file ini.
 * 5. Klik ikon "Simpan" (Ctrl+S).
 * 6. Klik tombol biru di kanan atas: "Terapkan" (Deploy) -> "Penerapan baru" (New deployment).
 * 7. Pada ikon gerigi "Pilih jenis", pilih "Aplikasi web" (Web app).
 * 8. Konfigurasi:
 *    - Deskripsi: Ulasan IKAPMI v1
 *    - Jalankan sebagai (Execute as): Saya (Me)
 *    - Siapa yang memiliki akses (Who has access): SIAPA SAJA (ANYONE) -> [WAJIB]
 * 9. Klik tombol "Terapkan" (Deploy).
 *    (Jika muncul jendela "Beri izin" / Authorize Access -> pilih akun Google Anda -> Advanced -> Buka Apps Script (tidak aman) -> Izinkan).
 * 10. Salin "URL Aplikasi Web" (Web App URL) yang muncul (berakhiran /exec).
 * 11. Tempelkan URL tersebut ke konfigurasi di website (atau kirim ke developer untuk dimasukkan ke kode).
 * 
 * SELESAI! Semua santri dari HP, iPhone, Android, dan laptop mana pun akan langsung tersinkronisasi secara real-time!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Inisialisasi header kolom otomatis jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Nama", "Peran/Jurusan", "Kampus", "Ulasan", "Foto Avatar", "Tanggal"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
    }

    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date().toISOString();
    var name = (data.name || "Anonim").toString().trim();
    var role = (data.role || "Santri Perantau").toString().trim();
    var company = (data.company || "Bandung").toString().trim();
    var quote = (data.quote || "").toString().trim();
    var image = (data.image || "").toString().trim();
    var date = (data.date || "Baru saja").toString().trim();

    if (!quote) {
      return responseJSON({ status: "error", message: "Ulasan tidak boleh kosong" });
    }

    // Masukkan data baris baru
    sheet.appendRow([timestamp, name, role, company, quote, image, date]);

    return responseJSON({ status: "success", message: "Ulasan berhasil disimpan ke Google Sheets" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() <= 1) {
      return responseJSON({ status: "success", data: [] });
    }

    var rows = sheet.getDataRange().getValues();
    var testimonials = [];

    // Baris pertama (index 0) adalah header kolom
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (row[1] && row[4]) { // Nama dan Ulasan harus ada
        testimonials.push({
          name: row[1],
          role: row[2] || "Santri Perantau",
          company: row[3] || "Bandung",
          quote: row[4],
          image: row[5] || "",
          date: row[6] || "Beberapa saat lalu"
        });
      }
    }

    // Urutkan ulasan terbaru berada di posisi teratas
    testimonials.reverse();

    return responseJSON({ status: "success", data: testimonials });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
