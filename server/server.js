import dotenv from "dotenv";
import { server } from "./src/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Freelancer Marketplace Server listening on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: http://localhost:${PORT}`);
});
