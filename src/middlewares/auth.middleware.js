const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Ambil header Authorization
    const authHeader = req.header('Authorization');

    // Cek apakah header ada dan formatnya "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan atau format salah.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data user dari token ke dalam request object
        req.user = decoded;
        
        // Lanjut ke controller berikutnya
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
    }
};

module.exports = authMiddleware;