let ws;

function initializeWebSocket() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');

    // Jika tidak ada ID sesi, hentikan fungsi
    if (!sessionId) {
        console.log("Tidak ada ID Sesi. Kolaborasi tidak aktif.");
        return; 
    }

    // Hanya gunakan satu baris ini untuk membuat koneksi
    ws = new WebSocket(`ws://localhost:8080?session=${sessionId}`);

    ws.onopen = () => {
        console.log('Terhubung ke server WebSocket!');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stroke') {
            drawStrokeFromBroadcast(data);
        } 
        else if (data.type === 'canvas_state_update') {
            updateLayerFromBroadcast(data);
        }
        else if (data.type === 'import_image') {
            importImageFromBroadcast(data);
        }
        else if (data.type === 'layer_add') {
            addLayerFromBroadcast(data);
        }
    };

    ws.onclose = () => {
        console.log('Koneksi WebSocket ditutup.');
    };
    
    ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
    };
}

function sendDrawData(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}