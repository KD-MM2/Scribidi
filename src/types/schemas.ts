import { JwtPayload } from "jsonwebtoken";
import { z } from "zod";

export const loginInfoSchema = z.object({
	email: z.string().min(1, "Required").email("Invalid email"),
	password: z.string().min(5, "Required"),
});

export type LoginInfo = z.infer<typeof loginInfoSchema>;

export const registerInfoSchema = z.object({
	email: z.string().min(1, "Required"),
	name: z.string().min(1, "Required"),
	password: z.string().min(1, "Required"),
});

export type RegisterInfo = z.infer<typeof registerInfoSchema>;

// export interface LoginInfo {
// 	email: string;
// 	password: string;
// 	remember_me?: boolean | undefined;
// };

// export interface RegisterInfo {
//     name: string;
//     email: string;
//     password: string;
// };

export interface CustomJwtPayload extends JwtPayload {
	userId: string;
	name: string;
}
