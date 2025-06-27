// layers.js
// Modul Layer: manajemen array objek, UI layer panel, urutan, select, delete

export let layers = [];        // Semua objek vector/text ada di sini
export let selectedLayer = null; // Index layer terpilih (null jika tidak ada)
const layerList = document.getElementById('layerList');

// Tambahkan layer baru
export function addLayer(obj) {
  layers.push(obj);
  selectedLayer = layers.length - 1;
  renderLayerPanel();
}

// Hapus layer terpilih
export function deleteLayer() {
  if (selectedLayer === null) return;
  layers.splice(selectedLayer, 1);
  selectedLayer = null;
  renderLayerPanel();
}

// Pindah layer ke atas
export function moveLayerUp() {
  if (selectedLayer === null || selectedLayer === 0) return;
  [layers[selectedLayer - 1], layers[selectedLayer]] = [layers[selectedLayer], layers[selectedLayer - 1]];
  selectedLayer--;
  renderLayerPanel();
}

// Pindah layer ke bawah
export function moveLayerDown() {
  if (selectedLayer === null || selectedLayer === layers.length - 1) return;
  [layers[selectedLayer + 1], layers[selectedLayer]] = [layers[selectedLayer], layers[selectedLayer + 1]];
  selectedLayer++;
  renderLayerPanel();
}

// Pilih layer
export function selectLayer(idx) {
  selectedLayer = idx;
  renderLayerPanel();
  // Bisa juga: highlight di canvas, load ke propertyInspector, dst
}

// Render list layer di panel kanan
export function renderLayerPanel() {
  layerList.innerHTML = "";
  layers.forEach((obj, idx) => {
    const li = document.createElement('li');
    li.textContent = obj.type + (obj.value ? `: ${obj.value}` : "");
    li.className = (idx === selectedLayer ? "selected" : "");
    li.onclick = () => selectLayer(idx);
    layerList.appendChild(li);
  });
}

// Integrasi ke tombol UI
document.getElementById('moveUpBtn').onclick = moveLayerUp;
document.getElementById('moveDownBtn').onclick = moveLayerDown;
document.getElementById('deleteLayerBtn').onclick = deleteLayer;

// Render pertama kali (kosong)
renderLayerPanel();

