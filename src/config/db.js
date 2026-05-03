const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
});

pool.on('connect', () => {
    console.log('Terhubung ke database PostgreSQL');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect() 
};