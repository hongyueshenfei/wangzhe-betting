import app from './app';
import config from './config/index';
import { prisma } from './utils/prisma';
import fs from 'fs';

async function main(): Promise<void> {
  // Ensure upload directory exists
  if (!fs.existsSync(config.UPLOAD_DIR)) {
    fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
    console.log(`📁 Created uploads directory: ${config.UPLOAD_DIR}`);
  }

  // Connect to database
  await prisma.$connect();
  console.log('🗄️  Database connected');

  // Start server
  app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`🚀 王者荣耀竞猜平台 API running on http://localhost:${config.PORT}`);
    console.log(`📡 CORS origin: * (LAN access enabled)`);
    console.log(`💡 局域网内其他设备请访问 http://你的IP:${config.PORT}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
