import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { useForm } from "@modular-forms/qwik";
import Avatar from "~/components/Avatar";
import { getSession } from "~/lib/lucia";
import prisma from "~/lib/prisma";
import { useSession } from "~/routes/plugin@root";

type UserProfile = {
  name: string;
  email: string;
};

export const useUserData = routeLoader$(async (event) => {
  const session = await getSession(event);
  if (session !== null) {
    return session.user;
  } else {
    const user = await prisma.user.findFirst({
      where: {
        id: event.params["id"],
      },
    });
    if (user)
      return {
        name: user.name ?? "",
        email: user.email ?? "",
      };
  }
  throw event.redirect(303, "/");
});

export default component$(() => {
  // const loc = useLocation();
  const session = useSession();
  const [userForm, { Form, Field }] = useForm<UserProfile>({
    loader: useUserData(),
  });
  return (
    <Form
      class="flex flex-col gap-6 max-w-2xl w-full pt-6 px-2 sm:p-10"
      onSubmit$={async (values) => {
        console.log(values);
      }}
    >
      <div class="flex flex-col gap-6 sm:w-full">
        <Avatar
          user={{
            value: {
              image: session.value.user.image,
              name: session.value.user.name,
              userId: session.value.user_id,
            },
          }}
        />
        <div class="flex h-max flex-col border border-slate-400 bg-slate-100 px-3 py-2">
          <Field name="name">
            {(field, props) => (
              <>
                <label class="text-sm leading-4 text-slate-500 sm:text-base">
                  Full Name
                </label>
                <input
                  {...props}
                  class="w-full border-0 bg-transparent p-0 text-base text-slate-700 ring-0 focus:ring-0 sm:text-xl"
                  placeholder="Full Name"
                  value="Sukhpreet Singh"
                />
              </>
            )}
          </Field>
        </div>
        <div class="flex h-max flex-col border border-slate-400 bg-slate-100 px-3 py-2">
          <Field name="email">
            {(field, props) => (
              <>
                <label class="text-sm leading-4 text-slate-500 sm:text-base">
                  Email Address
                </label>
                <input
                  {...props}
                  class="w-full border-0 bg-transparent p-0 text-base text-slate-700 ring-0 focus:ring-0 sm:text-xl"
                  placeholder="Full Name"
                  value="student.s20XX@srisriuniversity.edu.in"
                />
              </>
            )}
          </Field>
        </div>
      </div>
      <button
        class="px-4 py-2 text-lg bg-blue-400 text-white w-max h-max"
        type="submit"
        disabled={userForm.submitting}
      >
        Submit
      </button>
    </Form>
  );
});
