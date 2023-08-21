import { component$ } from "@builder.io/qwik";

// export const useUserData = routeLoader$(async (requestEvent) => {
//   // Resolve the product details from the other loader
//   const session = await requestEvent.resolveValue(useAuthSession);
//   if (session === null) return null;
//   if (session.user === null) return null;
//   if (!session.user?.email) return null;
//   // Use the product details to fetch personalized data
//   const { data, error } = await db.user(session?.prop).select();
//   return data;
// });

export default component$(() => {
  //   const session = useAuthSession();
  //   const signOut = useAuthSignout();
  return (
    <main class="mt-16 w-full flex flex-col max-w-4xl gap-y-4">
      <h1 class="text-4xl">Appointments</h1>
      <ul>
        <li>
          {/* {appointments.map(() => (
            <li></li>
          ))} */}
        </li>
      </ul>
    </main>
  );
});
