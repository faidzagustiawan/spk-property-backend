const db = require('../config/db');

class CriteriaRepository {
    static async create(caseId, criteriaName, criteriaType, weight) {
        const query = `
            INSERT INTO criteria (case_id, criteria_name, criteria_type, weight) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *;
        `;
        const values = [caseId, criteriaName, criteriaType, weight];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByCaseId(caseId) {
        const query = `
            SELECT * FROM criteria 
            WHERE case_id = $1 
            ORDER BY criteria_id ASC;
        `;
        const { rows } = await db.query(query, [caseId]);
        return rows;
    }

    static async update(criteriaId, criteriaName, criteriaType, weight) {
        const query = `
            UPDATE criteria 
            SET criteria_name = $1, criteria_type = $2, weight = $3 
            WHERE criteria_id = $4 RETURNING *;
        `;
        const { rows } = await db.query(query, [criteriaName, criteriaType, weight, criteriaId]);
        return rows[0];
    }

    static async delete(criteriaId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            // Hapus relasi yang bergantung pada kriteria ini
            await client.query('DELETE FROM alternative_values WHERE criteria_id = $1', [criteriaId]);
            await client.query('DELETE FROM criteria_comparisons WHERE criteria_1 = $1 OR criteria_2 = $1', [criteriaId]);
            await client.query('DELETE FROM criteria WHERE criteria_id = $1', [criteriaId]);
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

module.exports = CriteriaRepository;