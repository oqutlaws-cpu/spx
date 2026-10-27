/* Kartu: memuat gambar, kode QR + tanda pengaman, menggambar kartu di kanvas */

var TPL_SRC = "assets/card-template.jpg";
var SPR_SRC = "assets/fingerprint-sprite.png";
var MONO = '"Courier Prime", "Courier New", monospace';
var SIGN = '"Great Vibes", "Brush Script MT", cursive';

/* ===== aset gambar ===== */
var tplImg = new Image(),
  sprImg = new Image(),
  assetCount = 0,
  assetWaiters = [];
function assetDone() {
  assetCount++;
  if (assetCount === 2)
    assetWaiters.forEach(function (f) {
      f();
    });
}
tplImg.onload = assetDone;
sprImg.onload = assetDone;
tplImg.src = TPL_SRC;
sprImg.src = SPR_SRC;
function assetsReady() {
  return new Promise(function (res) {
    if (assetCount === 2) res();
    else assetWaiters.push(res);
  });
}
function fontsReady() {
  var ps = [];
  if (document.fonts && document.fonts.load) {
    ps = [
      document.fonts.load('700 40px "Courier Prime"'),
      document.fonts.load('400 20px "Courier Prime"'),
      document.fonts.load('60px "Great Vibes"'),
    ];
  }
  var all = Promise.all(ps).catch(function () {});
  return Promise.race([
    all,
    new Promise(function (r) {
      setTimeout(r, 3500);
    }),
  ]);
}

