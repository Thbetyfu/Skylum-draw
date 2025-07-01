// Pengaturan dan fungsi untuk viewport (zoom dan pan)
const viewport = { scale: 1, panX: 0, panY: 0 };

function initializeViewport() {
    const mainContent = document.getElementById('main-content');
    let isPanning = false;
    let panStartX, panStartY;

    mainContent.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const zoomIntensity = 0.1;
        viewport.scale += e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
        viewport.scale = Math.max(0.1, viewport.scale);
        updateTransform();
    }, { passive: false });

    mainContent.addEventListener('mousedown', (e) => {
        if (e.code === 'Space' || e.button === 1) {
            isPanning = true;
            mainContent.classList.add('panning');
            panStartX = e.clientX - viewport.panX;
            panStartY = e.clientY - viewport.panY;
        }
    });

    mainContent.addEventListener('mousemove', (e) => {
        if (isPanning) {
            viewport.panX = e.clientX - panStartX;
            viewport.panY = e.clientY - panStartY;
            updateTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            mainContent.classList.remove('panning');
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') mainContent.style.cursor = 'grab';
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') mainContent.style.cursor = 'default';
    });
}

function updateTransform() {
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.style.transform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.scale})`;
    }
    const zoomStatus = document.getElementById('zoom-status');
    if (zoomStatus) {
        zoomStatus.textContent = `Zoom: ${Math.round(viewport.scale * 100)}%`;
    }
}


// --- FUNGSI BANTU BARU UNTUK MENGGAMBAR SEMUA BENTUK KUAS ---
/**
 * Menggambar satu cap bentuk kuas. Ini adalah pusat logika untuk semua kuas.
 */
function drawBrushShape(ctx, x, y, size, angle, brushType) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle); // Rotasi kuas agar mengikuti arah goresan

    switch (brushType) {
        case 'square':
            ctx.fillRect(-size / 2, -size / 2, size, size);
            break;
        case 'calligraphy':
            ctx.rotate(Math.PI / 4); // Miringkan 45 derajat untuk efek pipih
            ctx.fillRect(-size, -size / 4, size * 2, size / 2);
            break;
        case 'round':
        default:
            ctx.beginPath();
            ctx.rotate(-angle); // Batalkan rotasi agar lingkaran tetap bulat sempurna
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    ctx.restore();
}


// --- INTI LOGIKA MENGGAMBAR ---
window.setupCanvasEventListeners = function(canvas) {
    // Jika sudah ada handler sebelumnya, hapus dulu
    if (canvas._skylumHandlers) {
        canvas.removeEventListener('mousedown', canvas._skylumHandlers.mousedown);
        canvas.removeEventListener('mousemove', canvas._skylumHandlers.mousemove);
        canvas.removeEventListener('mouseup', canvas._skylumHandlers.mouseup);
        canvas.removeEventListener('mouseleave', canvas._skylumHandlers.mouseleave);
    }

    let isDrawing = false;
    let currentStroke = [];

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / viewport.scale;
        const y = (e.clientY - rect.top) / viewport.scale;
        return { x, y };
    }

    function draw(e) {
        if (!isDrawing) return;
        const activeLayer = getActiveLayer();
        if (!activeLayer || activeLayer.type !== 'raster' || !activeLayer.ctx) return;
        const ctx = activeLayer.ctx;
        const pos = getMousePos(e);
        currentStroke.push(pos);
        if (currentStroke.length < 2) return;
        const lastPoint = currentStroke[currentStroke.length - 2];
        const currentPoint = currentStroke[currentStroke.length - 1];
        const size = parseInt(toolState.brushSize, 10);
        const spacing = Math.max(size * 0.15, 1);
        const distance = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
        const angle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);
        ctx.fillStyle = toolState.color;
        ctx.globalCompositeOperation = toolState.activeTool === 'eraser' ? 'destination-out' : 'source-over';
        for (let i = 0; i < distance; i += spacing) {
            const x = lastPoint.x + (Math.cos(angle) * i);
            const y = lastPoint.y + (Math.sin(angle) * i);
            drawBrushShape(ctx, x, y, size, angle, toolState.activeBrush);
        }
    }

    function mousedown(e) {
        if (e.code === 'Space' || e.button === 1 || !getActiveLayer() || getActiveLayer().type !== 'raster') return;
        isDrawing = true;
        currentStroke = [];
        const pos = getMousePos(e);
        currentStroke.push(pos);
    }
    function mousemove(e) { draw(e); }
    function mouseupOrLeave() {
        if (!isDrawing) return;
        isDrawing = false;
        if (currentStroke.length > 1 && toolState.activeTool === 'brush') {
            const strokeData = {
                type: 'stroke',
                path: currentStroke,
                color: toolState.color,
                size: toolState.brushSize,
                brush: toolState.activeBrush,
                layerId: getActiveLayer().id
            };
            sendDrawData(strokeData);
        }
        if(getActiveLayer() && getActiveLayer().type === 'raster') saveState();
    }

    canvas.addEventListener('mousedown', mousedown);
    canvas.addEventListener('mousemove', mousemove);
    canvas.addEventListener('mouseup', mouseupOrLeave);
    canvas.addEventListener('mouseleave', mouseupOrLeave);

    // Simpan referensi handler agar bisa dihapus nanti
    canvas._skylumHandlers = {
        mousedown,
        mousemove,
        mouseup: mouseupOrLeave,
        mouseleave: mouseupOrLeave
    };
}

// Fungsi untuk menggambar dari broadcast, SEKARANG SINKRON DENGAN LOGIKA LOKAL
function drawStrokeFromBroadcast(data) {
    const targetLayer = layerState.layers.find(l => l.id === data.layerId);
    if (!targetLayer || targetLayer.type !== 'raster') return;

    const ctx = targetLayer.ctx;
    const path = data.path;
    const brushSize = parseInt(data.size, 10);
    const spacing = Math.max(brushSize * 0.15, 1);
    
    if (path.length < 2) return;

    ctx.fillStyle = data.color;
    ctx.globalCompositeOperation = 'source-over';

    for (let p = 1; p < path.length; p++) {
        const lastPoint = path[p - 1];
        const currentPoint = path[p];
        const distance = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
        const angle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);

        for (let i = 0; i < distance; i += spacing) {
            const x = lastPoint.x + (Math.cos(angle) * i);
            const y = lastPoint.y + (Math.sin(angle) * i);
            // Panggil fungsi bantu yang sama, menggunakan jenis kuas dari data broadcast
            drawBrushShape(ctx, x, y, brushSize, angle, data.brush);
        }
    }
}

function updateLayerFromBroadcast(data) {
    const targetLayer = layerState.layers.find(l => l.id === data.layerId);
    const ctx = targetLayer?.ctx;
    if (!ctx) return;
    const img = new Image();
    img.onload = function() {
        ctx.clearRect(0, 0, targetLayer.canvas.width, targetLayer.canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = data.imageDataUrl;
}

window.removeCanvasEventListeners = function(canvas) {
    if (canvas && canvas._skylumHandlers) {
        canvas.removeEventListener('mousedown', canvas._skylumHandlers.mousedown);
        canvas.removeEventListener('mousemove', canvas._skylumHandlers.mousemove);
        canvas.removeEventListener('mouseup', canvas._skylumHandlers.mouseup);
        canvas.removeEventListener('mouseleave', canvas._skylumHandlers.mouseleave);
        delete canvas._skylumHandlers;
    }
}