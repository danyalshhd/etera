import { app } from "./app";
import { connectToPostgres, disconnectPostgres } from "./db/postgres";
import { ensureSchema } from "./db/booking";
import { POSTGRES_URL } from "./config";

const start = async () => {
  
  if (POSTGRES_URL) {
    await connectToPostgres(POSTGRES_URL);
    await ensureSchema();
  }

  const server = app.listen(3000, () => {
    console.log('Listening on port 3000.');
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, closing server...`);
    
    server.close(async () => {
      console.log('HTTP server closed');
      await disconnectPostgres();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
