import { component$ } from "@builder.io/qwik";
import { LuArrowRight } from "@qwikest/icons/lucide";
import { Button } from "~/components/ui/Button";
import { LogosGoogleIcon } from "~/components/ui/icons";

export default component$(() => {
  return (
    <>
      <Button
        href="/google/login"
        color="secondary"
        class="gap-x-2 px-2 py-1 rounded-lg"
        style={{ textShadow: "0px 1px 3px #0003" }}
      >
        <LogosGoogleIcon />
        <span class="whitespace-nowrap text-lg">Sign in with Google</span>
        <LuArrowRight />
      </Button>
    </>
  );
});
