// vector-tools.js
// Modul alat vektor: Rectangle, Lingkaran, Line, Polygon, Pen (Path)

const canvasContainer = document.getElementById("canvasContainer");

// State utama untuk vektor
export let vectorState = {
  tool: "rect",        // default: rect
  shapes: [],          // semua objek vektor
  currentShape: null,  // shape yang sedang digambar
  drawing: false,
  points: [],
};

// --- SVG Helper ---
function createSVG(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (let key in attrs) {
    if (attrs[key] !== undefined) el.setAttribute(key, attrs[key]);
  }
  return el;
}

// --- INIT SVG ---
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

// --- RENDER ALL SHAPES ---
export function renderVector() {
  const svg = ensureSVG();
  svg.innerHTML = `<defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="4" dy="6" stdDeviation="3" flood-color="#000" flood-opacity="0.32"/>
    </filter>
  </defs>`;
  vectorState.shapes.forEach((obj, i) => {
    let el;
    if (obj.type === "rect") {
      el = createSVG("rect", obj);
    } else if (obj.type === "circle") {
      el = createSVG("circle", obj);
    } else if (obj.type === "line") {
      el = createSVG("line", obj);
    } else if (obj.type === "polyline") {
      el = createSVG("polyline", obj);
    } else if (obj.type === "polygon") {
      el = createSVG("polygon", obj);
    } else if (obj.type === "path") {
      el = createSVG("path", obj);
    }
    if (el) {
      el.style.cursor = "pointer";
      svg.appendChild(el);
    }
  });
}

// --- TOOLBAR INTERFACE (dari app.js bisa mengubah tool) ---
export function setVectorTool(tool) {
  vectorState.tool = tool;
}

// --- EVENT HANDLING (mousedown, mousemove, mouseup di SVG) ---
function onMouseDown(e) {
  const x = e.offsetX, y = e.offsetY;
  vectorState.drawing = true;

  // Style dasar
  const style = {
    fill: "#22d3ee",
    stroke: "#18181a",
    "stroke-width": 2.5,
    opacity: 1,
    filter: "url(#shadow)"
  };

  if (vectorState.tool === "rect") {
    vectorState.currentShape = { type: "rect", x, y, width: 0, height: 0, ...style };
    vectorState.shapes.push(vectorState.currentShape);
  } else if (vectorState.tool === "circle") {
    vectorState.currentShape = { type: "circle", cx: x, cy: y, r: 0, ...style };
    vectorState.shapes.push(vectorState.currentShape);
  } else if (vectorState.tool === "line") {
    vectorState.currentShape = { type: "line", x1: x, y1: y, x2: x, y2: y, stroke: "#22d3ee", "stroke-width": 3, opacity: 1 };
    vectorState.shapes.push(vectorState.currentShape);
  } else if (vectorState.tool === "polyline") {
    if (!vectorState.currentShape) {
      vectorState.points = [[x, y]];
      vectorState.currentShape = { type: "polyline", points: `${x},${y}`, stroke: "#eab308", "stroke-width": 3, fill: "none", opacity: 1 };
      vectorState.shapes.push(vectorState.currentShape);
    } else {
      vectorState.points.push([x, y]);
      vectorState.currentShape.points = vectorState.points.map(p => p.join(",")).join(" ");
    }
    renderVector();
    return;
  } else if (vectorState.tool === "path") {
    if (!vectorState.currentShape) {
      vectorState.points = [[x, y]];
      vectorState.pathD = `M${x} ${y}`;
      vectorState.currentShape = { type: "path", d: vectorState.pathD, stroke: "#db2777", "stroke-width": 3, fill: "none", opacity: 1 };
      vectorState.shapes.push(vectorState.currentShape);
    } else {
      vectorState.points.push([x, y]);
      vectorState.pathD += ` L${x} ${y}`;
      vectorState.currentShape.d = vectorState.pathD;
    }
    renderVector();
    return;
  }
  renderVector();
}

function onMouseMove(e) {
  if (!vectorState.drawing || !vectorState.currentShape) return;
  const x = e.offsetX, y = e.offsetY;
  if (vectorState.tool === "rect") {
    vectorState.currentShape.width = Math.abs(x - vectorState.currentShape.x);
    vectorState.currentShape.height = Math.abs(y - vectorState.currentShape.y);
    vectorState.currentShape.x = Math.min(x, vectorState.currentShape.x);
    vectorState.currentShape.y = Math.min(y, vectorState.currentShape.y);
  } else if (vectorState.tool === "circle") {
    const r = Math.sqrt(Math.pow(x - vectorState.currentShape.cx, 2) + Math.pow(y - vectorState.currentShape.cy, 2));
    vectorState.currentShape.r = r;
  } else if (vectorState.tool === "line") {
    vectorState.currentShape.x2 = x;
    vectorState.currentShape.y2 = y;
  }
  renderVector();
}

function onMouseUp(e) {
  if (!vectorState.drawing) return;
  if (["polyline", "path"].includes(vectorState.tool)) {
    // Polyline & path: tunggu double klik untuk finish
    return;
  }
  vectorState.currentShape = null;
  vectorState.drawing = false;
}

// Polyline/Path selesai dengan double click
function onDblClick(e) {
  if (vectorState.tool === "polyline" && vectorState.currentShape) {
    // Convert polyline to polygon
    const poly = { type: "polygon", points: vectorState.currentShape.points, fill: "#a3e635", opacity: 0.65, stroke: "#333", "stroke-width": 2 };
    vectorState.shapes[vectorState.shapes.length - 1] = poly;
    vectorState.currentShape = null;
    vectorState.points = [];
    renderVector();
  }
  if (vectorState.tool === "path" && vectorState.currentShape) {
    vectorState.currentShape = null;
    vectorState.points = [];
    vectorState.pathD = "";
    renderVector();
  }
}

// --- Attach handler pada svg ---
export function enableVectorTools() {
  ensureSVG();
  svg.onmousedown = onMouseDown;
  svg.onmousemove = onMouseMove;
  svg.onmouseup = onMouseUp;
  svg.ondblclick = onDblClick;
}

// --- Nonaktifkan alat vektor (untuk switch tool lain) ---
export function disableVectorTools() {
  ensureSVG();
  svg.onmousedown = null;
  svg.onmousemove = null;
  svg.onmouseup = null;
  svg.ondblclick = null;
}

enableVectorTools(); // auto aktif saat modul dimuat
