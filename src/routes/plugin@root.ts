import { routeLoader$ } from "@builder.io/qwik-city";
import type { Session } from "lucia";
import { auth, getSession } from "~/lib/lucia";

export const useSession = routeLoader$(async (requestEvent) => {
  // This code runs only on the server, after every navigation
  const session = await getSession(requestEvent);
  if (!session) {
    if(requestEvent.pathname !== '/login/') throw requestEvent.redirect(303, '/login/');
  }
  return session as Session;
});

export const useUser = routeLoader$(async (event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  if (!session) {
    if(event.pathname !== '/login/') throw event.redirect(303, '/login/');
  }
  // eslint-disable-next-line
  return (session as Session)?.user;
});