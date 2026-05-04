const db = require('../config/db');

class AlternativeRepository {
    

    static async create(caseId, alternativeName, description) {
        const query = `
            INSERT INTO alternatives (case_id, alternative_name, description) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [caseId, alternativeName, description]);
        return rows[0];
    }

    // 2. Fungsi Update (Bonus agar CRUD lengkap)
    static async update(alternativeId, alternativeName, description) {
        const query = `
            UPDATE alternatives 
            SET alternative_name = $1, description = $2 
            WHERE alternative_id = $3 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [alternativeName, description, alternativeId]);
        return rows[0];
    }

    static async findByCaseId(caseId) {
        // Query ini menggabungkan alternatif dengan semua nilainya ke dalam format JSON array
        const query = `
            SELECT 
                a.alternative_id,
                a.alternative_name,
                a.description,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'criteria_id', av.criteria_id,
                            'value', av.value
                        )
                    ) FILTER (WHERE av.value_id IS NOT NULL), '[]'
                ) as criteria_values
            FROM alternatives a
            LEFT JOIN alternative_values av ON a.alternative_id = av.alternative_id
            WHERE a.case_id = $1
            GROUP BY a.alternative_id, a.alternative_name, a.description
            ORDER BY a.alternative_id ASC;
        `;
        const { rows } = await db.query(query, [caseId]);
        return rows;
    }

    static async delete(alternativeId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM results WHERE alternative_id = $1', [alternativeId]);
            await client.query('DELETE FROM alternative_values WHERE alternative_id = $1', [alternativeId]);
            await client.query('DELETE FROM alternatives WHERE alternative_id = $1', [alternativeId]);
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

module.exports = AlternativeRepository;