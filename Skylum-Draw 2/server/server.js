const WebSocket = require('ws');
const { URLSearchParams } = require('url');

// Kita gunakan Map untuk menyimpan semua ruangan.
// Key: sessionId, Value: Set dari koneksi klien (ws)
const rooms = new Map();

const wss = new WebSocket.Server({ port: 8080 });

console.log('Server WebSocket dengan sistem Ruangan berjalan di port 8080...');

wss.on('connection', (ws, req) => {
    // Ambil ID sesi dari URL koneksi
    const params = new URLSearchParams(req.url.slice(1)); // slice(1) untuk menghapus '/' di awal
    const sessionId = params.get('session');

    if (!sessionId) {
        console.log('Koneksi ditolak: tidak ada ID Sesi.');
        ws.close();
        return;
    }

    // Jika ruangan belum ada, buat ruangan baru
    if (!rooms.has(sessionId)) {
        rooms.set(sessionId, new Set());
    }

    // Dapatkan ruangan dan tambahkan klien baru ke dalamnya
    const room = rooms.get(sessionId);
    room.add(ws);

    // Simpan ID sesi di koneksi ws untuk referensi nanti
    ws.sessionId = sessionId;

    console.log(`Klien baru terhubung ke ruangan: ${sessionId}. Total klien di ruangan: ${room.size}`);

    ws.on('message', message => {
        // Saat menerima pesan, teruskan HANYA ke klien di ruangan yang sama
        const senderSessionId = ws.sessionId;
        const targetRoom = rooms.get(senderSessionId);

        if (targetRoom) {
            targetRoom.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        }
    });

    ws.on('close', () => {
        const senderSessionId = ws.sessionId;
        const room = rooms.get(senderSessionId);

        if (room) {
            // Hapus klien dari ruangan saat koneksi terputus
            room.delete(ws);
            console.log(`Klien terputus dari ruangan: ${senderSessionId}. Sisa klien: ${room.size}`);

            // Jika ruangan menjadi kosong, hapus ruangan untuk menghemat memori
            if (room.size === 0) {
                rooms.delete(senderSessionId);
                console.log(`Ruangan ${senderSessionId} kosong dan telah dihapus.`);
            }
        }
    });
});