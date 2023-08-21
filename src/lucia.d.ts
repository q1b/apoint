// src/lucia.d.ts
/// <reference types="lucia" />
declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import('./lib/lucia').Auth;
  type DatabaseUserAttributes = {
    email?: string;
    image: string;
    name: string;
  }; // formerly `UserAttributes`
	type DatabaseSessionAttributes = {
    access_token: string
    refresh_token: string | null
  }; // new
}