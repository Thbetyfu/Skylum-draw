// vector-tools.js
// Modul alat vektor: Rectangle, Lingkaran, Line, Polygon, Pen (Path)
import { layers, addLayer, renderLayerPanel, selectedLayer, selectLayer } from "./layers.js";

const canvasContainer = document.getElementById("canvasContainer");
let vectorState = {
  tool: "rect",
  currentShape: null,
  drawing: false,
  points: [],
};

function createSVG(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (let key in attrs) {
    if (attrs[key] !== undefined) el.setAttribute(key, attrs[key]);
  }
  return el;
}

let svg;
function ensureSVG() {
  if (!svg) {
    svg = createSVG("svg", {
      id: "skylumSVG",
      width: 900,
      height: 600,
      style: "background:#fff; border-radius:18px; box-shadow:0 2px 16px #0004;"
    });
    canvasContainer.innerHTML = "";
    canvasContainer.appendChild(svg);
  }
  return svg;
}

export function renderVector() {
  const svg = ensureSVG();
  svg.innerHTML = `<defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity="0.32"/>
    </filter>
  </defs>`;
  layers.forEach((obj, i) => {
    let el;
    if (obj.type === "rect") {
      el = createSVG("rect", obj);
    } else if (obj.type === "circle") {
      el = createSVG("circle", obj);
    } else if (obj.type === "line") {
      el = createSVG("line", obj);
    } else if (obj.type === "polygon") {
      el = createSVG("polygon", obj);
    } else if (obj.type === "polyline") {
      el = createSVG("polyline", obj);
    } else if (obj.type === "path") {
      el = createSVG("path", obj);
    } else if (obj.type === "text") {
      el = createSVG("text", obj);
      el.textContent = obj.value || "";
    }
    if (el) {
      el.style.cursor = "pointer";
      // Highlight jika selected
      if (i === selectedLayer) el.setAttribute("stroke", "#fbbf24");
      el.onclick = ev => {
        ev.stopPropagation();
        selectLayer(i);
      };
      // Drag
      let offset = {};
      let moving = false;
      el.onmousedown = ev => {
        if (window.activeTool !== "select") return;
        moving = true;
        if (obj.type === "rect") {
          offset.x = ev.offsetX - obj.x;
          offset.y = ev.offsetY - obj.y;
        } else if (obj.type === "circle") {
          offset.x = ev.offsetX - obj.cx;
          offset.y = ev.offsetY - obj.cy;
        } else if (obj.type === "text") {
          offset.x = ev.offsetX - obj.x;
          offset.y = ev.offsetY - obj.y;
        }
        svg.onmousemove = moveEv => {
          if (!moving) return;
          if (obj.type === "rect") {
            obj.x = moveEv.offsetX - offset.x;
            obj.y = moveEv.offsetY - offset.y;
          } else if (obj.type === "circle") {
            obj.cx = moveEv.offsetX - offset.x;
            obj.cy = moveEv.offsetY - offset.y;
          } else if (obj.type === "text") {
            obj.x = moveEv.offsetX - offset.x;
            obj.y = moveEv.offsetY - offset.y;
          }
          renderVector();
        };
        svg.onmouseup = () => {
          moving = false;
          svg.onmousemove = null;
          svg.onmouseup = null;
        };
      };
      svg.appendChild(el);
    }
  });
  window.renderVector = renderVector;
}

export function setVectorTool(tool) {
  if (typeof tool === "string") vectorState.tool = tool;
}

function onMouseDown(e) {
  if (window.activeTool !== "vector") return;
  const x = e.offsetX, y = e.offsetY;
  vectorState.drawing = true;
  const style = {
    fill: "#22d3ee",
    stroke: "#18181a",
    "stroke-width": 2.5,
    opacity: 1,
    filter: "url(#shadow)"
  };
  let obj = null;
  if (vectorState.tool === "rect") {
    obj = { type: "rect", x, y, width: 0, height: 0, ...style };
  } else if (vectorState.tool === "circle") {
    obj = { type: "circle", cx: x, cy: y, r: 0, ...style };
  } else if (vectorState.tool === "line") {
    obj = { type: "line", x1: x, y1: y, x2: x, y2: y, ...style };
  }
  if (obj) {
    addLayer(obj);
    vectorState.currentShape = obj;
    renderLayerPanel();
    renderVector();
  }
}

function onMouseMove(e) {
  if (!vectorState.drawing || !vectorState.currentShape) return;
  const x = e.offsetX, y = e.offsetY;
  let obj = vectorState.currentShape;
  if (obj.type === "rect") {
    obj.width = Math.abs(x - obj.x);
    obj.height = Math.abs(y - obj.y);
    obj.x = Math.min(x, obj.x);
    obj.y = Math.min(y, obj.y);
  } else if (obj.type === "circle") {
    const r = Math.sqrt(Math.pow(x - obj.cx, 2) + Math.pow(y - obj.cy, 2));
    obj.r = r;
  } else if (obj.type === "line") {
    obj.x2 = x;
    obj.y2 = y;
  }
  renderVector();
}

function onMouseUp(e) {
  if (!vectorState.drawing) return;
  vectorState.currentShape = null;
  vectorState.drawing = false;
  renderLayerPanel();
}

export function enableVectorTools() {
  ensureSVG();
  svg.onmousedown = onMouseDown;
  svg.onmousemove = onMouseMove;
  svg.onmouseup = onMouseUp;
}

export function disableVectorTools() {
  ensureSVG();
  svg.onmousedown = null;
  svg.onmousemove = null;
  svg.onmouseup = null;
}

enableVectorTools();
window.renderVector = renderVector;
