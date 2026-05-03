const db = require('../config/db');

class AlternativeRepository {
    static async createWithValues(caseId, alternativeName, description, values) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN'); // Mulai Transaksi

            // 1. Insert Alternatif
            const insertAltQuery = `
                INSERT INTO alternatives (case_id, alternative_name, description) 
                VALUES ($1, $2, $3) RETURNING alternative_id, alternative_name;
            `;
            const altResult = await client.query(insertAltQuery, [caseId, alternativeName, description]);
            const newAlternative = altResult.rows[0];
            const alternativeId = newAlternative.alternative_id;

            // 2. Insert Nilai-nilai Alternatif ke tabel alternative_values
            const insertedValues = [];
            const insertValueQuery = `
                INSERT INTO alternative_values (alternative_id, criteria_id, value) 
                VALUES ($1, $2, $3) RETURNING *;
            `;

            for (const item of values) {
                const valResult = await client.query(insertValueQuery, [alternativeId, item.criteria_id, item.value]);
                insertedValues.push(valResult.rows[0]);
            }

            await client.query('COMMIT'); // Simpan permanen

            return {
                ...newAlternative,
                values: insertedValues
            };
        } catch (error) {
            await client.query('ROLLBACK'); // Batalkan jika terjadi error
            throw error;
        } finally {
            client.release(); // Kembalikan koneksi ke pool
        }
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
}

module.exports = AlternativeRepository;