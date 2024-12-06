// import "server-only";
// import { cookies } from 'next/headers'
// import { SignJWT, jwtVerify } from "jose";
// import axios from "axios";
//
// import { redirect } from "next/navigation";
//
// const TOKEN_AGE = 3600 * 24;
// const TOKEN_NAME = "auth-token";
// const TOKEN_REFRESH_NAME = "auth-refresh-token";
//
// export function getToken() {
//   const myAuthToken = cookies().get(TOKEN_NAME);
//   return myAuthToken?.value;
// }
//
// export function getRefreshToken() {
//   const myAuthToken = cookies().get(TOKEN_REFRESH_NAME);
//   return myAuthToken?.value;
// }
//
// export function setToken(authToken: string) {
//     // login
//     return cookies().set({
//         name: TOKEN_NAME,
//         value: authToken,
//         httpOnly: true,
//         sameSite: 'lax',
//         // secure: process.env.NODE_ENV !== 'development',
//         maxAge: TOKEN_AGE
//     })
// }
//
// export function setRefreshToken(authRefreshToken: string) {
//   // login
//   return cookies().set({
//     name: TOKEN_REFRESH_NAME,
//     value: authRefreshToken,
//     httpOnly: true, // limit client-side js
//     sameSite: "lax",
//     // secure: process.env.NODE_ENV !== "development",
//     maxAge: TOKEN_AGE,
//   });
// }
//
// export function deleteTokens() {
//   // logout
//   cookies().delete(TOKEN_REFRESH_NAME);
//   return cookies().delete(TOKEN_NAME);
// }
//
// export async function refreshAccessToken() {
//   try {
//     const refreshToken = getRefreshToken();
//     if (!refreshToken) {
//       throw new Error("No refresh token available");
//     }
//
//     // Make a request to refresh the access token
//     const response = await axios.post(`${process.env.DJANGO_API_URL}/token/refresh/`, {
//       refresh: refreshToken,
//     });
//
//     const { access } = response.data;
//
//     // Update tokens in cookies
//     setToken(access);
//     return access;
//
//   } catch (error) {
//     // If refresh fails, log out the user
//     console.error("Failed to refresh access token", error);
//     deleteTokens(); // clear tokens on failure
//     deleteSession()
//     redirect('/login');
//
//     return null;
//   }
// }
//
// const secretKey = process.env.SESSION_SECRET;
// const encodedKey = new TextEncoder().encode(secretKey);
//
// export async function encrypt(payload: {userId: number, role?: string, expiresAt: Date}) {
//   return new SignJWT(payload)
//     .setProtectedHeader({ alg: 'HS256' })
//     .setIssuedAt()
//     .setExpirationTime('7d')
//     .sign(encodedKey)
// }
//
// export async function decrypt(session: string | undefined = '') {
//   try {
//     const { payload } = await jwtVerify(session, encodedKey, {
//       algorithms: ['HS256'],
//     })
//     return payload
//   } catch (error) {
//     console.log('Failed to verify session')
//   }
// }
//
// export async function createSession(userId: number, userRole?: string) {
//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   const session = await encrypt({ userId, role: userRole, expiresAt });
//   return cookies().set({
//     name:"session",
//     value: session,
//     httpOnly: true,
//     // secure: true,
//     expires: expiresAt,
//     sameSite: "lax",
//     path: "/",
//   });
// }
//
// export async function updateSession() {
//   const session = cookies().get("session")?.value;
//   const payload = await decrypt(session);
//
//   if (!session || !payload) {
//     return null;
//   }
//
//   const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   return cookies().set({
//     name: "session",
//     value: session,
//     httpOnly: true,
//     // secure: true,
//     expires: expires,
//     sameSite: "lax",
//     path: "/",
//   });
// }
//
// export function deleteSession() {
//   cookies().delete("session");
// }
//
//
//
//
//
