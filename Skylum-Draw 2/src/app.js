window.addEventListener('DOMContentLoaded', () => {
    initializeErrorHandler();
    
    console.log('--- Memulai Pengecekan Modul Skylum Draw ---');
    const allModulesLoaded = checkModules();

    if (allModulesLoaded) {
        console.log('--- Semua modul ditemukan. Menjalankan aplikasi... ---');
        
        initializeLayers();
        initializeTools();
        initializeHistory();
        initializeWebSocket();
        initializeViewport();
        initializeIO();
        initializeGrid();
        setupKeyboardShortcuts();
        
        console.log('--- Skylum Draw Simple Berhasil Dimuat ---');
    } else {
        console.error('!!! APLIKASI GAGAL DIMUAT !!! Beberapa modul penting tidak ditemukan. Silakan periksa pesan peringatan di atas dan pastikan semua file skrip sudah benar di index.html.');
    }
});

function checkModules() {
    let allFound = true;
    const required = [ 'initializeTools', 'initializeHistory', 'initializeWebSocket', 'initializeLayers', 'initializeViewport', 'initializeIO', 'initializeGrid', 'setupKeyboardShortcuts', 'fabric' ];

    required.forEach(funcName => {
        if (typeof window[funcName] === 'function' || typeof window[funcName] === 'object') {
            console.log(`✅ Modul '${funcName}' ditemukan.`);
        } else {
            console.warn(`⚠️ Peringatan: Modul atau fungsi '${funcName}' TIDAK DITEMUKAN!`);
            allFound = false;
        }
    });
    return allFound;
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'z': e.preventDefault(); undo(); break;
                case 'y': e.preventDefault(); redo(); break;
            }
        } else {
            if (e.target.tagName === 'INPUT') return;
            switch (e.key.toLowerCase()) {
                case 'b': setActiveTool('brush'); break;
                case 'e': setActiveTool('eraser'); break;
            }
        }
    });
}