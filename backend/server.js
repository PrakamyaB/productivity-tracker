require("dotenv").config();

const app = require('./src/app');
const connectDB = require('./src/utils/database');
const { startCronJobs } = require('./src/utils/cron');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to DB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API: http://localhost:${PORT}/api\n`);
    });

    // Start cron jobs
    startCronJobs();

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();