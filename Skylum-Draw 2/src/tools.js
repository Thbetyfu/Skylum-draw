const toolState = {
    activeTool: 'brush',
    activeBrush: 'round',
    color: '#000000',
    brushSize: 5,
    activeVectorTool: 'select',
};

const brushes = ['round', 'square', 'calligraphy'];

function initializeTools() {
    const colorPicker = document.getElementById('color-picker');
    const brushSizeSlider = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    
    const brushBtn = document.getElementById('brush-tool');
    const eraserBtn = document.getElementById('eraser-tool');
    const vectorDrawBtn = document.getElementById('vector-draw-btn');
    const penToolBtn = document.getElementById('pen-tool-btn');

    const brushSelector = document.getElementById('brush-selector');
    brushSelector.innerHTML = '';
    brushes.forEach(brushName => {
        const brushPreview = document.createElement('button');
        brushPreview.className = 'brush-preview';
        brushPreview.dataset.brushName = brushName;
        brushPreview.textContent = brushName.charAt(0).toUpperCase();
        if (brushName === toolState.activeBrush) {
            brushPreview.classList.add('active');
        }
        brushPreview.addEventListener('click', () => {
            toolState.activeBrush = brushName;
            document.querySelectorAll('.brush-preview').forEach(p => p.classList.remove('active'));
            brushPreview.classList.add('active');
        });
        brushSelector.appendChild(brushPreview);
    });

    colorPicker.addEventListener('change', (e) => {
        toolState.color = e.target.value;
        updateBrushProperties();
    });
    brushSizeSlider.addEventListener('input', (e) => {
        toolState.brushSize = e.target.value;
        brushSizeValue.textContent = e.target.value;
        updateBrushProperties();
    });

    brushBtn.addEventListener('click', () => setActiveTool('brush'));
    eraserBtn.addEventListener('click', () => setActiveTool('eraser'));
    vectorDrawBtn.addEventListener('click', () => setVectorTool('freehand'));
    penToolBtn.addEventListener('click', () => setVectorTool('pen'));
}

function setActiveTool(toolName) {
    toolState.activeTool = toolName;
    document.getElementById('brush-tool').classList.toggle('active', toolName === 'brush');
    document.getElementById('eraser-tool').classList.toggle('active', toolName === 'eraser');
}

function setVectorTool(toolName) {
    const activeLayer = getActiveLayer();
    if (!activeLayer || activeLayer.type !== 'vector' || !activeLayer.fabricCanvas) return;

    if (toolState.activeVectorTool === toolName) {
        toolName = 'select';
    }
    toolState.activeVectorTool = toolName;

    const fabricCanvas = activeLayer.fabricCanvas;

    fabricCanvas.isDrawingMode = false;
    if(window.handlePenToolClick) fabricCanvas.off('mouse:down', handlePenToolClick);
    if (window.endPenToolPath) endPenToolPath();

    if (toolName === 'freehand') {
        fabricCanvas.isDrawingMode = true;
    } else if (toolName === 'pen') {
        if(window.handlePenToolClick) fabricCanvas.on('mouse:down', handlePenToolClick);
    }

    document.getElementById('vector-draw-btn').classList.toggle('active', toolName === 'freehand');
    document.getElementById('pen-tool-btn').classList.toggle('active', toolName === 'pen');
}

function updateBrushProperties() {
    const activeLayer = getActiveLayer();
    if (activeLayer && activeLayer.type === 'vector' && activeLayer.fabricCanvas) {
        const brush = activeLayer.fabricCanvas.freeDrawingBrush;
        brush.color = toolState.color;
        brush.width = parseInt(toolState.brushSize, 10);
    }
}

function updateToolVisibility(isRaster) {
    const rasterTools = document.getElementById('raster-tools');
    const vectorTools = document.getElementById('vector-tools');
    if(rasterTools) rasterTools.style.display = isRaster ? 'block' : 'none';
    if(vectorTools) vectorTools.style.display = isRaster ? 'none' : 'block';

    if (!isRaster) {
        setActiveTool(null);
        setVectorTool('select');
    }
}