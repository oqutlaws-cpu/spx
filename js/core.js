/* Inti: helper, navigasi antar halaman, utilitas acak */

var $ = function (id) {
  return document.getElementById(id);
};

/* ===== util ===== */
function show(id) {
  var s = document.querySelectorAll(".screen");
  for (var i = 0; i < s.length; i++) s[i].classList.remove("on");
  $(id).classList.add("on");
  document.querySelector(".wrap").classList.toggle("wide", id === "s-home");
  window.scrollTo(0, 0);
}
function rnd(n) {
  return Math.floor(Math.random() * n);
}
function digits(n) {
  var s = "";
  for (var i = 0; i < n; i++) s += rnd(10);
  return s;
}
function pad(n) {
  return (n < 10 ? "0" : "") + n;
}
function seedFrom(str) {
  var h = 2166136261;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

var NAV = {
  home: function () {
    show("s-home");
  },
  brief: function () {
    show("s-intro");
  },
  team: function () {
    renderTeam();
    show("s-team");
  },
  gate: function () {
    openGate();
  },
  reg: function () {
    show("s-form");
  },
};
Array.prototype.forEach.call(
  document.querySelectorAll("[data-go]"),
  function (el) {
    el.onclick = function () {
      NAV[el.getAttribute("data-go")]();
    };
  },
);

/* ===== dekripsi AES-GCM (dipakai Prosedur dan Arsip) ===== */
function b64(x) {
  var t = atob(x),
    a = new Uint8Array(t.length);
  for (var i = 0; i < t.length; i++) a[i] = t.charCodeAt(i);
  return a;
}
function decryptVault(v, pw) {
  var c = window.crypto && window.crypto.subtle;
  if (!c) return Promise.reject(new Error("nocrypto"));
  return c
    .importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, [
      "deriveKey",
    ])
    .then(function (k) {
      return c.deriveKey(
        { name: "PBKDF2", salt: b64(v.s), iterations: v.i, hash: "SHA-256" },
        k,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"],
      );
    })
    .then(function (key) {
      return c.decrypt({ name: "AES-GCM", iv: b64(v.v) }, key, b64(v.c));
    })
    .then(function (buf) {
      return new TextDecoder().decode(buf);
    });
}

/* ===== helper umum ===== */
function reduceMotion() {
  return !!(
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function clueLetter(i) {
  return String.fromCharCode(65 + i);
} /* berkas 01 dibuka Clue A, berkas 02 Clue B, dst */
