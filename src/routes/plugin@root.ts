import { routeLoader$ } from "@builder.io/qwik-city";
import type { Session } from "lucia";
import { auth, getSession } from "~/lib/lucia";
import { isOsteopath } from "~/utils";

export const useSession = routeLoader$(async (requestEvent) => {
  // This code runs only on the server, after every navigation
  const session = await getSession(requestEvent);
  if (session === null) {
    if (requestEvent.pathname !== '/') throw requestEvent.redirect(303, '/');
  } else {
    if (!isOsteopath(session.user.email)) {
      if(requestEvent.pathname.includes('dashboard')) throw requestEvent.redirect(303, '/')
    }
  }
  return session as Session;
});

export const useUser = routeLoader$(async (event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  if (!session) {
    if (event.pathname !== '/') throw event.redirect(303, '/');
  }
  // eslint-disable-next-line
  return (session as Session)?.user;
});