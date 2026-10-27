#!/usr/bin/env python3
"""Membuat js/data/archive.js dari tools/archive.json.

Cara pakai (dari folder utama proyek):
    pip install cryptography
    python tools/build_archive.py

Aturan:
  - SEMUA berkas terkunci. "sandi" = KODE ANGKA (jawaban clue) untuk membuka berkas itu.
    Isinya dienkripsi (AES-GCM) dengan kode tersebut, jadi tidak terbaca di source.
    Yang publik hanya kode berkas, judul, dan jumlah digit kode.
  - Alurnya: Clue A (briefing setelah verifikasi) membuka Berkas 01; narasi di Berkas 01
    berakhir dengan Clue B yang membuka Berkas 02; dan seterusnya. Urutannya ketat.
  - "briefing" (opsional) = deskripsi Clue A, ditulis biasa dan tampil setelah verifikasi kartu.
  - Gunakan kode minimal 8 digit. Kode pendek bisa ditebak lewat komputer.
"""
import base64, json, os, sys
from pathlib import Path
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = Path(__file__).resolve().parent.parent
ITER = 400000
b64 = lambda x: base64.b64encode(x).decode()

data = json.loads((ROOT / "tools" / "archive.json").read_text(encoding="utf-8"))
items = data["berkas"]
if not items:
    sys.exit("archive.json kosong")

out, seen = [], set()
for i, it in enumerate(items):
    code, name = it["code"], it["name"]
    if code in seen:
        sys.exit("Kode berkas ganda: " + code)
    seen.add(code)
    paras = it.get("bio", [])
    if isinstance(paras, str):
        paras = [paras]
    payload = {"sum": it.get("sum", ""), "note": it.get("note", ""), "bio": "\n\n".join(paras)}
    pw = str(it.get("sandi", "")).strip()
    if not pw.isdigit():
        sys.exit("%s: 'sandi' harus berupa angka saja (diisi: %r)" % (code, pw))
    if len(pw) < 8:
        print("PERINGATAN: %s memakai kode %d digit. Disarankan minimal 8 digit." % (code, len(pw)))
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(hashes.SHA256(), 32, salt, ITER).derive(pw.encode())
    ct = AESGCM(key).encrypt(iv, json.dumps(payload, ensure_ascii=False).encode(), None)
    out.append({"code": code, "name": name, "len": len(pw), "vault": {"s": b64(salt), "v": b64(iv), "c": b64(ct), "i": ITER}})

brief = data.get("briefing")
brief_js = ("var BRIEFING = " + json.dumps(brief, ensure_ascii=False) + ";\n\n") if brief else ""
lines = ",\n".join("  " + json.dumps(o, ensure_ascii=False) for o in out)
(ROOT / "js" / "data" / "archive.js").write_text(
    "/* js/data/archive.js: DIBUAT OTOMATIS oleh tools/build_archive.py dari tools/archive.json. JANGAN diedit tangan. */\n\n" +
    brief_js + "var ARSIP = [\n" + lines + "\n];\n", encoding="utf-8")
print("OK: js/data/archive.js dibuat (%d berkas, semua terkunci)" % len(out))
