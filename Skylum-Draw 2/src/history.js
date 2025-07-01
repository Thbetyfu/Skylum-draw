const history = {
    states: {},
    pointers: {},
    maxHistory: 30,
};

function initializeHistory() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    updateHistoryButtons();
}

/**
 * Mendaftarkan sebuah layer ke sistem history dengan state awalnya.
 */
function registerLayerHistory(layerId) {
    const layer = layerState.layers.find(l => l.id === layerId);
    if (!layer || layer.type !== 'raster' || !layer.ctx) return;
    
    // Hindari mendaftarkan layer yang sama dua kali
    if (history.states[layerId]) return;

    // "Potret" keadaan awal kanvas (yang seharusnya kosong)
    const initialImageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    history.states[layerId] = [initialImageData];
    history.pointers[layerId] = 0;
    
    updateHistoryButtons();
}

/**
 * Menyimpan keadaan kanvas saat ini ke dalam tumpukan riwayat.
 */
function saveState() {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.type !== 'raster') return;

    const layerId = activeLayer.id;

    // Jika layer ini belum terdaftar (misal karena race condition), daftarkan sekarang.
    if (!history.states[layerId]) {
        registerLayerHistory(layerId);
    }

    const currentStatePointer = history.pointers[layerId];
    const layerHistory = history.states[layerId];
    if (!layerHistory) return; // Pengaman tambahan

    if (currentStatePointer < layerHistory.length - 1) {
        history.states[layerId] = layerHistory.slice(0, currentStatePointer + 1);
    }

    const newImageData = activeLayer.ctx.getImageData(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
    history.states[layerId].push(newImageData);

    if (history.states[layerId].length > history.maxHistory) {
        history.states[layerId].shift();
    }
    
    history.pointers[layerId] = history.states[layerId].length - 1;
    updateHistoryButtons();
}

function undo() {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.type !== 'raster' || !history.pointers[activeLayer.id]) return;

    const layerId = activeLayer.id;
    if (history.pointers[layerId] > 0) {
        history.pointers[layerId]--;
        restoreState(activeLayer);
        sendLayerState(activeLayer);
    }
}

function redo() {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.type !== 'raster' || !history.pointers[activeLayer.id]) return;

    const layerId = activeLayer.id;
    if (history.pointers[layerId] < history.states[layerId].length - 1) {
        history.pointers[layerId]++;
        restoreState(activeLayer);
        sendLayerState(activeLayer);
    }
}

function restoreState(layer) {
    if (!layer || layer.type !== 'raster') return;
    const imageData = history.states[layer.id]?.[history.pointers[layer.id]];
    if (imageData) {
        layer.ctx.putImageData(imageData, 0, 0);
    }
    updateHistoryButtons();
}

function updateHistoryButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const activeLayer = getActiveLayer();

    if (!activeLayer || activeLayer.type !== 'raster' || !history.pointers.hasOwnProperty(activeLayer.id)) {
        undoBtn.disabled = true;
        redoBtn.disabled = true;
        return;
    }

    const pointer = history.pointers[activeLayer.id];
    const states = history.states[activeLayer.id];
    undoBtn.disabled = pointer <= 0;
    redoBtn.disabled = !states || pointer >= states.length - 1;
}

function sendLayerState(layer) {
    if (!layer || layer.type !== 'raster') return;
    const stateData = {
        type: 'canvas_state_update',
        layerId: layer.id,
        imageDataUrl: layer.canvas.toDataURL('image/png') 
    };
    if (window.sendDrawData) {
        sendDrawData(stateData);
    }
}