const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/user.repository');

class AuthController {
    static async register(req, res) {
        try {
            const { username, password, role } = req.body;

            // 1. Cek apakah user sudah ada
            const existingUser = await UserRepository.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'Username sudah digunakan' });
            }

            // 2. Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 3. Simpan ke database
            const newUser = await UserRepository.create(username, passwordHash, role);

            res.status(201).json({
                message: 'Registrasi berhasil',
                user: newUser
            });
        } catch (error) {
            console.error('Error in register:', error);
            res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // 1. Cari user di database
            const user = await UserRepository.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Username atau password salah' });
            }

            // 2. Cek kecocokan password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Username atau password salah' });
            }

            // 3. Buat JWT Token
            const token = jwt.sign(
                { user_id: user.user_id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login berhasil',
                token: token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error in login:', error);
            res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        }
    }
}

module.exports = AuthController;