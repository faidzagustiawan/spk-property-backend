const db = require('../config/db');

class ResultRepository {
    static async saveBatchResults(caseId, method, resultsData) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // Hapus hasil kalkulasi sebelumnya untuk case dan metode yang sama
            const deleteQuery = `DELETE FROM results WHERE case_id = $1 AND method = $2`;
            await client.query(deleteQuery, [caseId, method]);

            // Insert hasil baru
            const insertQuery = `
                INSERT INTO results (case_id, alternative_id, method, score, ranking) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
            `;
            
            const savedResults = [];
            for (const item of resultsData) {
                const { rows } = await client.query(insertQuery, [
                    caseId, 
                    item.alternative_id, 
                    method, 
                    item.score, 
                    item.ranking
                ]);
                savedResults.push(rows[0]);
            }

            await client.query('COMMIT');
            return savedResults;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = ResultRepository;