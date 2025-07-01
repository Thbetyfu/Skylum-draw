// Buat file baru src/grid.js

let gridCanvas, gridCtx, gridVisible = false;
const gridSize = 20; // Ukuran kotak grid dalam piksel

function initializeGrid() {
    gridCanvas = document.getElementById('grid-canvas');
    gridCtx = gridCanvas.getContext('2d');
    
    // Sesuaikan ukuran kanvas grid dengan kontainernya
    gridCanvas.width = gridCanvas.parentElement.offsetWidth;
    gridCanvas.height = gridCanvas.parentElement.offsetHeight;

    const gridToggle = document.getElementById('grid-toggle');
    gridToggle.addEventListener('change', (e) => {
        gridVisible = e.target.checked;
        drawGrid();
    });
}

function drawGrid() {
    // Bersihkan kanvas grid
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!gridVisible) return; // Jika tidak terlihat, jangan gambar

    gridCtx.strokeStyle = '#cccccc';
    gridCtx.globalAlpha = 0.2;
    gridCtx.lineWidth = 1;
    
    // Gambar garis vertikal
    for (let x = 0; x < gridCanvas.width; x += gridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
    }

    // Gambar garis horizontal
    for (let y = 0; y < gridCanvas.height; y += gridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
    }
}