import { env } from "@shared/config/env";
import { createServer } from "@shared/infrastructure/http/server";

const app = createServer();

app.listen(env.port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${env.port}`);
});
