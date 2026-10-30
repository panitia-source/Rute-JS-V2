/**
 * =========================================================================
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * RUTE JALAN SANTAI HGN DAN HUT KE-81 PGRI TAHUN 2026 KECAMATAN PASIRWANGI
 * =========================================================================
 * Cara Deploy ke Google Apps Script:
 * 1. Buka https://script.google.com dan buat project baru.
 * 2. Salin isi file ini ke file 'Code.gs'.
 * 3. Buat file HTML baru dengan nama 'Index' (Index.html) dan salin seluruh isi file Index.html.
 * 4. Klik Deploy > New Deployment > Pilih Web App.
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 5. Salin URL Web App yang dihasilkan untuk dibagikan kepada seluruh peserta.
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Menyimpan data presensi atau posisi peserta ke Google Spreadsheet (Opsional)
 */
function recordParticipantLog(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('Presensi Jalan Santai PGRI Pasirwangi 2026');
    }
    var sheet = ss.getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Waktu', 'Nama Peserta', 'Sekolah / Satuan Pendidikan', 'Nomor Kupon', 'POS Terakhir', 'Jarak Tempuh', 'Akurasi GPS (m)']);
      sheet.getRange(1, 1, 1, 7).setBackground('#0284c7').setFontColor('#ffffff').setFontWeight('bold');
    }
    sheet.appendRow([
      new Date(),
      data.name || 'Anonim',
      data.institution || '-',
      data.couponNo || '-',
      data.lastPos || 'START',
      data.distanceTravelled || '0 m',
      data.accuracy || '-'
    ]);
    return { success: true, message: 'Presensi berhasil dicatat.' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
