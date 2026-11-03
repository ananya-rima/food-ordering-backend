const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

(async () => {
  try {
    await connectDB();
    const server = app.listen(env.port, () => console.log(`Server running on port ${env.port} (${env.nodeEnv})`));

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
