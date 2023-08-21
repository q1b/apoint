import { component$, useSignal } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { cn, isOsteopath } from "~/utils";
import { Button, colors } from "./ui/Button";
import {
  LuArrowRight,
  LuHome,
  LuLoader2,
  LuLogOut,
  LuUser,
} from "@qwikest/icons/lucide";
import { LogosGoogleIcon } from "./ui/icons";
import { useSession } from "~/routes/plugin@root";

export const Header = component$(() => {
  const session = useSession();
  const location = useLocation();
  const state = useSignal("idle");

  return (
    <header
      class="
          w-full max-w-5xl bg-white px-3 py-2 rounded-xl
          flex justify-between items-center
        "
    >
      <div class="text-slate-900 font-semibold">
        {isOsteopath(session.value.user.email)
          ? `Welcome, Osteopath ${session.value.user.name}`
          : session.value.user.name
          ? session.value.user.name
          : '#@!"'}
      </div>
      <nav class="flex gap-x-2">
        {session.value !== null ? (
          <>
            <Link
              href="/"
              class={cn(
                `inline-flex items-center rounded-lg text-md gap-x-1 px-3 py-2 cursor-pointer transition-colors`,
                colors[location.url.pathname === "/" ? "accent" : "secondary"],
                location.isNavigating && "animate-pulse"
              )}
            >
              <LuHome />
              <span class="">Home</span>
            </Link>
            <Link
              class={cn(
                `inline-flex items-center rounded-lg text-md gap-x-1 px-3 py-2 cursor-pointer transition-colors`,
                colors[
                  location.url.pathname === "/profile" ? "accent" : "secondary"
                ],
                location.isNavigating && "animate-pulse"
              )}
            >
              <LuUser />
              <span class="">Profile</span>
            </Link>
            <Button
              color="error"
              class="gap-x-2 px-2 py-1 rounded-lg ml-4"
              href="/google/logout"
            >
              {state.value === "loading" ? <LuLoader2 /> : <LuLogOut />}
              <span class="whitespace-nowrap text-lg">
                {" "}
                {state.value === "loading" ? "Loading ..." : "Log Out"}
              </span>
            </Button>
          </>
        ) : (
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
            <LuArrowRight />
          </Button>
        )}
      </nav>
    </header>
  );
});
