#!/usr/bin/env python3
"""Mengunci isi halaman Prosedur dengan kata sandi.

Cara pakai (dari folder utama proyek):
    pip install cryptography
    python tools/encrypt.py "kata-sandi-baru"

Membaca  : tools/procedure.html  (isi prosedur, teks biasa, edit di sini)
Menulis  : js/vault.js           (versi terenkripsi AES-GCM, ini yang diunggah)

Huruf besar/kecil dan spasi di awal/akhir sandi tidak dibedakan di halaman.
"""
import base64, json, os, sys
from pathlib import Path
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parent.parent
ITER = 150000

if len(sys.argv) < 2 or not sys.argv[1].strip():
    sys.exit('Pakai: python tools/encrypt.py "kata-sandi"')
password = sys.argv[1].strip().lower()

body = (ROOT / "tools" / "procedure.html").read_text(encoding="utf-8").strip()
salt, iv = os.urandom(16), os.urandom(12)
key = PBKDF2HMAC(hashes.SHA256(), 32, salt, ITER).derive(password.encode())
ct = AESGCM(key).encrypt(iv, body.encode(), None)
b64 = lambda x: base64.b64encode(x).decode()
vault = {"s": b64(salt), "v": b64(iv), "c": b64(ct), "i": ITER}

(ROOT / "js" / "vault.js").write_text(
    "/* js/vault.js: isi Prosedur terenkripsi. JANGAN diedit tangan, buat ulang dengan tools/encrypt.py */\n\n"
    "var VAULT = " + json.dumps(vault) + ";\n", encoding="utf-8")
print("OK: js/vault.js dibuat (%d byte terenkripsi)" % len(ct))
