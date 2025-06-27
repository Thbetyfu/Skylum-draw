// crop-select.js
import { layers, selectedLayer, renderLayerPanel, selectLayer } from "./layers.js";
import { renderVector } from "./vector-tools.js";

let svg;
let selecting = false;
let startPt = null;
let selectRect = null;

// --- SELECT TOOL ---
// Aktifkan alat select: klik pada objek untuk memilih, drag untuk memindahkan.
export function enableSelectTool() {
  svg = document.getElementById("skylumSVG");
  if (!svg) return;
  svg.onmousedown = onMouseDownSelect;
}

function onMouseDownSelect(e) {
  const x = e.offsetX, y = e.offsetY;
  // Cek apakah klik pada objek (reverse order = topmost first)
  let found = false;
  for (let i = layers.length - 1; i >= 0; i--) {
    const obj = layers[i];
    if (isPointInObject(x, y, obj)) {
      selectLayer(i);
      found = true;
      break;
    }
  }
  if (!found) {
    // Jika tidak klik objek, mulai seleksi area (untuk crop)
    selecting = true;
    startPt = { x, y };
    // Buat kotak seleksi (SVG rect semi-transparent)
    if (!selectRect) {
      selectRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      selectRect.setAttribute("fill", "#0ea5e933");
      selectRect.setAttribute("stroke", "#38bdf8");
      selectRect.setAttribute("stroke-dasharray", "8,4");
      selectRect.setAttribute("pointer-events", "none");
      svg.appendChild(selectRect);
    }
    selectRect.setAttribute("x", x);
    selectRect.setAttribute("y", y);
    selectRect.setAttribute("width", 0);
    selectRect.setAttribute("height", 0);

    svg.onmousemove = onMouseMoveSelect;
    svg.onmouseup = onMouseUpSelect;
  }
}

// Move area select/crop
function onMouseMoveSelect(e) {
  if (!selecting || !selectRect) return;
  const x = e.offsetX, y = e.offsetY;
  selectRect.setAttribute("x", Math.min(x, startPt.x));
  selectRect.setAttribute("y", Math.min(y, startPt.y));
  selectRect.setAttribute("width", Math.abs(x - startPt.x));
  selectRect.setAttribute("height", Math.abs(y - startPt.y));
}

function onMouseUpSelect(e) {
  if (!selecting || !selectRect) return;
  selecting = false;
  svg.onmousemove = null;
  svg.onmouseup = null;

  // Simpan area seleksi untuk crop
  const x = parseFloat(selectRect.getAttribute("x"));
  const y = parseFloat(selectRect.getAttribute("y"));
  const w = parseFloat(selectRect.getAttribute("width"));
  const h = parseFloat(selectRect.getAttribute("height"));

  // Crop: buat clipPath di SVG (hanya demo, objek bisa di-mask atau dihapus)
  if (w > 5 && h > 5) {
    cropObjects(x, y, w, h);
  }
  // Hapus kotak seleksi
  selectRect.remove();
  selectRect = null;
}

// Cek point dalam objek (rect, circle, text), dasar
function isPointInObject(x, y, obj) {
  if (obj.type === "rect") {
    return (
      x >= obj.x &&
      x <= obj.x + obj.width &&
      y >= obj.y &&
      y <= obj.y + obj.height
    );
  } else if (obj.type === "circle") {
    const dx = x - obj.cx;
    const dy = y - obj.cy;
    return Math.sqrt(dx * dx + dy * dy) <= obj.r;
  } else if (obj.type === "text") {
    // Teks: asumsi seleksi di area font
    return (
      x >= obj.x &&
      x <= obj.x + obj.value.length * obj["font-size"] * 0.5 &&
      y <= obj.y &&
      y >= obj.y - obj["font-size"]
    );
  }
  // Extend: polygon/path
  return false;
}

// --- CROP TOOL ---
// Buat clipPath berdasarkan area seleksi, terapkan ke semua layer yang terkena
function cropObjects(x, y, w, h) {
  const svg = document.getElementById("skylumSVG");
  if (!svg) return;

  // Buat <clipPath>
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.prepend(defs);
  }
  // Buat clipPath dengan rect
  const clipId = "clip" + Math.floor(Math.random() * 10000);
  const clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
  clip.setAttribute("id", clipId);

  const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  clipRect.setAttribute("x", x);
  clipRect.setAttribute("y", y);
  clipRect.setAttribute("width", w);
  clipRect.setAttribute("height", h);
  clip.appendChild(clipRect);

  defs.appendChild(clip);

  // Terapkan clipPath ke semua objek yang terkena area
  layers.forEach(obj => {
    if (isObjIntersectRect(obj, x, y, w, h)) {
      obj["clip-path"] = `url(#${clipId})`;
    }
  });
  renderVector();
  renderLayerPanel();
}

// Deteksi objek bersinggungan dengan area crop
function isObjIntersectRect(obj, x, y, w, h) {
  if (obj.type === "rect") {
    // Cek overlap bounding box
    return !(
      obj.x + obj.width < x ||
      obj.x > x + w ||
      obj.y + obj.height < y ||
      obj.y > y + h
    );
  } else if (obj.type === "circle") {
    // Bounding box circle
    return !(
      obj.cx + obj.r < x ||
      obj.cx - obj.r > x + w ||
      obj.cy + obj.r < y ||
      obj.cy - obj.r > y + h
    );
  } else if (obj.type === "text") {
    return (
      obj.x < x + w &&
      obj.x + obj.value.length * obj["font-size"] * 0.5 > x &&
      obj.y - obj["font-size"] < y + h &&
      obj.y > y
    );
  }
  // Extend: polygon/path
  return false;
}

// --- ENABLE TOOL: Integrasikan dengan tombol crop/select ---
export function enableCropSelect() {
  svg = document.getElementById("skylumSVG");
  if (!svg) return;
  svg.onmousedown = onMouseDownSelect;
}

// --- NON-AKTIFKAN TOOL ---
export function disableCropSelect() {
  svg = document.getElementById("skylumSVG");
  if (!svg) return;
  svg.onmousedown = null;
}

