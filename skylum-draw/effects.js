// effects.js
// Property panel dinamis untuk objek terpilih (vector & text)
import { layers, selectedLayer, renderLayerPanel } from "./layers.js";
import { renderVector } from "./vector-tools.js";

const propertyContent = document.getElementById("propertyContent");

// --- Efek shadow & blur SVG filter (static di SVG <defs>) ---
function ensureSVGFilters() {
  const svg = document.getElementById("skylumSVG");
  if (!svg) return;
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.prepend(defs);
  }
  // Tambah shadow jika belum ada
  if (!svg.querySelector("#shadow")) {
    defs.innerHTML += `
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    `;
  }
}

// --- Render efek untuk property inspector ---
export function showEffectsPanel() {
  propertyContent.innerHTML = "";
  if (selectedLayer == null || !layers[selectedLayer]) {
    propertyContent.innerHTML = "<div style='color:#888;'>Pilih satu objek untuk menambahkan efek</div>";
    return;
  }
  const obj = layers[selectedLayer];

  // SHADOW
  const shadowChecked = obj.filter === "url(#shadow)";
  const shadow = document.createElement("label");
  shadow.innerHTML = `
    <input type="checkbox" id="effectShadow" ${shadowChecked ? "checked" : ""}>
    <span style="margin-left:7px;">Drop Shadow</span>
  `;
  shadow.querySelector("#effectShadow").onchange = e => {
    obj.filter = e.target.checked ? "url(#shadow)" : "";
    renderVector();
    renderLayerPanel();
  };

  // BLUR
  const blurChecked = obj.filter === "url(#blur)";
  const blur = document.createElement("label");
  blur.innerHTML = `
    <input type="checkbox" id="effectBlur" ${blurChecked ? "checked" : ""}>
    <span style="margin-left:7px;">Blur</span>
  `;
  blur.querySelector("#effectBlur").onchange = e => {
    obj.filter = e.target.checked ? "url(#blur)" : "";
    renderVector();
    renderLayerPanel();
  };

  // OPACITY
  const opacity = document.createElement("label");
  opacity.innerHTML = `
    <span style="margin-right:7px;">Opacity</span>
    <input type="range" id="effectOpacity" min="0" max="1" step="0.01" value="${obj.opacity || 1}" style="vertical-align:middle;">
    <span style="margin-left:5px;" id="opacityVal">${(obj.opacity || 1)}</span>
  `;
  opacity.querySelector("#effectOpacity").oninput = e => {
    obj.opacity = parseFloat(e.target.value);
    opacity.querySelector("#opacityVal").textContent = obj.opacity;
    renderVector();
    renderLayerPanel();
  };

  // Warna (Fill)
  const color = document.createElement("label");
  color.innerHTML = `
    <span style="margin-right:7px;">Fill</span>
    <input type="color" id="effectFill" value="${obj.fill || '#22d3ee'}">
  `;
  color.querySelector("#effectFill").oninput = e => {
    obj.fill = e.target.value;
    renderVector();
    renderLayerPanel();
  };

  propertyContent.appendChild(shadow);
  propertyContent.appendChild(document.createElement("br"));
  propertyContent.appendChild(blur);
  propertyContent.appendChild(document.createElement("br"));
  propertyContent.appendChild(opacity);
  propertyContent.appendChild(document.createElement("br"));
  propertyContent.appendChild(color);

  ensureSVGFilters();
  renderVector();
}

// --- Aktifkan efek panel saat tombol Effects diklik di sidebar ---
document.getElementById("effectTool").onclick = showEffectsPanel;

// --- Juga tampilkan efek panel saat layer dipilih ---
import { selectLayer } from "./layers.js";
const oldSelectLayer = selectLayer;
export function selectLayerWithEffects(idx) {
  oldSelectLayer(idx);
  showEffectsPanel();
}
// **Pastikan selectLayer di layer.js dipakai selectLayerWithEffects di app.js**

