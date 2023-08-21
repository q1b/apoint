import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <main class="min-h-screen w-full flex items-center justify-center">
        <Slot />
      </main>
    </>
  );
});
