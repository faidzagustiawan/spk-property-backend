const db = require('../config/db');

class UserRepository {
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(query, [username]);
        return rows[0];
    }

    static async create(username, passwordHash, role = 'user') {
        const query = `
            INSERT INTO users (username, password_hash, role) 
            VALUES ($1, $2, $3) 
            RETURNING user_id, username, role, created_at;
        `;
        const { rows } = await db.query(query, [username, passwordHash, role]);
        return rows[0];
    }
}

module.exports = UserRepository;