// Property panel dinamis untuk objek terpilih (vector & text)
import { layers, selectedLayer, renderLayerPanel } from "./layers.js";
import { renderVector } from "./vector-tools.js";

const propertyContent = document.getElementById("propertyContent");

export function renderPropertyPanel() {
  propertyContent.innerHTML = "";
  if (selectedLayer == null || !layers[selectedLayer]) {
    propertyContent.innerHTML = "<div style='color:#888;'>Pilih satu objek untuk edit properti</div>";
    return;
  }
  const obj = layers[selectedLayer];
  // Fill color
  if ("fill" in obj) {
    const color = document.createElement("label");
    color.innerHTML = `
      <span style="margin-right:7px;">Fill</span>
      <input type="color" id="propFill" value="${obj.fill || '#22d3ee'}">
    `;
    color.querySelector("#propFill").oninput = e => {
      obj.fill = e.target.value;
      renderVector();
      renderLayerPanel();
    };
    propertyContent.appendChild(color);
    propertyContent.appendChild(document.createElement("br"));
  }
  // Opacity
  if ("opacity" in obj) {
    const opacity = document.createElement("label");
    opacity.innerHTML = `
      <span style="margin-right:7px;">Opacity</span>
      <input type="range" id="propOpacity" min="0" max="1" step="0.01" value="${obj.opacity || 1}" style="vertical-align:middle;">
      <span style="margin-left:5px;" id="opacityVal">${(obj.opacity || 1)}</span>
    `;
    opacity.querySelector("#propOpacity").oninput = e => {
      obj.opacity = parseFloat(e.target.value);
      opacity.querySelector("#opacityVal").textContent = obj.opacity;
      renderVector();
      renderLayerPanel();
    };
    propertyContent.appendChild(opacity);
    propertyContent.appendChild(document.createElement("br"));
  }
  // Font size (text only)
  if (obj.type === "text") {
    const fontSize = document.createElement("label");
    fontSize.innerHTML = `
      <span style="margin-right:7px;">Font Size</span>
      <input type="number" id="propFontSize" min="8" max="200" value="${obj["font-size"] || 36}" style="width:60px;">
    `;
    fontSize.querySelector("#propFontSize").oninput = e => {
      obj["font-size"] = parseInt(e.target.value);
      renderVector();
      renderLayerPanel();
    };
    propertyContent.appendChild(fontSize);
    propertyContent.appendChild(document.createElement("br"));
    // Font family
    const fontFamily = document.createElement("label");
    fontFamily.innerHTML = `
      <span style="margin-right:7px;">Font</span>
      <select id="propFontFamily">
        <option value="Arial" ${obj["font-family"]==="Arial"?"selected":""}>Arial</option>
        <option value="monospace" ${obj["font-family"]==="monospace"?"selected":""}>Monospace</option>
        <option value="serif" ${obj["font-family"]==="serif"?"selected":""}>Serif</option>
        <option value="Impact" ${obj["font-family"]==="Impact"?"selected":""}>Impact</option>
      </select>
    `;
    fontFamily.querySelector("#propFontFamily").oninput = e => {
      obj["font-family"] = e.target.value;
      renderVector();
      renderLayerPanel();
    };
    propertyContent.appendChild(fontFamily);
    propertyContent.appendChild(document.createElement("br"));
    // Edit text value
    const textEdit = document.createElement("label");
    textEdit.innerHTML = `
      <span style="margin-right:7px;">Text</span>
      <input type="text" id="propTextValue" value="${obj.value || ''}" style="width:120px;">
    `;
    textEdit.querySelector("#propTextValue").oninput = e => {
      obj.value = e.target.value;
      renderVector();
      renderLayerPanel();
    };
    propertyContent.appendChild(textEdit);
    propertyContent.appendChild(document.createElement("br"));
  }
}

window.renderPropertyPanel = renderPropertyPanel;
// Panggil renderPropertyPanel() setiap kali selectLayer atau edit objek

