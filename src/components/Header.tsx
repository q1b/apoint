import type { Signal } from "@builder.io/qwik";
import { Slot, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { cn, extractFromEmail } from "~/utils";
import { Button } from "./ui/Button";
import { LogosGoogleIcon } from "./ui/icons";
import { useSession } from "~/routes/plugin@root";
import { Icons } from "./Icons";
import type { Session } from "lucia";

const Item = component$((props: { href: string; icon: keyof typeof Icons }) => {
  const location = useLocation();
  const Icon = Icons[props.icon];

  const isActive = useComputed$(
    () =>
      location.url.pathname === props.href.toString().replace(/\/$/, "") + "/"
  );
  return (
    <Link
      href={props.href}
      class={cn(
        `inline-flex items-center px-2.5 gap-x-1.5 py-1.5 cursor-pointer transition-colors`,
        isActive.value ? "text-slate-600" : "text-slate-500"
      )}
    >
      {/* @ts-ignore */}
      <Icon class={cn(isActive.value ? "w-6 h-6" : "w-4 h-4")} />
      <Slot />
    </Link>
  );
});

export const Header = component$(() => {
  const session = useSession() as Readonly<Signal<undefined | Session>>;
  const state = useSignal("idle");
  let meta;
  if (session.value) {
    meta = extractFromEmail(session.value.user.email);
  }
  return (
    <header
      class="
          w-full max-w-5xl bg-white px-3 py-2 rounded-xl
          flex justify-between items-center
        "
    >
      <div class="text-slate-900 font-semibold">
        {/* {isOsteopath(session.value.user.email)
          ? `Welcome, Osteopath ${session.value.user.name}`
          : session.value.user.name
          ? session.value.user.name
          : '#@!"'} */}
      </div>
      <nav class="flex gap-x-2">
        {session.value ? (
          <>
            <Item href="/" icon="feed">
              Feed
            </Item>
            {(typeof meta?.batch === "string" &&
              (meta.batch.includes("mos") || meta.batch.includes("bos"))) ||
              (session.value.user.email?.includes("sukhpreet.s") && (
                <Item href="/dashboard" icon="table">
                  Dashboard
                </Item>
              ))}
            <Item href={`/user/${session.value.user_id}`} icon="user">
              Profile
            </Item>
            <Button
              color="error"
              class="gap-x-2 px-2 py-1 rounded-lg ml-4"
              href="/google/logout"
            >
              {state.value === "loading" ? <Icons.spinner /> : <Icons.logout />}
              <span class="whitespace-nowrap text-lg">
                {" "}
                {state.value === "loading" ? "Loading ..." : "Log Out"}
              </span>
            </Button>
          </>
        ) : (
          <>
            <Button
              href="/google/login"
              color="secondary"
              class="gap-x-2 px-2 py-1 rounded-lg"
              style={{ textShadow: "0px 1px 3px #0003" }}
            >
              <LogosGoogleIcon />
              <span class="whitespace-nowrap text-lg">
                {" "}
                {state.value === "loading"
                  ? "Loading ..."
                  : "Sign in with Google"}
              </span>
              <Icons.arrow />
            </Button>
          </>
        )}
      </nav>
    </header>
  );
});
