/* Alur pendaftaran: form, 7 pertanyaan, hasil, unduh JPG, ulang */

var photoImg = null;
var answers = [],
  pflags = [];
var qi = 0;
var lastCanvas = null;
var lastName = "";

/* log pemrosesan bergaya terminal */
function runLog(cb) {
  var box = $("log");
  box.innerHTML = "";
  var L = [
    "> menghubungkan ke arsip SPECTRAL XDGE...",
    "> mengambil sampel... 43%",
    "> mencocokkan arsip... GAGAL, ulangi",
    "> mengambil sampel... 100%",
    "> mencetak berkas subjek...",
  ];
  var i = 0;
  (function nx() {
    if (i >= L.length) {
      setTimeout(cb, 500);
      return;
    }
    var d = document.createElement("div");
    d.textContent = L[i];
    if (L[i].indexOf("GAGAL") > -1) d.className = "bad";
    box.appendChild(d);
    i++;
    setTimeout(nx, 520);
  })();
}
$("pv-close").onclick = function () {
  $("pv").hidden = true;
};
$("f-about").oninput = function () {
  $("about-n").textContent = $("f-about").value.length;
};

$("f-photo").onchange = function (e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  var fr = new FileReader();
  fr.onload = function () {
    var im = new Image();
    im.onload = function () {
      photoImg = im;
      $("ph-img").src = fr.result;
      $("ph-img").style.display = "block";
      $("ph-box").style.display = "none";
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(f);
};

$("go-q").onclick = function () {
  var miss = [];
  if (!$("f-handle").value.trim()) miss.push("username");
  if (!$("f-name").value.trim()) miss.push("name");
  if (!$("f-muse").value.trim()) miss.push("muse");
  if (!$("f-birth").value) miss.push("tanggal lahir");
  if (miss.length) {
    $("form-err").textContent =
      "Data tidak lengkap. Divisi rekrutmen tidak menerima berkas kosong. Kurang: " +
      miss.join(", ") +
      ".";
    return;
  }
  $("form-err").textContent = "";
  answers = [];
  pflags = [];
  qi = 0;
  renderQ();
  show("s-q");
};
function renderQ() {
  var q = QUESTIONS[qi];
  $("q-count").textContent =
    "Pertanyaan " + (qi + 1) + " dari " + QUESTIONS.length;
  $("q-bar").style.width = (qi / QUESTIONS.length) * 100 + "%";
  $("q-text").textContent = q.q;
  var box = $("q-opts");
  box.innerHTML = "";
  q.o.forEach(function (op) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.textContent = op[0];
    b.onclick = function () {
      if (box.dataset.lock) return;
      box.dataset.lock = "1";
      b.classList.add("picked");
      setTimeout(function () {
        box.dataset.lock = "";
        pick(op[1], op[2]);
      }, 380);
    };
    box.appendChild(b);
  });
}
function pick(t, p) {
  answers.push(t);
  pflags.push(p ? 1 : 0);
  qi++;
  if (qi < QUESTIONS.length) {
    renderQ();
    return;
  }
  $("q-bar").style.width = "100%";
  show("s-proc");
  runLog(buildResult);
}

function buildResult() {
  var cnt = { A: 0, B: 0, O: 0, AB: 0 };
  answers.forEach(function (t) {
    cnt[t]++;
  });
  var best = "A",
    max = -1;
  ["A", "B", "O", "AB"].forEach(function (t) {
    if (cnt[t] > max || (cnt[t] === max && answers[answers.length - 1] === t)) {
      best = t;
      max = cnt[t];
    }
  });
  var psum = 0;
  pflags.forEach(function (x) {
    psum += x;
  });
  var blood = best;
  var risk = cnt.B + cnt.AB;
  var lvl = risk <= 2 ? 1 : risk <= 4 ? 2 : 3;
  var autoText = RESULT[best].text + (psum >= 2 ? " " + P_LINE : "");

  var name = $("f-name").value.trim();
  var handle = $("f-handle").value.trim();
  if (handle.charAt(0) !== "@") handle = "@" + handle;
  var raw = $("f-birth").value,
    pr = raw.split("-");
  var fileNo = digits(8) + "-" + digits(3);
  var now = new Date();
  var rf = mulberry(seedFrom(name.toLowerCase() + "|" + raw + "|clue"));
  var data = {
    handle: handle,
    name: name,
    muse: $("f-muse").value.trim(),
    about:
      autoText +
      ($("f-about").value.trim() ? "\n\n" + $("f-about").value.trim() : ""),
    dobRaw: raw,
    dob: pr[2] + "-" + pr[1] + "-" + pr[0],
    prof: RESULT[best].prof,
    blood: blood,
    lvl: lvl,
    clue: CLUES[Math.floor(rf() * CLUES.length)],
    code: makeCode(name, best, blood, lvl, fileNo),
    printed:
      pad(now.getDate()) +
      "." +
      pad(now.getMonth() + 1) +
      "." +
      now.getFullYear(),
    photo: photoImg,
  };
  lastName = name;
  Promise.all([assetsReady(), fontsReady()])
    .then(function () {
      lastCanvas = drawCard(data);
      $("r-img").src = lastCanvas.toDataURL("image/jpeg", 0.9);
      $("dl-msg").textContent = "";
      show("s-res");
    })
    .catch(function () {
      $("form-err").textContent = "Gagal membuat kartu. Coba lagi.";
      show("s-form");
    });
}

/* ===== unduh JPG ===== */
$("dl").onclick = function () {
  var btn = $("dl"),
    msg = $("dl-msg");
  if (!lastCanvas) return;
  btn.disabled = true;
  msg.textContent = "Menyiapkan file...";
  var fileName =
    "kartu-lab-" +
    (lastName.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      "subjek") +
    ".jpg";
  function fallback() {
    $("pv-img").src = lastCanvas.toDataURL("image/jpeg", 0.92);
    $("pv").hidden = false;
    msg.textContent = "";
  }
  lastCanvas.toBlob(
    function (blob) {
      if (!blob) {
        fallback();
        btn.disabled = false;
        return;
      }
      var cl =
        window.claude && window.claude.use
          ? window.claude.use("downloads")
          : Promise.resolve(null);
      cl.then(function (dls) {
        if (!dls) {
          fallback();
          return;
        }
        return dls.save({ filename: fileName, data: blob }).then(
          function () {
            msg.textContent = "Kartu tersimpan.";
          },
          function (err) {
            if (err && err.code === "declined")
              msg.textContent =
                "Unduhan dibatalkan. Tekan tombol lagi kalau mau mengunduh.";
            else fallback();
          },
        );
      })
        .catch(function () {
          fallback();
        })
        .then(function () {
          btn.disabled = false;
        });
    },
    "image/jpeg",
    0.93,
  );
};

$("again").onclick = function () {
  photoImg = null;
  lastCanvas = null;
  ["f-handle", "f-name", "f-muse", "f-birth", "f-about"].forEach(function (id) {
    $(id).value = "";
  });
  $("about-n").textContent = "0";
  $("ph-img").style.display = "none";
  $("ph-box").style.display = "grid";
  $("f-photo").value = "";
  show("s-home");
};
