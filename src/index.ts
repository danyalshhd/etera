import { app } from "./app";
import { connectToPostgres } from "./db/postgres";
import { ensureSchema } from "./db/booking";
import { POSTGRES_URL } from "./config";

const start = async () => {
  
  if (POSTGRES_URL) {
    await connectToPostgres(POSTGRES_URL);
    await ensureSchema();
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000.');
  });
};

start();
