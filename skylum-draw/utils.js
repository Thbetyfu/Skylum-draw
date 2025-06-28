// utils.js
// Export SVG dan PNG dari canvas
export function exportSVG() {
  const svg = document.getElementById("skylumSVG");
  if (!svg) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  // Tambah XML header
  if (!source.match(/^<svg/)) source = '<svg ' + source;
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skylum-export.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPNG() {
  const svg = document.getElementById("skylumSVG");
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const img = new Image();
  const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
  const image64 = 'data:image/svg+xml;base64,' + svg64;
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skylum-export.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };
  img.src = image64;
}
