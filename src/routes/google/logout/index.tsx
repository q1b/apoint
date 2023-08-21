import type { RequestHandler } from "@builder.io/qwik-city";
import { auth } from "~/lib/lucia";

export const onGet: RequestHandler = async (request) => {
  const authRequest = auth.handleRequest(request);
  // check if user is authenticated
  const session = await authRequest.validate();
  if (!session) {
    throw request.redirect(302, "/");
  }
  await auth.invalidateSession(session.sessionId);
  const sessionCookie = auth.createSessionCookie(null);
  request.cookie.set(sessionCookie.name, sessionCookie.value);
  throw request.redirect(302, "/");
};
