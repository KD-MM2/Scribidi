import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
	NODE_ENV: str({
		devDefault: testOnly("development"),
		choices: ["development", "production"],
	}),
	HOST: host({ devDefault: testOnly("localhost") }),
	PORT: port({ devDefault: testOnly(3001) }),
	CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000,http://localhost:5173") }),
	JWT_SECRET: str({ devDefault: testOnly("_-_rAnDoM-_-sEcReT-_-kEy_-_") }),
	DATABASE_USER: str({ devDefault: testOnly("postgres") }),
	DATABASE_PASSWORD: str({ devDefault: testOnly("password") }),
	DATABASE_NAME: str({ devDefault: testOnly("postgres") }),
	DATABASE_HOST: str({ devDefault: testOnly("localhost") }),
	DATABASE_PORT: num({ devDefault: testOnly(5432) }),
	DATABASE_URL: str({
		devDefault: testOnly(
			"postgresql://postgres:password@localhost:5432/postgres"
		),
	}),
	APP_URL: str({ devDefault: testOnly("http://localhost:3001") }),
	REDIS_HOST: str({ devDefault: testOnly("localhost") }),
	REDIS_PORT: num({ devDefault: testOnly(6379) }),
	UPLOAD_DIR: str({ devDefault: testOnly("uploads") }),
	DEV_MODE: str({ devDefault: testOnly("true") }),
	NVIDIA: str({ devDefault: testOnly("false") }),
});

export default env;
