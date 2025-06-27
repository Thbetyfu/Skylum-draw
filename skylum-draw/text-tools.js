// text-tools.js
import { vectorState, renderVector } from "./vector-tools.js";

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

// Menambahkan teks ke canvas (dan vectorState)
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
  vectorState.shapes.push(textObj);
  renderVector();
}

// Render text di canvas (dipanggil dari renderVector di vector-tools.js)
export function renderText(svgEl) {
  // Dipanggil setiap kali vector di-render
  vectorState.shapes.forEach((obj, i) => {
    if (obj.type === "text") {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
      el.setAttribute("x", obj.x);
      el.setAttribute("y", obj.y);
      el.setAttribute("fill", obj.fill);
      el.setAttribute("font-size", obj["font-size"]);
      el.setAttribute("font-family", obj["font-family"]);
      el.setAttribute("opacity", obj.opacity);
      el.textContent = obj.value;
      el.style.cursor = "move";
      // Event drag text
      let offset = {};
      let moving = false;
      el.onmousedown = ev => {
        moving = true;
        offset.x = ev.offsetX - obj.x;
        offset.y = ev.offsetY - obj.y;
        svgEl.onmousemove = moveEv => {
          if (!moving) return;
          obj.x = moveEv.offsetX - offset.x;
          obj.y = moveEv.offsetY - offset.y;
          renderVector();
        };
        svgEl.onmouseup = () => {
          moving = false;
          svgEl.onmousemove = null;
          svgEl.onmouseup = null;
        };
      };
      svgEl.appendChild(el);
    }
  });
}

// Integrasikan ke renderVector di vector-tools.js, contoh:
/// --- Pada renderVector(), setelah render shape lain ---
/*
import { renderText } from "./text-tools.js";
...
renderText(svg);
*/
