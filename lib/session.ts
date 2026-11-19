import "server-only";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getProfile } from "./auth-api";
import { loginPath, TOKEN_COOKIE } from "./auth-routes";

const ONE_HOUR = 60 * 60;

export async function createSession(token: string){
    (await cookies()).set(TOKEN_COOKIE, token, {
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ONE_HOUR
    })
}

export async function deleteSession(){
    (await cookies()).delete(TOKEN_COOKIE);
}

export const requireSession = cache(async (from?: string) => {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value;
    if (token) {
        try {
            const user = await getProfile(token);
            return { token, user };
        } catch (error) {
            const status = isAxiosError(error) ? error.response?.status : undefined;
            if (status !== 401 && status !== 403) throw error;
        }
    }

    redirect(from ? loginPath(from) : "/login");
});
