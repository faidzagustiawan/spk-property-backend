const app = require('./app');
const config = require('./config/env');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di mode development pada port ${PORT}`);
});
