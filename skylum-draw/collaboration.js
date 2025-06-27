// collaboration.js
// Modul kolaborasi: real-time sync, import/export, sharing

import { layers, renderLayerPanel } from "./layers.js";
import { renderVector } from "./vector-tools.js";

// ------ GUNDB Real-time Collaboration Setup ------
let gun = null, doc = null;

// Mulai kolaborasi (roomId = projectId/room unik)
export function startCollaboration(roomId = "skylum-demo") {
  if (!window.Gun) {
    // Load GunDB dari CDN jika belum ada
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/gun/gun.js";
    script.onload = () => startCollaboration(roomId);
    document.head.appendChild(script);
    return;
  }
  gun = Gun(["https://gun-manhattan.herokuapp.com/gun"]);
  doc = gun.get(`skylum/${roomId}`);

  // Listen changes from others
  doc.on(data => {
    if (data && data.layers) {
      try {
        const newLayers = JSON.parse(data.layers);
        if (JSON.stringify(layers) !== JSON.stringify(newLayers)) {
          layers.length = 0;
          newLayers.forEach(l => layers.push(l));
          renderLayerPanel();
          renderVector();
          showToast("Project updated from collaborator");
        }
      } catch (err) { /* ignore */ }
    }
  });
  showToast("Connected to collaboration room: " + roomId);
}

// Sync saat local layers berubah (harus dipanggil setiap ada edit layer)
export function syncLayers() {
  if (doc) {
    doc.put({ layers: JSON.stringify(layers), updated: Date.now() });
  }
}

// ------- Sharing, Export/Import File ---------

// Export project as JSON
export function exportProject() {
  const data = JSON.stringify({ layers });
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "skylum-project.json";
  a.click();
}

// Import project JSON
export function importProject(file) {
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const json = JSON.parse(ev.target.result);
      if (json.layers) {
        layers.length = 0;
        json.layers.forEach(l => layers.push(l));
        renderLayerPanel();
        renderVector();
        syncLayers();
        showToast("Project loaded!");
      }
    } catch (err) {
      alert("File project tidak valid!");
    }
  };
  reader.readAsText(file);
}

// Generate sharable link (dengan roomId/uuid)
export function getShareLink() {
  const params = new URLSearchParams(window.location.search);
  let roomId = params.get("room") || "skylum-demo";
  return `${window.location.origin}${window.location.pathname}?room=${roomId}`;
}

// Toast notif sederhana
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ------- Integrasi tombol UI -------

document.getElementById("collabTool").onclick = () => {
  let roomId = prompt("Masukkan Room ID/project untuk kolaborasi realtime:", "skylum-demo");
  if (roomId) startCollaboration(roomId);
};

document.getElementById("exportBtn").onclick = () => exportProject();

document.getElementById("importBtn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = () => {
    if (input.files && input.files[0]) importProject(input.files[0]);
  };
  input.click();
};

document.getElementById("shareBtn").onclick = () => {
  const link = getShareLink();
  navigator.clipboard.writeText(link);
  showToast("Share link copied: " + link);
};

// ------- Pastikan syncLayers() dipanggil setiap ada perubahan layer -------
// Contoh di layers.js (setelah renderLayerPanel atau aksi edit/urut/delete/add):
// import { syncLayers } from "./collaboration.js";
// syncLayers();

