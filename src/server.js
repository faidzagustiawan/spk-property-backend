const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server berjalan di mode development pada port ${PORT}`);
});