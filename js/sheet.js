/* Pendaftaran ke Google Sheet (lewat Apps Script): mencegah nickname / username kembar.
   Isi SHEET_URL dengan URL web app dari tools/apps-script.gs. Kosong = pengecekan dimatikan. */
var SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwvN5oCzcXhWAQr-BNEKxY0PRZY9B25BzotT5xNEEvckSoBrt-p8eSSfvKPjvoXO7rbwA/exec";

/* action: "check" (cek saja) atau "claim" (cek + catat). Hasil: {status: "ok"|"dup_nickname"|"dup_usn"|"error"} */
function sheetCall(action, payload) {
  if (!SHEET_URL) return Promise.resolve({ status: "ok" });
  payload.action = action;
  return fetch(SHEET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    } /* tanpa preflight CORS */,
    body: JSON.stringify(payload),
  }).then(function (r) {
    return r.json();
  });
}
function sheetMsg(r) {
  if (r.status === "dup_nickname")
    return "Nickname ini sudah terdaftar. Gunakan nickname lain.";
  if (r.status === "dup_usn")
    return "Username ini sudah terdaftar. Gunakan username lain.";
  return "Server pendaftaran tidak bisa dihubungi. Coba lagi sebentar lagi.";
}
