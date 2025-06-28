// layers.js
// Modul Layer: manajemen array objek, UI layer panel, urutan, select, delete

export let layers = [];        // Semua objek vector/text ada di sini
export let selectedLayer = null; // Index layer terpilih (null jika tidak ada)
const layerList = document.getElementById('layerList');

// Utility: log error
function logError(msg, err) {
  console.error('[Skylum Error]', msg, err || '');
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = 'Error: ' + msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

// Tambahkan layer baru
export function addLayer(obj) {
  try {
    layers.push(obj);
    selectedLayer = layers.length - 1;
    renderLayerPanel();
  } catch (err) {
    logError('Gagal menambah layer', err);
  }
}

// Duplikat layer terpilih
export function duplicateLayer() {
  try {
    if (selectedLayer === null || !layers[selectedLayer]) return;
    const obj = layers[selectedLayer];
    // Deep copy objek
    const copy = JSON.parse(JSON.stringify(obj));
    // Offset posisi agar tidak tumpuk
    if (copy.x !== undefined) copy.x += 20;
    if (copy.y !== undefined) copy.y += 20;
    if (copy.cx !== undefined) copy.cx += 20;
    if (copy.cy !== undefined) copy.cy += 20;
    layers.splice(selectedLayer + 1, 0, copy);
    selectedLayer = selectedLayer + 1;
    renderLayerPanel();
    if (typeof window.renderVector === 'function') window.renderVector();
    if (typeof window.renderPropertyPanel === 'function') window.renderPropertyPanel();
  } catch (err) {
    logError('Gagal menduplikasi layer', err);
  }
}

// Hapus layer terpilih
export function deleteLayer() {
  try {
    if (selectedLayer === null) return;
    layers.splice(selectedLayer, 1);
    selectedLayer = null;
    renderLayerPanel();
  } catch (err) {
    logError('Gagal menghapus layer', err);
  }
}

// Pindah layer ke atas
export function moveLayerUp() {
  try {
    if (selectedLayer === null || selectedLayer === 0) return;
    [layers[selectedLayer - 1], layers[selectedLayer]] = [layers[selectedLayer], layers[selectedLayer - 1]];
    selectedLayer--;
    renderLayerPanel();
  } catch (err) {
    logError('Gagal memindahkan layer ke atas', err);
  }
}

// Pindah layer ke bawah
export function moveLayerDown() {
  try {
    if (selectedLayer === null || selectedLayer === layers.length - 1) return;
    [layers[selectedLayer + 1], layers[selectedLayer]] = [layers[selectedLayer], layers[selectedLayer + 1]];
    selectedLayer++;
    renderLayerPanel();
  } catch (err) {
    logError('Gagal memindahkan layer ke bawah', err);
  }
}

// Pilih layer
export function selectLayer(idx) {
  try {
    selectedLayer = idx;
    renderLayerPanel();
    // Highlight di canvas, load ke propertyInspector
    if (typeof window.renderVector === 'function') window.renderVector();
    if (typeof window.renderPropertyPanel === 'function') window.renderPropertyPanel();
  } catch (err) {
    logError('Gagal memilih layer', err);
  }
}

// Lock/unlock layer
export function lockLayer() {
  try {
    if (selectedLayer === null || !layers[selectedLayer]) return;
    layers[selectedLayer].locked = !layers[selectedLayer].locked;
    renderLayerPanel();
    if (typeof window.renderVector === 'function') window.renderVector();
  } catch (err) {
    logError('Gagal lock/unlock layer', err);
  }
}

// Render list layer di panel kanan
export function renderLayerPanel() {
  try {
    layerList.innerHTML = "";
    layers.forEach((obj, idx) => {
      const li = document.createElement('li');
      li.textContent = (obj.locked ? '🔒 ' : '') + obj.type + (obj.value ? `: ${obj.value}` : "");
      li.className = (idx === selectedLayer ? "selected" : "");
      li.onclick = () => selectLayer(idx);
      layerList.appendChild(li);
    });
  } catch (err) {
    logError('Gagal render panel layer', err);
  }
}

// Integrasi ke tombol UI
if (document.getElementById('moveUpBtn')) document.getElementById('moveUpBtn').onclick = moveLayerUp;
if (document.getElementById('moveDownBtn')) document.getElementById('moveDownBtn').onclick = moveLayerDown;
if (document.getElementById('deleteLayerBtn')) document.getElementById('deleteLayerBtn').onclick = deleteLayer;
if (document.getElementById('duplicateLayerBtn')) document.getElementById('duplicateLayerBtn').onclick = duplicateLayer;
if (document.getElementById('lockLayerBtn')) document.getElementById('lockLayerBtn').onclick = lockLayer;

// Render pertama kali (kosong)
renderLayerPanel();