/* ===== kode kartu (QR) + tanda pengaman sederhana ===== */
var SECRET = "ganti-kata-rahasia-tim";
function cyrb53(str, seed) {
  var h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (var i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function signOf(body) {
  return cyrb53(body + SECRET, 7).toString(36);
}
function makeCode(name, type, blood, lvl, fileNo) {
  var nm = encodeURIComponent(name.slice(0, 24)).replace(/~/g, "%7E");
  var body = ["LAB1", nm, type, blood, String(lvl), fileNo].join("|");
  return body + "~" + signOf(body);
}
function readCode(code) {
  var i = code.lastIndexOf("~");
  if (i < 0) return null;
  var body = code.slice(0, i),
    sig = code.slice(i + 1);
  if (signOf(body) !== sig) return null;
  var p = body.split("|");
  if (p[0] !== "LAB1" || p.length < 6 || !RESULT[p[2]]) return null;
  try {
    return {
      name: decodeURIComponent(p[1]),
      type: p[2],
      blood: p[3],
      lvl: p[4],
      file: p[5],
    };
  } catch (e) {
    return null;
  }
}

/* ===== menggambar kartu di atas template ===== */
function drawCard(d) {
  var S =
    tplImg.width / 1080; /* semua koordinat di bawah dalam ruang 1080 px */
  var cv = document.createElement("canvas");
  cv.width = tplImg.width;
  cv.height = tplImg.height;
  var c = cv.getContext("2d");
  c.drawImage(tplImg, 0, 0);
  var INK = "#141010";
  function U(n) {
    return n * S;
  }
  function fit(text, weight, family, maxW, startPx, minPx) {
    var px = startPx;
    while (px > minPx) {
      c.font = weight + " " + U(px) + "px " + family;
      if (c.measureText(text).width <= U(maxW)) break;
      px -= 1;
    }
    c.font = weight + " " + U(px) + "px " + family;
    return px;
  }
  function wrap(text, maxW) {
    var out = [];
    text.split(/\r?\n/).forEach(function (para) {
      var words = para.split(/\s+/),
        line = "";
      words.forEach(function (w) {
        while (c.measureText(w).width > maxW) {
          /* kata sangat panjang dipotong */
          var k = w.length;
          while (k > 1 && c.measureText(w.slice(0, k)).width > maxW) k--;
          if (line) {
            out.push(line);
            line = "";
          }
          out.push(w.slice(0, k));
          w = w.slice(k);
        }
        var test = line ? line + " " + w : w;
        if (c.measureText(test).width <= maxW) line = test;
        else {
          if (line) out.push(line);
          line = w;
        }
      });
      out.push(line);
    });
    return out;
  }

  c.textAlign = "left";
  c.textBaseline = "middle";

  /* username di label hitam */
  c.fillStyle = "#f6f3ec";
  fit(d.handle, "700", MONO, 400, 34, 16);
  c.fillText(d.handle, U(498), U(258));

  /* foto subjek (hitam putih); tinta cap diambil dari template lalu ditaruh lagi di atas foto */
  if (d.photo) {
    var sx0 = Math.round(U(372)),
      sy0 = Math.round(U(608)),
      sw0 = Math.round(U(136)),
      sh0 = Math.round(U(136));
    var sd = c.getImageData(sx0, sy0, sw0, sh0),
      sp = sd.data;
    for (var q = 0; q < sp.length; q += 4) {
      var a =
        (sp[q] - sp[q + 1] - 5) /
        118; /* seberapa merah = seberapa tebal tinta cap */
      a = a < 0 ? 0 : a > 1 ? 1 : a;
      sp[q] = 142;
      sp[q + 1] = 26;
      sp[q + 2] = 32;
      sp[q + 3] = Math.round(a * 255 * 0.95);
    }
    var stampCv = document.createElement("canvas");
    stampCv.width = sw0;
    stampCv.height = sh0;
    stampCv.getContext("2d").putImageData(sd, 0, 0);

    var bw = Math.round(U(300)),
      bh = Math.round(U(360));
    var tmp = document.createElement("canvas");
    tmp.width = bw;
    tmp.height = bh;
    var tc = tmp.getContext("2d");
    var r = Math.max(bw / d.photo.width, bh / d.photo.height);
    var pw = d.photo.width * r,
      ph = d.photo.height * r;
    tc.drawImage(d.photo, (bw - pw) / 2, (bh - ph) / 2, pw, ph);
    var id = tc.getImageData(0, 0, bw, bh),
      p = id.data;
    for (var i = 0; i < p.length; i += 4) {
      var g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
      g = Math.max(0, Math.min(255, (g - 128) * 1.12 + 128));
      p[i] = p[i + 1] = p[i + 2] = g;
    }
    tc.putImageData(id, 0, 0);
    c.drawImage(tmp, U(160), U(330));
    c.save();
    c.beginPath();
    c.rect(U(160), U(330), U(300), U(360));
    c.clip();
    c.drawImage(stampCv, sx0, sy0);
    c.restore();
  }

  /* about me */
  c.fillStyle = INK;
  c.textBaseline = "top";
  if (d.about) {
    var px, lines, lh;
    for (px = 22; px >= 12; px--) {
      c.font = "400 " + U(px) + "px " + MONO;
      lines = wrap(d.about, U(397));
      lh = px * 1.3;
      if (lines.length * lh <= 288) break;
    }
    lines.forEach(function (l, i) {
      c.fillText(l, U(508), U(396 + i * lh));
    });
  }

  /* baris isian */
  c.textBaseline = "middle";
  fit(d.name, "700", MONO, 625, 32, 16);
  c.fillText(d.name, U(274), U(762));
  fit(d.muse, "700", MONO, 625, 32, 16);
  c.fillText(d.muse, U(274), U(832));
  fit(d.dob, "700", MONO, 330, 30, 16);
  c.fillText(d.dob, U(262), U(902));
  fit(d.prof, "700", MONO, 290, 28, 13);
  c.fillText(d.prof, U(318), U(972));
  c.font = "700 " + U(40) + "px " + MONO;
  c.fillText(d.blood, U(312), U(1046));

  /* tingkat risiko: 3 balok + teks */
  for (var b = 0; b < 3; b++) {
    c.fillStyle = b < d.lvl ? "#8c1117" : "#cfc6b8";
    c.fillRect(U(690 + b * 44), U(1036), U(36), U(20));
  }
  c.fillStyle = INK;
  c.font = "700 " + U(26) + "px " + MONO;
  c.fillText("LV " + d.lvl, U(830), U(1046));

  /* tanda tangan otomatis dari nama */
  c.save();
  c.translate(U(770), U(944));
  c.rotate((-4 * Math.PI) / 180);
  c.textAlign = "center";
  c.fillStyle = INK;
  fit(d.name, "400", SIGN, 262, 80, 24);
  c.fillText(d.name, 0, 0);
  c.restore();
  c.textAlign = "left";

  /* sidik jari: 10 cetakan dari kumpulan, dipilih dan diubah sedikit berdasar nama + tanggal lahir */
  var rf = mulberry(seedFrom(d.name.toLowerCase() + "|" + d.dobRaw));
  var pool = [],
    n = SPR.meta.length,
    j;
  for (j = 0; j < n; j++) pool.push(j);
  for (j = n - 1; j > 0; j--) {
    var k = Math.floor(rf() * (j + 1));
    var t = pool[j];
    pool[j] = pool[k];
    pool[k] = t;
  }
  var slot = 0;
  [1149, 1249].forEach(function (cy0) {
    for (var cc = 0; cc < 5; cc++) {
      var m = SPR.meta[pool[slot]],
        col = pool[slot] % SPR.cols,
        row = Math.floor(pool[slot] / SPR.cols);
      var sx = col * SPR.cw + m[0],
        sy = row * SPR.ch + m[1],
        sw = m[2],
        sh = m[3];
      var sc = Math.min(70 / sw, 58 / sh) * (0.93 + rf() * 0.07);
      c.save();
      c.globalCompositeOperation = "multiply";
      c.globalAlpha = 0.8 + rf() * 0.2;
      c.translate(
        U(500 + cc * 82 + 40 + (rf() * 3 - 1.5)),
        U(cy0 + 32 + (rf() * 3 - 1.5)),
      );
      c.rotate(((rf() * 14 - 7) * Math.PI) / 180);
      if (rf() < 0.5) c.scale(-1, 1);
      c.imageSmoothingQuality = "high";
      c.drawImage(
        sprImg,
        sx,
        sy,
        sw,
        sh,
        -U(sw * sc) / 2,
        -U(sh * sc) / 2,
        U(sw * sc),
        U(sh * sc),
      );
      c.restore();
      slot++;
    }
  });

  /* baris clue di bawah sidik jari */
  c.fillStyle = INK;
  fit(d.clue, "400", MONO, 400, 12, 8);
  c.fillText(d.clue, U(505), U(1378));

  /* QR */
  if (typeof qrcode === "function") {
    var qr = qrcode(0, "M");
    qr.addData(d.code);
    qr.make();
    var cnt = qr.getModuleCount(),
      quiet = 3;
    var cell = Math.floor(U(300) / (cnt + quiet * 2));
    var total = cell * (cnt + quiet * 2);
    var ox = U(160) + (U(300) - total) / 2 + quiet * cell,
      oy = U(1100) + (U(300) - total) / 2 + quiet * cell;
    c.fillStyle = "#fff";
    c.fillRect(U(160), U(1100), U(300), U(300));
    c.fillStyle = "#000";
    for (var rr = 0; rr < cnt; rr++)
      for (var cc2 = 0; cc2 < cnt; cc2++)
        if (qr.isDark(rr, cc2))
          c.fillRect(
            Math.round(ox + cc2 * cell),
            Math.round(oy + rr * cell),
            cell,
            cell,
          );
  }

  /* tanggal cetak */
  c.fillStyle = INK;
  c.textAlign = "right";
  c.font = "400 " + U(16) + "px " + MONO;
  c.fillText(d.printed, U(920), U(1435));
  c.textAlign = "left";
  return cv;
}
