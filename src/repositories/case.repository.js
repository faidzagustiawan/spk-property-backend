const db = require('../config/db');

class CaseRepository {
    // Membuat case baru
    static async create(userId, caseName, description) {
        const query = `
            INSERT INTO decision_case (user_id, case_name, description) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const values = [userId, caseName, description];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    // Mengambil semua case berdasarkan user
    static async findAllByUserId(userId) {
        const query = `
            SELECT * FROM decision_case 
            WHERE user_id = $1 
            ORDER BY created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    // Mengambil detail satu case beserta kriterianya
    static async findById(caseId) {
        const query = `
            SELECT 
                dc.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'criteria_id', c.criteria_id,
                            'criteria_name', c.criteria_name,
                            'criteria_type', c.criteria_type,
                            'weight', c.weight
                        )
                    ) FILTER (WHERE c.criteria_id IS NOT NULL), '[]'
                ) as criteria
            FROM decision_case dc
            LEFT JOIN criteria c ON dc.case_id = c.case_id
            WHERE dc.case_id = $1
            GROUP BY dc.case_id;
        `;
        const { rows } = await db.query(query, [caseId]);
        return rows[0];
    }

    static async update(caseId, userId, caseName, description) {
        const query = `
            UPDATE decision_case 
            SET case_name = $1, description = $2 
            WHERE case_id = $3 AND user_id = $4
            RETURNING *;
        `;
        const { rows } = await db.query(query, [caseName, description, caseId, userId]);
        return rows[0];
    }

    static async delete(caseId, userId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // Verifikasi kepemilikan case
            const checkQuery = 'SELECT case_id FROM decision_case WHERE case_id = $1 AND user_id = $2';
            const { rows } = await client.query(checkQuery, [caseId, userId]);
            if (rows.length === 0) throw new Error('Case tidak ditemukan atau bukan milik Anda');

            // Hapus secara hierarkis (Child to Parent)
            await client.query('DELETE FROM results WHERE case_id = $1', [caseId]);
            await client.query('DELETE FROM criteria_comparisons WHERE case_id = $1', [caseId]);
            
            // Hapus alternative_values dengan join alternatives
            await client.query(`
                DELETE FROM alternative_values 
                WHERE alternative_id IN (SELECT alternative_id FROM alternatives WHERE case_id = $1)
            `, [caseId]);
            
            await client.query('DELETE FROM alternatives WHERE case_id = $1', [caseId]);
            await client.query('DELETE FROM criteria WHERE case_id = $1', [caseId]);
            await client.query('DELETE FROM decision_case WHERE case_id = $1', [caseId]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
}

module.exports = CaseRepository;