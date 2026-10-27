/* Arsip: tumpukan map, sampul terbuka, halaman dibalik seperti buku */

var curFile = -1,
  curItem = null;
var FCOL = [
  ["#b3121c", "#fff"],
  ["#6e0b12", "#fff"],
  ["#3a2a2c", "#eee6e0"],
  ["#8c1117", "#fff"],
  ["#d9a521", "#161213"],
];
var STORE_KEY = "spx_arsip";
/* Penyimpanan berkas yang sudah dibuka:
   "session" = hilang saat tab/browser ditutup (peserta harus memasukkan kode lagi)
   "local"   = diingat terus di perangkat itu */
var STORE_MODE = "session";
function store() {
  try {
    return STORE_MODE === "local" ? localStorage : sessionStorage;
  } catch (e) {
    return null;
  }
}
/* sisa versi lama yang memakai penyimpanan permanen dibersihkan; ?reset di alamat menghapus semuanya */
try {
  if (STORE_MODE === "session" || /[?&]reset\b/.test(location.search))
    localStorage.removeItem(STORE_KEY);
} catch (e) {}
try {
  if (/[?&]reset\b/.test(location.search)) sessionStorage.removeItem(STORE_KEY);
} catch (e) {}
function isOpen(a) {
  return !!a.open;
}
function loadSaved() {
  try {
    return JSON.parse(store().getItem(STORE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}
function saveOpen(code, pw) {
  try {
    var m = loadSaved();
    m[code] = pw;
    store().setItem(STORE_KEY, JSON.stringify(m));
  } catch (e) {}
}
function applyFile(a, d) {
  a.sum = d.sum || "";
  a.note = d.note || "";
  a.bio = d.bio || "";
  a.open = true;
}
ARSIP.forEach(function (a) {
  a.open = !a.vault;
});
/* berkas yang sudah pernah dibuka dibuka lagi otomatis; rantai tetap urut (02 baru 03) */
function restoreArsip() {
  var m = loadSaved(),
    p = Promise.resolve();
  ARSIP.forEach(function (a, i) {
    if (!a.vault || a.open) return;
    p = p.then(function () {
      if ((i > 0 && !ARSIP[i - 1].open) || !m[a.code]) return;
      return decryptVault(a.vault, m[a.code]).then(
        function (t) {
          applyFile(a, JSON.parse(t));
        },
        function () {},
      );
    });
  });
  return p.then(function () {
    renderArsip();
  });
}
var pgW = 0,
  pgCur = 0;
function syncPg() {
  var box = $("pg-pages"),
    n = box.children.length;
  Array.prototype.forEach.call($("pg-dots").children, function (d, k) {
    d.className = k === pgCur ? "on" : "";
  });
  $("pg-prev").disabled = pgCur === 0;
  $("pg-next").disabled = pgCur >= n - 1;
  if (pgCur > 0) $("pg-hint").classList.add("gone");
}
function buildPages(a) {
  var box = $("pg-pages");
  box.innerHTML = "";
  pgCur = 0;
  function mk(first) {
    var pg = document.createElement("div");
    pg.className = "page";
    var pf = document.createElement("div");
    pf.className = "pf" + (first ? " first" : "");
    pg.appendChild(pf);
    var pb = document.createElement("div");
    pb.className = "pb";
    pg.appendChild(pb);
    if (!first) {
      pf.innerHTML =
        '<div class="ph-mini"><span></span><span>SPECTRAL XDGE 0.1</span></div>';
      pf.firstChild.firstChild.textContent = a.code;
    }
    if (first) {
      pf.innerHTML =
        '<div class="pg-hd"><div class="ph-top"><span>GEN 06</span><span>ARSIP</span></div><div class="ph-logo"><span>SPX</span></div><div class="pg-code"></div><h2></h2><div class="pg-st">STATUS: TERBUKA</div></div>';
      pf.querySelector(".pg-code").textContent = a.code;
      pf.querySelector("h2").textContent = a.name;
      if (a.note) {
        var nt = document.createElement("div");
        nt.className = "sticky";
        nt.textContent = a.note;
        pf.appendChild(nt);
        pf.querySelector("h2").style.paddingRight = "96px";
      }
    }
    var fl = document.createElement("div");
    fl.className = "pg-flow";
    pf.appendChild(fl);
    var ft = document.createElement("div");
    ft.className = "pg-foot";
    pf.appendChild(ft);
    box.appendChild(pg);
    return { pg: pg, pf: pf, flow: fl, foot: ft };
  }
  function mkSeal(nx, ni) {
    var pg = document.createElement("div");
    pg.className = "page";
    var pf = document.createElement("div");
    pf.className = "pf seal";
    pg.appendChild(pf);
    var pb = document.createElement("div");
    pb.className = "pb";
    pg.appendChild(pb);
    pf.innerHTML =
      '<div class="pg-hd"><div class="pg-code"></div><h2>Segel berkas</h2><div class="pg-st">STATUS: TERKUNCI</div></div>' +
      '<div class="seal-body"><p class="seal-t"></p>' +
      '<button type="button" class="seal-go">MASUKKAN KODE</button></div><div class="pg-foot"></div>';
    pf.querySelector(".pg-code").textContent = nx.code;
    pf.querySelector(".seal-t").textContent =
      nx.code +
      " disegel. Pecahkan Clue " +
      clueLetter(ni) +
      " di halaman sebelumnya, lalu masukkan kodenya.";
    pf.querySelector(".seal-go").onclick = function () {
      openKeypad(ni);
    };
    box.appendChild(pg);
    return { pg: pg, pf: pf, flow: null, foot: pf.querySelector(".pg-foot") };
  }
  function over(c) {
    return c.flow.scrollHeight > c.flow.clientHeight + 1;
  }
  var cur = mk(true),
    pages = [cur];
  String(a.bio)
    .split(/\n\s*\n/)
    .forEach(function (t) {
      var p = document.createElement("p");
      p.textContent = t;
      cur.flow.appendChild(p);
      if (!over(cur)) return;
      if (cur.flow.children.length > 1) {
        cur.flow.removeChild(p);
        cur = mk(false);
        pages.push(cur);
        cur.flow.appendChild(p);
        if (!over(cur)) return;
      }
      var words = t.split(/\s+/),
        i = 0;
      p.textContent = "";
      while (i < words.length) {
        var prev = p.textContent;
        p.textContent = prev ? prev + " " + words[i] : words[i];
        if (over(cur) && prev) {
          p.textContent = prev;
          cur = mk(false);
          pages.push(cur);
          p = document.createElement("p");
          cur.flow.appendChild(p);
        } else i++;
      }
    });
  var st = document.createElement("div");
  st.className = "pg-stamp";
  st.textContent = "ARSIP RESMI";
  pages[pages.length - 1].pf.appendChild(st);
  var ai = ARSIP.indexOf(a),
    nx = ARSIP[ai + 1];
  if (nx && !nx.open) pages.push(mkSeal(nx, ai + 1));
  var dots = $("pg-dots");
  dots.innerHTML = "";
  pages.forEach(function (c, k) {
    c.pg.style.zIndex = pages.length - k;
    c.foot.textContent = k + 1 + " / " + pages.length;
    dots.appendChild(document.createElement("i"));
  });
  $("pg-nav").hidden = pages.length < 2;
  $("pg-hint").hidden = pages.length < 2;
  $("pg-hint").classList.remove("gone");
  pgW = box.clientWidth;
  syncPg();
}
/* berkas briefing (Clue A) dibuka dengan i = -1; isinya dari BRIEFING di js/data/archive.js */
function briefItem() {
  return {
    code: "BRIEFING",
    name: BRIEFING.title || "Clue A",
    note: BRIEFING.note || "",
    bio: (BRIEFING.text || []).join("\n\n"),
    open: true,
  };
}
function openFile(i, fresh) {
  var a = i < 0 ? briefItem() : ARSIP[i];
  if (!isOpen(a)) return;
  curFile = i;
  curItem = a;
  var col = FCOL[i < 0 ? 4 : i % FCOL.length];
  var fb = $("fbook");
  fb.style.setProperty("--c", col[0]);
  fb.style.setProperty("--t", col[1]);
  $("fc-code").textContent = a.code;
  $("fc-name").textContent = a.name;
  var tb = $("pg-tabs");
  tb.innerHTML = "";
  tb.style.display =
    i < 0 ? "none" : ""; /* berkas briefing tanpa tab samping */
  ARSIP.forEach(function (b, j) {
    var t = document.createElement("button");
    t.type = "button";
    t.className = "pt" + (j === i ? " on" : "") + (isOpen(b) ? "" : " lock");
    t.style.setProperty("--c", FCOL[j % FCOL.length][0]);
    t.style.setProperty("--t", FCOL[j % FCOL.length][1]);
    t.textContent = b.code;
    t.setAttribute("aria-label", b.code + (isOpen(b) ? "" : " (terkunci)"));
    t.onclick = function () {
      if (j !== curFile && isOpen(b)) openFile(j);
    };
    tb.appendChild(t);
  });
  var pp = $("pg-pages");
  fb.classList.remove("opening");
  pp.classList.remove("flip");
  void fb.offsetWidth;
  if (fresh) fb.classList.add("opening");
  else pp.classList.add("flip");
  show("s-file");
  window.scrollTo(0, 0);
  buildPages(a);
}
(function () {
  var box = $("pg-pages"),
    drag = null;
  function go(dir) {
    var L = box.children,
      N = L.length;
    if (dir > 0 && pgCur < N - 1) {
      L[pgCur].classList.add("turned");
      pgCur++;
    } else if (dir < 0 && pgCur > 0) {
      pgCur--;
      L[pgCur].classList.remove("turned");
    }
    syncPg();
  }
  box.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest(".seal-body")) {
      drag = null;
      return;
    }
    drag = { x: e.clientX, dx: 0, dir: 0, leaf: null };
  });
  box.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    drag.dx = dx;
    if (!drag.dir && Math.abs(dx) > 8) {
      var dir = dx < 0 ? 1 : -1,
        N = box.children.length,
        k = dir > 0 ? pgCur : pgCur - 1;
      if (k < 0 || k > N - 1 || (dir > 0 && pgCur >= N - 1)) {
        drag = null;
        return;
      }
      drag.dir = dir;
      drag.leaf = box.children[k];
      drag.leaf.style.transition = "none";
      drag.leaf.style.visibility = "visible";
      try {
        box.setPointerCapture(e.pointerId);
      } catch (x) {}
    }
    if (drag && drag.leaf) {
      var p = Math.min(1, Math.abs(dx) / box.clientWidth);
      drag.leaf.style.transform =
        "rotateY(" + (drag.dir > 0 ? -180 * p : -180 + 180 * p) + "deg)";
    }
  });
  function end(e) {
    if (!drag) return;
    var d = drag;
    drag = null;
    if (d.leaf) {
      d.leaf.style.transition = "";
      d.leaf.style.visibility = "";
      d.leaf.style.transform = "";
      if (Math.abs(d.dx) > box.clientWidth * 0.2) go(d.dir);
    } else if (e.type === "pointerup" && Math.abs(d.dx) < 8) {
      var r = box.getBoundingClientRect();
      go(e.clientX > r.left + r.width / 2 ? 1 : -1);
    }
  }
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  $("pg-prev").onclick = function () {
    go(-1);
  };
  $("pg-next").onclick = function () {
    go(1);
  };
  document.addEventListener("keydown", function (e) {
    if (!$("s-file").offsetParent || !$("dp").hidden || !$("kp").hidden) return;
    if (document.activeElement && document.activeElement.tagName === "INPUT")
      return;
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
  });
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if ($("s-file").offsetParent && curItem && box.clientWidth !== pgW)
        buildPages(curItem);
    }, 250);
  });
})();
function renderArsip() {
  var st = $("stack");
  st.innerHTML = "";
  var lastOpen = -1;
  ARSIP.forEach(function (a, i) {
    var open = isOpen(a);
    if (open) lastOpen = i;
    var fd = document.createElement("div");
    fd.className = "fd" + (open ? "" : " lock");
    fd.style.setProperty("--c", FCOL[i % FCOL.length][0]);
    fd.style.setProperty("--t", FCOL[i % FCOL.length][1]);
    fd.style.setProperty("--p", i % 3);
    fd.style.setProperty("--i", i);
    fd.innerHTML =
      '<span class="fd-tab" aria-hidden="true"></span><div class="fd-body"><button type="button" class="fd-h" aria-expanded="false"><b></b><em></em></button><div class="fd-more"><p></p><button type="button" class="fd-open"></button></div></div>';
    fd.querySelector(".fd-tab").textContent = a.code;
    fd.querySelector("b").textContent = a.name;
    fd.querySelector("em").textContent = open ? "TERBUKA" : "TERKUNCI";
    var canEnter = i === 0 || ARSIP[i - 1].open;
    fd.querySelector("p").textContent = open
      ? a.sum
      : canEnter
        ? "Arsip " +
          clueLetter(i) +
          ", Pecahkan lalu buka."
        : "Terkunci. Selesaikan berkas sebelumnya lebih dulu.";
    var ob = fd.querySelector(".fd-open");
    ob.textContent = open
      ? "BUKA BERKAS \u2192"
      : canEnter
        ? "MASUKKAN KODE"
        : "TERKUNCI";
    ob.onclick = function () {
      if (open) {
        openFile(i, true);
        return;
      }
      if (canEnter) {
        openKeypad(i);
        return;
      }
      fd.classList.remove("shake");
      void fd.offsetWidth;
      fd.classList.add("shake");
    };
    var h = fd.querySelector(".fd-h");
    h.onclick = function () {
      var willOn = !fd.classList.contains("on");
      Array.prototype.forEach.call(st.children, function (f) {
        f.classList.remove("on");
        f.querySelector(".fd-h").setAttribute("aria-expanded", "false");
      });
      if (willOn) {
        fd.classList.add("on");
        h.setAttribute("aria-expanded", "true");
      }
    };
    st.appendChild(fd);
  });
  var f0 = st.children[lastOpen >= 0 ? lastOpen : 0];
  if (f0) {
    f0.classList.add("on");
    f0.querySelector(".fd-h").setAttribute("aria-expanded", "true");
  }
}
renderArsip();
restoreArsip();
