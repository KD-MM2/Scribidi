import { api } from "@/lib/axios";
import { AuthResponse } from "@/types/api";
import { LoginInfo, RegisterInfo } from "@/types/schemas";

const login = ({ email, password }: LoginInfo): Promise<AuthResponse> =>
	api.post("/api/auth/login", {
		email,
		password,
	});

const register = ({
	name,
	email,
	password,
}: RegisterInfo): Promise<AuthResponse> =>
	api.post("/api/auth/register", {
		name,
		email,
		password,
	});

const me = (): Promise<AuthResponse> => api.get("/api/auth/me");

const logout = () => api.post("/api/auth/logout");

export { login, register, me, logout };
