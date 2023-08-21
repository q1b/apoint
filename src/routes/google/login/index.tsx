import { type RequestHandler } from "@builder.io/qwik-city";
import { googleAuth } from "~/lib/lucia";

export const onGet: RequestHandler = async ({ redirect, cookie }) => {
  const [url, state] = await googleAuth.getAuthorizationUrl();
  cookie.set("google_oauth_state", state, {
    httpOnly: true,
    secure: false, // `true` for production
    path: "/",
    maxAge: 60 * 60,
  });
  throw redirect(308, url.toString());
};
