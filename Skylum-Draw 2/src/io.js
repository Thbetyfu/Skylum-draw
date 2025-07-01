function initializeIO() {
    const imageLoader = document.getElementById('image-loader');
    const exportPngBtn = document.getElementById('export-png-btn');
    const exportJpgBtn = document.getElementById('export-jpg-btn');
    const importBtn = document.getElementById('import-btn');
    const shareBtn = document.getElementById('share-btn');
    const modal = document.getElementById('share-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const shareLinkInput = document.getElementById('share-link-input');

    shareBtn.addEventListener('click', () => {
        let currentUrl = new URL(window.location.href);
        let sessionId = currentUrl.searchParams.get('session');

        // Jika belum ada ID sesi di URL, buat yang baru
        if (!sessionId) {
            sessionId = generateSessionId();
            currentUrl.searchParams.set('session', sessionId);
            // Perbarui URL di browser tanpa me-refresh halaman
            window.history.pushState({ path: currentUrl.href }, '', currentUrl.href);
        }

        // Tampilkan URL lengkap di input dan munculkan modal
        shareLinkInput.value = window.location.href;
        modal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Saat tombol "Impor" diklik, picu input file yang tersembunyi
    importBtn.addEventListener('click', () => {
        imageLoader.click();
    });

    // Saat pengguna memilih file
    imageLoader.addEventListener('change', handleImageImport);

    // Event listener untuk tombol ekspor
    exportPngBtn.addEventListener('click', () => exportImage('png'));
    exportJpgBtn.addEventListener('click', () => exportImage('jpeg'));
}


function handleImageImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            createNewLayer('raster', false, 'Image');
            const newLayer = getActiveLayer();
            
            newLayer.ctx.drawImage(img, 0, 0, newLayer.canvas.width, newLayer.canvas.height);
            saveState();

            const importData = {
                type: 'import_image',
                // Kita kirim 'layer' sama seperti pada 'layer_add'
                layer: {
                    id: newLayer.id,
                    name: newLayer.name,
                    type: newLayer.type,
                    opacity: newLayer.opacity,
                    blendMode: newLayer.blendMode,
                },
                imageDataUrl: event.target.result 
            };
            sendDrawData(importData);
        }
        img.src = event.target.result;
    }

    reader.readAsDataURL(file);
    e.target.value = '';
}

function exportImage(format) {
    // Buat kanvas sementara untuk menggabungkan semua layer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800; // Sesuaikan dengan ukuran kanvas utama
    tempCanvas.height = 600;
    const tempCtx = tempCanvas.getContext('2d');

    // Beri latar belakang putih agar area transparan tidak menjadi hitam
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Gambar setiap layer yang terlihat ke kanvas sementara, dari bawah ke atas
    const visibleLayers = [...layerState.layers].reverse(); // Salin dan balik urutan
    visibleLayers.forEach(layer => {
        if (layer.visible) {
            // Terapkan opacity dan blend mode dari layer
            tempCtx.globalAlpha = layer.opacity;
            tempCtx.globalCompositeOperation = layer.blendMode;
            // Gambar kanvas layer ke kanvas sementara
            tempCtx.drawImage(layer.canvas, 0, 0);
        }
    });

    // Buat link download
    const link = document.createElement('a');
    link.download = `skylum-drawing.${format}`;
    link.href = tempCanvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : 1.0); // Kualitas 90% untuk JPG
    
    // Picu download secara otomatis
    link.click();
}

function generateSessionId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
