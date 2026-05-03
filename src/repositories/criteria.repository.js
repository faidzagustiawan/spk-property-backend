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
}

module.exports = CriteriaRepository;