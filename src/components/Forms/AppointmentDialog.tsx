import A11yDialog from "a11y-dialog";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { required, useForm } from "@modular-forms/qwik";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { LuPlus } from "@qwikest/icons/lucide";
import { server$ } from "@builder.io/qwik-city";
import prisma from "~/lib/prisma";
import { useSession } from "~/routes/plugin@root";
// import { server$ } from "@builder.io/qwik-city";
// import prisma from "~/lib/prisma";

type AppointmentForm = {
  date: Date;
  time: Date;
  duration: "30" | "45";
};

export default component$(() => {
  const session = useSession();
  const [, { Form, Field }] = useForm<AppointmentForm>({
    loader: {
      value: {
        date: new Date(),
        duration: "30",
        time: new Date(),
      },
    },
  });
  useVisibleTask$(() => {
    // Get the dialog container HTML element (with the accessor method you want)
    const element = document.getElementById("your-dialog-id") as HTMLElement;
    // Instantiate a new A11yDialog module
    const dialog = new A11yDialog(element);
    dialog
      .on("show", () => disableBodyScroll(element))
      .on("hide", () => enableBodyScroll(element));
    return () => {
      dialog.destroy();
    };
  });
  return (
    <>
      <div
        id="your-dialog-id"
        aria-labelledby="your-dialog-title-id"
        aria-hidden="false"
        class="aria-hidden:hidden fixed inset-0 z-[2] flex"
      >
        {/* 2. The dialog overlay  */}
        <div
          data-a11y-dialog-hide
          class="fixed inset-0 bg-black/10 backdrop-blur-sm"
        ></div>
        {/* 3. The actual dialog  */}
        <div
          role="document"
          class="m-auto z-[2] relative bg-white shadow-sm rounded-md p-4 sm:p-6 flex flex-col w-full max-w-xs"
        >
          {/* 4. The close button  */}
          <button
            type="button"
            data-a11y-dialog-hide
            aria-label="Close the dialog"
            class="absolute top-2 right-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* 6. Dialog content  */}
          <Form
            class="space-y-4 md:space-y-6 lg:space-y-6"
            onSubmit$={async (values) => {
              const duration = +`${values.duration}`;
              const startTime = new Date(
                values.date.getTime() +
                  values.time.getTime() -
                  (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              );
              await server$(async (startTime: string) => {
                console.log("Starting loading User");
                const user = await prisma.user.findFirst({
                  where: {
                    id: session.value.user_id,
                  },
                  include: {
                    osteopath: true,
                  },
                });
                console.log("User", user);
                console.log("Starting Creating Appointment");
                try {
                  const appointment = await prisma.appointment.create({
                    data: {
                      duration,
                      label: "Appointment",
                      place: "Shruti Room No. 104",
                      startAt: startTime,
                      osteopath: {
                        connect: {
                          id: user?.osteopath?.id,
                        },
                      },
                    },
                  });
                  console.log(appointment);
                } catch (error) {
                  console.log(error);
                }
              })(startTime.toISOString());
            }}
          >
            <Field
              name="date"
              type="Date"
              validate={[required("Date Missing")]}
            >
              {(field, props) => (
                <Input
                  {...props}
                  value=""
                  error={field.error}
                  type="date"
                  label="Date"
                  required
                />
              )}
            </Field>
            <Field
              name="time"
              type="Date"
              validate={[required("Time Missing!")]}
            >
              {(field, props) => {
                return (
                  <Input
                    {...props}
                    value=""
                    error={field.error}
                    type="time"
                    label="Start At"
                    required
                  />
                );
              }}
            </Field>
            <Field
              name="duration"
              validate={required("Please select the payment type.")}
            >
              {(field, props) => (
                <Select
                  {...props}
                  value={field.value?.toString()}
                  options={[
                    { label: "45 Minutes", value: "45" },
                    { label: "30 Minutes", value: "30" },
                  ]}
                  error={field.error}
                  label="Duration"
                  placeholder="Card or PayPal?"
                  required
                />
              )}
            </Field>
            <Button type="submit"> Create </Button>
          </Form>
        </div>
      </div>
      <Button
        color="secondary"
        type="button"
        class="flex items-center"
        data-a11y-dialog-show="your-dialog-id"
      >
        Create Appointment <LuPlus class="ml-1" />
      </Button>
    </>
  );
});
