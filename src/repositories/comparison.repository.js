const db = require('../config/db');

class ComparisonRepository {
    // Menyimpan batch perbandingan berpasangan
    static async saveComparisons(caseId, comparisons) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // Hapus perbandingan lama jika ada (reset)
            await client.query('DELETE FROM criteria_comparisons WHERE case_id = $1', [caseId]);

            const insertQuery = `
                INSERT INTO criteria_comparisons (case_id, criteria_1, criteria_2, comparison_value) 
                VALUES ($1, $2, $3, $4) RETURNING *;
            `;

            const saved = [];
            for (const comp of comparisons) {
                const { rows } = await client.query(insertQuery, [
                    caseId, 
                    comp.criteria_1, 
                    comp.criteria_2, 
                    comp.comparison_value
                ]);
                saved.push(rows[0]);
            }

            await client.query('COMMIT');
            return saved;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Mengambil semua perbandingan untuk satu case
    static async getComparisons(caseId) {
        const query = 'SELECT * FROM criteria_comparisons WHERE case_id = $1';
        const { rows } = await db.query(query, [caseId]);
        return rows;
    }

    // Update bobot ke tabel criteria setelah AHP selesai
    static async updateCriteriaWeights(weightsData) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            const updateQuery = 'UPDATE criteria SET weight = $1 WHERE criteria_id = $2';
            for (const item of weightsData) {
                await client.query(updateQuery, [item.weight, item.criteria_id]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = ComparisonRepository;