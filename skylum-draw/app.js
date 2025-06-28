// app.js (type="module")
import { enableVectorTools, disableVectorTools, setVectorTool } from "./vector-tools.js";
import { enableTextTools, disableTextTools, setTextOptions } from "./text-tools.js";
import { enableLayerPanel } from "./layers.js";
import { showEffectsPanel } from "./effects.js";
import { enableCropSelect, disableCropSelect } from "./crop-select.js";
import { exportSVG, exportPNG } from "./utils.js";
// ...import module lain

let activeTool = "vector";
window.activeTool = activeTool; // Agar bisa diakses global

// Switch tool logic
function switchTool(tool) {
  // Nonaktifkan semua tool dulu
  if (typeof disableVectorTools === 'function') disableVectorTools();
  if (typeof disableTextTools === 'function') disableTextTools();
  if (typeof disableCropSelect === 'function') disableCropSelect();
  // ...nonaktifkan tool lain jika ada

  activeTool = tool;
  window.activeTool = tool;
  // Highlight tombol sidebar
  document.querySelectorAll('.sidebar nav ul button').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(tool + "Tool");
  if (btn) btn.classList.add('active');

  // Aktifkan tool yang dipilih
  if (tool === "vector") {
    enableVectorTools();
    renderToolbarVector();
  }
  if (tool === "text") {
    enableTextTools();
    renderToolbarText();
  }
  if (tool === "layer") {
    enableLayerPanel();
  }
  if (tool === "effect") {
    showEffectsPanel();
  }
  if (tool === "crop") {
    enableCropSelect();
    renderToolbarCrop();
  }
  if (tool === "select") {
    if (typeof enableCropSelect === 'function') enableCropSelect();
    // Bisa tambahkan renderToolbarSelect jika ada
  }
  // ...tambahkan logika tool lain
}

// Toolbar dinamis untuk tiap tool
function renderToolbarVector() {
  const toolbar = document.getElementById("toolbar");
  if (!toolbar) return;
  toolbar.innerHTML = `
    <button onclick="window.setVTool('rect')">Rect</button>
    <button onclick="window.setVTool('circle')">Circle</button>
    <button onclick="window.setVTool('line')">Line</button>
    <button onclick="window.setVTool('polyline')">Polyline</button>
    <button onclick="window.setVTool('path')">Pen</button>
    <input type="color" id="vectorColor" value="#22d3ee" style="margin-left:20px">
  `;
  window.setVTool = tool => setVectorTool(tool);
  document.getElementById('vectorColor').oninput = e => setVectorTool({ fill: e.target.value });
}
function renderToolbarText() {
  const toolbar = document.getElementById("toolbar");
  if (!toolbar) return;
  toolbar.innerHTML = `
    <label>Warna: <input type="color" id="textColor" value="#0ea5e9"></label>
    <label>Ukuran: <input type="number" id="textSize" value="36" min="10" max="120" style="width:50px"></label>
    <label>Font: 
      <select id="textFont">
        <option value="Arial">Arial</option>
        <option value="monospace">Monospace</option>
        <option value="serif">Serif</option>
        <option value="Impact">Impact</option>
      </select>
    </label>
  `;
  document.getElementById('textColor').oninput = e => setTextOptions({ fill: e.target.value });
  document.getElementById('textSize').oninput = e => setTextOptions({ "font-size": parseInt(e.target.value) });
  document.getElementById('textFont').oninput = e => setTextOptions({ "font-family": e.target.value });
}
function renderToolbarCrop() {
  const toolbar = document.getElementById("toolbar");
  if (!toolbar) return;
  toolbar.innerHTML = `
    <span style="color:#fff;">Drag di canvas untuk select/crop</span>
    <button onclick="window.cropSelected()">Crop Area</button>
  `;
  window.cropSelected = () => {
    // Handler crop custom jika butuh
  };
}

// Sidebar event handler
const btnVector = document.getElementById("drawVector");
if (btnVector) btnVector.onclick = () => switchTool("vector");
const btnText = document.getElementById("textTool");
if (btnText) btnText.onclick = () => switchTool("text");
const btnLayer = document.getElementById("layerTool");
if (btnLayer) btnLayer.onclick = () => switchTool("layer");
const btnEffect = document.getElementById("effectTool");
if (btnEffect) btnEffect.onclick = () => switchTool("effect");
const btnCrop = document.getElementById("cropTool");
if (btnCrop) btnCrop.onclick = () => switchTool("crop");
const btnSelect = document.getElementById("selectTool");
if (btnSelect) btnSelect.onclick = () => switchTool("select");
const btnCollab = document.getElementById("collabTool");
if (btnCollab) btnCollab.onclick = () => {
  if (typeof window.startCollaboration === 'function') {
    let roomId = prompt("Masukkan Room ID/project untuk kolaborasi realtime:", "skylum-demo");
    if (roomId) window.startCollaboration(roomId);
  }
};

// Floating Action Button event (Mint, Save, Share, Export)
const btnMint = document.getElementById("mintBtn");
if (btnMint) btnMint.onclick = () => {
  alert("Fitur Mint: Akan integrasi ke blockchain Skylum");
};
const btnSave = document.getElementById("saveBtn");
if (btnSave) btnSave.onclick = () => {
  alert("Fitur Save: Export PNG/SVG");
};
const btnShare = document.getElementById("shareBtn");
if (btnShare && !btnShare.hasAttribute('data-collab-handler')) {
  btnShare.onclick = () => {
    alert("Fitur Share: Nanti bisa copy link/project");
  };
}
const btnExportSVG = document.getElementById("exportSVGBtn");
if (btnExportSVG) btnExportSVG.onclick = exportSVG;
const btnExportPNG = document.getElementById("exportPNGBtn");
if (btnExportPNG) btnExportPNG.onclick = exportPNG;

// Inisialisasi tool awal
document.addEventListener('DOMContentLoaded', () => switchTool("vector"));

