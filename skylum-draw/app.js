// app.js (type="module")
import { enableVectorTools, disableVectorTools, setVectorTool } from "./vector-tools.js";
import { enableTextTools, disableTextTools, setTextOptions } from "./text-tools.js";
import { enableLayerPanel } from "./layers.js";
import { showEffectsPanel } from "./effects.js";
import { enableCropSelect, disableCropSelect } from "./crop-select.js";
// ...import module lain

let activeTool = "vector";

// Switch tool logic
function switchTool(tool) {
  // Nonaktifkan semua tool dulu
  disableVectorTools();
  disableTextTools();
  disableCropSelect();
  // ...nonaktifkan tool lain jika ada

  activeTool = tool;
  // Highlight tombol sidebar
  document.querySelectorAll('.sidebar nav ul button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tool + "Tool").classList.add('active');

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
  // ...tambahkan logika tool lain
}

// Toolbar dinamis untuk tiap tool
function renderToolbarVector() {
  const toolbar = document.getElementById("toolbar");
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
  toolbar.innerHTML = `
    <span style="color:#fff;">Drag di canvas untuk select/crop</span>
    <button onclick="window.cropSelected()">Crop Area</button>
  `;
  window.cropSelected = () => {
    // Handler crop custom jika butuh
  };
}

// Sidebar event handler
document.getElementById("drawVector").onclick = () => switchTool("vector");
document.getElementById("textTool").onclick = () => switchTool("text");
document.getElementById("layerTool").onclick = () => switchTool("layer");
document.getElementById("effectTool").onclick = () => switchTool("effect");
document.getElementById("cropTool").onclick = () => switchTool("crop");

// Floating Action Button event (Mint, Save, Share)
document.getElementById("mintBtn").onclick = () => {
  // Integrasi ke blockchain (nanti)
  alert("Fitur Mint: Akan integrasi ke blockchain Skylum");
};
document.getElementById("saveBtn").onclick = () => {
  // Export PNG atau SVG
  alert("Fitur Save: Export PNG/SVG");
};
document.getElementById("shareBtn").onclick = () => {
  // Bagikan link atau file
  alert("Fitur Share: Nanti bisa copy link/project");
};

// Inisialisasi tool awal
switchTool("vector");

