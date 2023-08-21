import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { google } from "@lucia-auth/oauth/providers"
import { qwik } from "lucia/middleware";
import client from "./prisma"
import { RequestEventLoader } from "@builder.io/qwik-city";
import { extractFromEmail } from "~/utils";

export const auth = lucia({
	adapter: prisma(client,{
    user: "user", // model User {}
    key: "key", // model Key {}
    session: "session" // model Session {}
  }),
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: qwik(),
  getSessionAttributes: (session) => {
    return session
  },
  getUserAttributes: (user) => {
    console.log(extractFromEmail('sukhpreet.s2021btcseai@srisriuniversity.edu.in'))
		return {
			email: user.email,
      image: user.image,
      name: user.name,
		};
	},
});

export const googleAuth = google(auth, {
	clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  accessType: 'offline',
	redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar'],
});

export const getSession = async (event:RequestEventLoader) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  return session
}

export type Auth = typeof auth;