import { auth, googleAuth } from "~/lib/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";
import type { RequestHandler } from "@builder.io/qwik-city";
import { extractFromEmail, isOsteopath } from "~/utils";
import prisma from "~/lib/prisma";

export const onGet: RequestHandler = async ({
  cookie,
  json,
  redirect,
  headers,
  ...request
}) => {
  const storedState = cookie.get("google_oauth_state")?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    throw json(400, {});
  }
  try {
    console.log("Validating Auth");
    const { existingUser, googleUser, createUser, googleTokens } =
      await googleAuth.validateCallback(code);
    console.log("Auth Validated");
    console.log("Google User", googleUser, googleTokens);

    const getUser = async () => {
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          email: googleUser.email,
          image: googleUser.picture,
          name: googleUser.name,
        },
      });
      const details = extractFromEmail(googleUser.email);
      if (details !== undefined) {
        const { batch, year } = details;
        if (isOsteopath(googleUser.email)) {
          // Create Osteopathy Profile
          const ostepath = await prisma.osteopath.create({
            data: {
              batch,
              year: +`${year}`,
              user: {
                connect: {
                  id: user.userId,
                },
              },
            },
          });
          console.log("Created Ostepath", ostepath);
        }
      }
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {
        access_token: googleTokens.accessToken,
        refresh_token: googleTokens.refreshToken,
      },
    });
    const sessionCookie = auth.createSessionCookie(session);
    // redirect to profile page
    headers.set("Set-Cookie", sessionCookie.serialize());
  } catch (e) {
    console.log("Error", e);
    if (e instanceof OAuthRequestError) {
      // invalid code
      throw json(400, e);
    } else {
      throw json(500, e);
    }
  }
  throw redirect(302, "/");
};
