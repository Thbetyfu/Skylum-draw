/**
 * Fungsi ini akan dipanggil secara otomatis oleh browser jika terjadi error.
 */
function initializeErrorHandler() {
    window.onerror = function(message, source, lineno, colno, error) {
        // Buat pesan log yang lebih informatif
        const formattedMessage = `[ERROR TERDETEKSI]
        - Pesan: ${message}
        - File: ${source.split('/').pop()}
        - Baris: ${lineno}, Kolom: ${colno}`;
        
        // Tampilkan di console dengan style error
        console.error(formattedMessage);
        
        // Tampilkan notifikasi visual di layar
        showErrorNotification(`Error pada file ${source.split('/').pop()} baris ${lineno}: ${message}`);

        // Kembalikan true untuk mencegah browser menampilkan error default-nya
        return true; 
    };
    console.log("✅ Modul 'ErrorHandler' siap menangkap error.");
}

/**
 * Fungsi untuk menampilkan notifikasi error di bagian atas layar.
 */
function showErrorNotification(message) {
    const oldNotification = document.getElementById('error-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.id = 'error-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 7000); // Tampilkan selama 7 detik
}