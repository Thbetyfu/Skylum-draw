const layerState = { layers: [], activeLayerIndex: -1 };
let layerCounter = 1;
let currentPenPath = null;
let currentPathPoints = [];

function initializeLayers() {
    // Menggunakan arrow function untuk memastikan argumen dikirim dengan benar
    document.getElementById('add-layer-btn').addEventListener('click', () => {
        createNewLayer('raster', true);
    });
    document.getElementById('add-vector-layer-btn').addEventListener('click', () => {
        createNewLayer('vector', true);
    });

    // Listener terpusat untuk memilih layer dengan klik
    const layerListDiv = document.getElementById('layer-list');
    layerListDiv.addEventListener('click', (e) => {
        const layerItem = e.target.closest('.layer-item');
        if (layerItem) {
            if (e.target.matches('input, select, button')) return;
            const index = parseInt(layerItem.dataset.layerIndex, 10);
            setActiveLayer(index);
        }
    });
    
    // Membuat layer pertama saat aplikasi dimuat
    createNewLayer('raster', false);
}

function createNewLayer(type, broadcast = false, customName) {
    const newLayer = {
        id: `layer-${layerCounter}`,
        name: customName || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer ${layerCounter}`,
        type: type,
        canvas: document.createElement('canvas'),
        visible: true,
        opacity: 1,
        blendMode: 'source-over',
        ctx: null,
        fabricCanvas: null,
    };
    
    newLayer.canvas.className = 'drawing-layer';
    newLayer.canvas.width = 800;
    newLayer.canvas.height = 600;
    document.getElementById('canvas-container').appendChild(newLayer.canvas);

    if (type === 'raster') {
        newLayer.ctx = newLayer.canvas.getContext('2d', { willReadFrequently: true });
        if (window.setupCanvasEventListeners) setupCanvasEventListeners(newLayer.canvas);
        if (window.registerLayerHistory) registerLayerHistory(newLayer.id);
    } else if (type === 'vector') {
        newLayer.fabricCanvas = new fabric.Canvas(newLayer.canvas, { isDrawingMode: false });
    }
    
    layerState.layers.unshift(newLayer);
    layerCounter++;

    if (broadcast && window.sendDrawData) {
        const layerData = { id: newLayer.id, name: newLayer.name, type: newLayer.type, opacity: newLayer.opacity, blendMode: newLayer.blendMode };
        sendDrawData({ type: 'layer_add', layer: layerData });
    }

    renderLayerList();
    setActiveLayer(0);
    return newLayer;
}

function addLayerFromBroadcast(data) {
    const layerData = data.layer;
    const canvasContainer = document.getElementById('canvas-container');
    const newCanvasEl = document.createElement('canvas');
    newCanvasEl.className = 'drawing-layer';
    newCanvasEl.width = 800;
    newCanvasEl.height = 600;
    canvasContainer.appendChild(newCanvasEl);

    const newLayer = {
        id: layerData.id, name: layerData.name, type: layerData.type,
        canvas: newCanvasEl, visible: true, opacity: layerData.opacity,
        blendMode: layerData.blendMode, ctx: null, fabricCanvas: null,
    };
    
    const idNum = parseInt(layerData.id.split('-')[1]);
    if (idNum >= layerCounter) layerCounter = idNum + 1;

    if (newLayer.type === 'raster') {
        newLayer.ctx = newCanvasEl.getContext('2d', { willReadFrequently: true });
        if (window.setupCanvasEventListeners) setupCanvasEventListeners(newCanvasEl);
        if (window.registerLayerHistory) registerLayerHistory(newLayer.id);
    } else if (newLayer.type === 'vector') {
        newLayer.fabricCanvas = new fabric.Canvas(newCanvasEl, { isDrawingMode: false });
    }
    
    layerState.layers.unshift(newLayer);
    renderLayerList();
    updateCanvasOrder();
}

function setActiveLayer(index) {
    if (index === layerState.activeLayerIndex || index < 0 || index >= layerState.layers.length) return;

    // Hapus event listener dari layer raster sebelumnya
    const prevLayer = getActiveLayer();
    if (prevLayer && prevLayer.type === 'raster' && window.removeCanvasEventListeners) {
        removeCanvasEventListeners(prevLayer.canvas);
    }
    if (prevLayer && prevLayer.type === 'vector') {
        if (window.endPenToolPath) endPenToolPath();
    }

    layerState.activeLayerIndex = index;
    const newActiveLayer = getActiveLayer();

    // Pasang event listener ke layer raster baru
    if (newActiveLayer && newActiveLayer.type === 'raster' && window.setupCanvasEventListeners) {
        setupCanvasEventListeners(newActiveLayer.canvas);
    }

    // Pindahkan canvas layer aktif ke urutan paling atas di DOM agar bisa digambar
    if (newActiveLayer && newActiveLayer.canvas) {
        const container = document.getElementById('canvas-container');
        container.appendChild(newActiveLayer.canvas);
    }

    document.querySelectorAll('.layer-item').forEach((item) => {
        item.classList.toggle('active', parseInt(item.dataset.layerIndex, 10) === index);
    });
    
    if (window.updateToolVisibility) updateToolVisibility(newActiveLayer.type === 'raster');
    if (window.updateHistoryButtons) updateHistoryButtons();
}

function getActiveLayer() {
    if (layerState.activeLayerIndex === -1) return null;
    return layerState.layers[layerState.activeLayerIndex];
}

function renderLayerList() {
    const layerListDiv = document.getElementById('layer-list');
    layerListDiv.innerHTML = '';
    layerState.layers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.layerIndex = index;
        layerItem.draggable = true;
        if (index === layerState.activeLayerIndex) layerItem.classList.add('active');
        
        const layerName = document.createElement('div');
        layerName.className = 'layer-name';
        layerName.textContent = layer.name;
        // Tambahkan fitur rename
        layerName.title = 'Double click to rename';
        layerName.style.cursor = 'pointer';
        layerName.ondblclick = function() {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = layer.name;
            input.className = 'layer-rename-input';
            input.style.width = '90%';
            input.onblur = input.onkeydown = function(e) {
                if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
                    layer.name = input.value.trim() || layer.name;
                    renderLayerList();
                }
            };
            layerName.textContent = '';
            layerName.appendChild(input);
            input.focus();
            input.select();
        };
        layerItem.appendChild(layerName);
        
        const controls = document.createElement('div');
        controls.className = 'layer-controls';
        controls.innerHTML += `<label>Opacity: <span id="opacity-value-${layer.id}">${Math.round(layer.opacity * 100)}</span>%</label><input type="range" min="0" max="1" step="0.01" value="${layer.opacity}" data-layer-id="${layer.id}" class="opacity-slider">`;
        const blendModes = ['source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'];
        let options = blendModes.map(mode => `<option value="${mode}" ${layer.blendMode === mode ? 'selected' : ''}>${mode.charAt(0).toUpperCase() + mode.slice(1)}</option>`).join('');
        controls.innerHTML += `<label>Blend Mode</label><select data-layer-id="${layer.id}" class="blend-mode-select">${options}</select>`;
        layerItem.appendChild(controls);

        addDragAndDropEventListeners(layerItem);
        layerListDiv.appendChild(layerItem);
    });
    addControlEventListeners();
    updateCanvasOrder();
}

function addControlEventListeners() {
    document.querySelectorAll('.opacity-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const layerId = e.target.dataset.layerId;
            const newOpacity = parseFloat(e.target.value);
            const layer = layerState.layers.find(l => l.id === layerId);
            if (layer) {
                layer.opacity = newOpacity;
                layer.canvas.style.opacity = newOpacity;
                document.getElementById(`opacity-value-${layerId}`).textContent = Math.round(newOpacity * 100);
            }
        });
    });
    document.querySelectorAll('.blend-mode-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const layerId = e.target.dataset.layerId;
            const newBlendMode = e.target.value;
            const layer = layerState.layers.find(l => l.id === layerId);
            if (layer) {
                layer.blendMode = newBlendMode;
                layer.canvas.style.mixBlendMode = newBlendMode;
            }
        });
    });
}

let draggedItem = null;
function addDragAndDropEventListeners(item) {
    item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        setTimeout(() => item.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
        setTimeout(() => {
            if(draggedItem) draggedItem.classList.remove('dragging');
            draggedItem = null;
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        }, 0);
    });
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (item !== draggedItem) {
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            item.classList.add('drag-over');
        }
    });
    item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
    });
    item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (item !== draggedItem) {
            const fromIndex = parseInt(draggedItem.dataset.layerIndex);
            const toIndex = parseInt(item.dataset.layerIndex);
            const [movedLayer] = layerState.layers.splice(fromIndex, 1);
            layerState.layers.splice(toIndex, 0, movedLayer);
            layerState.activeLayerIndex = layerState.layers.findIndex(l => l.id === getActiveLayer().id);
            renderLayerList();
            updateCanvasOrder();
        }
        item.classList.remove('drag-over');
    });
}

function updateCanvasOrder() {
    const container = document.getElementById('canvas-container');
    const reversedLayers = [...layerState.layers].reverse();
    reversedLayers.forEach(layer => {
        container.appendChild(layer.canvas);
    });
}

function importImageFromBroadcast(data) {
    addLayerFromBroadcast(data); 
    const targetLayer = layerState.layers.find(l => l.id === data.layer.id);
    if (!targetLayer || targetLayer.type !== 'raster') return;

    const img = new Image();
    img.onload = function() {
        targetLayer.ctx.drawImage(img, 0, 0);
        if (window.saveState) {
            const oldActiveIndex = layerState.activeLayerIndex;
            layerState.activeLayerIndex = layerState.layers.findIndex(l => l.id === targetLayer.id);
            saveState();
            layerState.activeLayerIndex = oldActiveIndex;
        }
    };
    img.src = data.imageDataUrl;
}

function handlePenToolClick(options) {
    const pointer = options.pointer;
    const fabricCanvas = getActiveLayer()?.fabricCanvas;
    if (!fabricCanvas) return;

    if (currentPenPath === null) {
        currentPathPoints = [`M ${pointer.x} ${pointer.y}`];
        const path = new fabric.Path(currentPathPoints.join(' '), {
            stroke: toolState.color, strokeWidth: toolState.brushSize,
            fill: null, objectCaching: false,
        });
        fabricCanvas.add(path);
        currentPenPath = path;
    } else {
        currentPathPoints.push(`L ${pointer.x} ${pointer.y}`);
        currentPenPath.set({ path: currentPathPoints.map(p => p.split(' ')) });
        fabricCanvas.renderAll();
    }
}

function endPenToolPath() {
    if (currentPenPath) {
        const fabricCanvas = getActiveLayer()?.fabricCanvas;
        if (!fabricCanvas) {
            currentPenPath = null;
            currentPathPoints = [];
            return;
        }
        fabricCanvas.remove(currentPenPath);
        const finalPath = new fabric.Path(currentPenPath.path, {
            stroke: currentPenPath.stroke,
            strokeWidth: currentPenPath.strokeWidth,
            fill: currentPenPath.fill,
        });
        fabricCanvas.add(finalPath);
        fabricCanvas.renderAll();
    }
    currentPenPath = null;
    currentPathPoints = [];
}