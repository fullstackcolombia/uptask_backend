import { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

//Permitir conexiones
export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const whiteList = [process.env.FRONTEND_URL];
    if (process.argv.length >= 3 && process.argv[2] == "--api") {
      whiteList.push(undefined);
    }
    if (whiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS"));
    }
  },
};
