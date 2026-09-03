// Urna · resultados en vivo
// Sin framework: escucha el evento "scores" que emite main.js por socket.io.

(function () {
  "use strict";

  var el = function (id) { return document.getElementById(id); };

  var history = [];      // ventaja de la opcion A, en porcentaje
  var HISTORY_MAX = 28;

  function stamp() {
    var d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" +
           String(d.getMinutes()).padStart(2, "0") + ":" +
           String(d.getSeconds()).padStart(2, "0");
  }

  function paint(a, b) {
    var total = a + b;
    var pa = total ? (a / total * 100) : 50;
    var pb = 100 - pa;

    el("pc-a").textContent = pa.toFixed(1);
    el("pc-b").textContent = pb.toFixed(1);
    el("ct-a").textContent = a;
    el("ct-b").textContent = b;
    el("total").textContent = total.toLocaleString("es-AR");

    el("bg-a").style.width = pa + "%";
    el("bg-b").style.width = pb + "%";
    el("bar-a").style.width = pa + "%";
    el("bar-b").style.width = pb + "%";

    el("side-a").classList.toggle("lead", a > b);
    el("side-b").classList.toggle("lead", b > a);

    el("empty").classList.toggle("on", total === 0);
    el("lastup").textContent = stamp();

    history.push(pa);
    if (history.length > HISTORY_MAX) history.shift();
    drawSpark();
  }

  function drawSpark() {
    var svg = el("spark");
    if (!svg || history.length < 2) return;

    var lo = 30, hi = 70, W = 200, H = 40;
    var pts = history.map(function (v, i) {
      var x = i / (history.length - 1) * W;
      var y = H - (v - lo) / (hi - lo) * H;
      return [x, Math.max(2, Math.min(H - 2, y))];
    });

    var line = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var area = "0," + H + " " + line + " " + W + "," + H;
    var last = pts[pts.length - 1];
    var color = history[history.length - 1] >= 50 ? "var(--a)" : "var(--b)";

    svg.innerHTML =
      '<polyline points="' + area + '" fill="' + color + '" opacity="0.12"></polyline>' +
      '<line x1="0" y1="' + (H / 2) + '" x2="' + W + '" y2="' + (H / 2) +
        '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 3"></line>' +
      '<polyline points="' + line + '" fill="none" stroke="' + color +
        '" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"></polyline>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) +
        '" r="2.6" fill="' + color + '"></circle>';
  }

  function setSocketState(ok, text) {
    el("d-socket").classList.toggle("down", !ok);
    el("s-socket").textContent = text;
  }

  // ---- socket.io ----
  var socket = io.connect();

  socket.on("connect", function () {
    setSocketState(true, "conectado");
  });

  socket.on("disconnect", function () {
    setSocketState(false, "desconectado");
  });

  socket.on("scores", function (json) {
    try {
      var data = JSON.parse(json);
      paint(parseInt(data.a || 0, 10), parseInt(data.b || 0, 10));
    } catch (err) {
      console.error("No se pudo interpretar el mensaje de scores:", err);
    }
  });

  paint(0, 0);
})();
