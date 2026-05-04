const db = require('../config/db');

class ValueRepository {
    // Menyimpan atau memperbarui nilai untuk satu alternatif
    static async saveValues(alternativeId, values) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // Hapus nilai lama agar tidak duplikat saat update
            await client.query('DELETE FROM alternative_values WHERE alternative_id = $1', [alternativeId]);

            const insertQuery = `
                INSERT INTO alternative_values (alternative_id, criteria_id, value) 
                VALUES ($1, $2, $3) RETURNING *;
            `;

            const savedValues = [];
            for (const item of values) {
                const { rows } = await client.query(insertQuery, [alternativeId, item.criteria_id, item.value]);
                savedValues.push(rows[0]);
            }

            await client.query('COMMIT');
            return savedValues;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Mengambil matriks nilai berdasarkan case_id (Flat Array)
    static async getValuesByCaseId(caseId) {
        const query = `
            SELECT 
                av.value_id,
                av.value,
                a.alternative_id,
                a.alternative_name,
                c.criteria_id,
                c.criteria_name,
                c.criteria_type
            FROM alternative_values av
            JOIN alternatives a ON av.alternative_id = a.alternative_id
            JOIN criteria c ON av.criteria_id = c.criteria_id
            WHERE a.case_id = $1
            ORDER BY a.alternative_id ASC, c.criteria_id ASC;
        `;
        const { rows } = await db.query(query, [caseId]);
        return rows;
    }
}

module.exports = ValueRepository;