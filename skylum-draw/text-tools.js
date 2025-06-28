// text-tools.js
import { layers, addLayer, renderLayerPanel } from "./layers.js";
import { renderVector } from "./vector-tools.js";

let svg;
let editingTextEl = null;
let inputBox = null;
let canvasContainer = document.getElementById("canvasContainer");

// Style/opsi default
let textOptions = {
  fill: "#0ea5e9",
  "font-size": 36,
  "font-family": "Arial",
  opacity: 1
};

export function setTextOptions(opts) {
  textOptions = { ...textOptions, ...opts };
}

// Event untuk mulai alat text
export function enableTextTools() {
  svg = document.getElementById("skylumSVG");
  if (!svg) return;
  svg.addEventListener("mousedown", onCanvasClickText);
}

// Event untuk non-aktif alat text
export function disableTextTools() {
  svg = document.getElementById("skylumSVG");
  if (!svg) return;
  svg.removeEventListener("mousedown", onCanvasClickText);
}

// Saat user klik di SVG/canvas, munculkan input text
function onCanvasClickText(e) {
  // Hanya jika tool = "text"
  if (window.activeTool !== "text") return;

  // Hilangkan input aktif lain
  if (inputBox) {
    inputBox.remove();
    inputBox = null;
  }
  let x = e.offsetX, y = e.offsetY;

  // Buat input box HTML di posisi mouse
  inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.placeholder = "Tulis teks lalu Enter";
  inputBox.style.position = "absolute";
  inputBox.style.left = (svg.getBoundingClientRect().left + x) + "px";
  inputBox.style.top = (svg.getBoundingClientRect().top + y - 20) + "px";
  inputBox.style.fontSize = textOptions["font-size"] + "px";
  inputBox.style.fontFamily = textOptions["font-family"];
  inputBox.style.padding = "4px 10px";
  inputBox.style.zIndex = 100;
  inputBox.style.background = "#fff";
  inputBox.style.color = textOptions.fill;
  inputBox.style.borderRadius = "7px";
  inputBox.style.border = "1.5px solid #aaa";
  document.body.appendChild(inputBox);

  inputBox.focus();

  inputBox.onkeydown = function(ev) {
    if (ev.key === "Enter") {
      if (inputBox.value.trim().length > 0) {
        addTextSVG(x, y, inputBox.value.trim());
      }
      inputBox.remove();
      inputBox = null;
    }
  };
}

// Menambahkan teks ke canvas (dan ke layers)
function addTextSVG(x, y, value) {
  const textObj = {
    type: "text",
    x, y: y + parseInt(textOptions["font-size"]),
    fill: textOptions.fill,
    "font-size": textOptions["font-size"],
    "font-family": textOptions["font-family"],
    opacity: textOptions.opacity,
    value
  };
  addLayer(textObj); // Tambahkan ke layers
  renderLayerPanel();
  renderVector();
}

// Integrasikan ke renderVector di vector-tools.js, contoh:
// --- Pada renderVector(), setelah render shape lain ---
// (Sudah di-handle di vector-tools.js versi refaktor)
