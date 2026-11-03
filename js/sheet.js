
/* Pendaftaran ke Google Sheets melalui Apps Script */

// URL Web App Apps Script. Harus berupa URL polos, bukan Markdown link.
var SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwvN5oCzcXhWAQr-BNEKxY0PRZY9B25BzotT5xNEEvckSoBrt-p8eSSfvKPjvoXO7rbwA/exec";

/*
  action:
  - check = mengecek nickname / username
  - claim = menyimpan pendaftaran
*/

function sheetCall(action, payload) {
  if (!SHEET_URL) {
    return Promise.reject(new Error("SHEET_URL belum diatur."));
  }

  payload = payload || {};
  payload.action = action;

  return fetch(SHEET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
    .then(function (r) {
      if (!r.ok) {
        throw new Error("HTTP Error: " + r.status);
      }
      return r.json();
    })
    .then(function (result) {
      console.log("Apps Script response:", result);
      return result;
    })
    .catch(function (error) {
      console.error("Google Sheets connection error:", error);
      throw error;
    });
}

function sheetMsg(r) {
  if (!r || !r.status) {
    return "Respons server tidak valid. Coba lagi.";
  }

  if (r.status === "dup_nickname") {
    return "Nickname ini sudah terdaftar. Gunakan nickname lain.";
  }

  if (r.status === "dup_usn") {
    return "Username ini sudah terdaftar. Gunakan username lain.";
  }

  if (r.status === "error") {
    return r.message || "Pendaftaran gagal. Coba lagi.";
  }

  return "Server pendaftaran tidak bisa dihubungi. Coba lagi sebentar lagi.";
}
