import { useSession } from "~/routes/plugin@root";
import { component$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { email, required, useForm } from "@modular-forms/qwik";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import calendarService from "~/lib/calendar";

type LoginForm = {
  email: string;
  date: Date;
  time: Date;
  duration: "30" | "45";
};

export default component$(() => {
  const session = useSession();
  // Use login form
  const [, { Form, Field }] = useForm<LoginForm>({
    loader: {
      value: {
        email: "",
        date: new Date(),
        time: new Date(),
        duration: "30",
      },
    },
  });

  return (
    <Form
      class="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit$={async (values) => {
        const startTime = new Date(
          values.date.getTime() +
            values.time.getTime() -
            (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
        );
        const endTime = new Date(
          startTime.getTime() +
            +`${values.duration}` * 60 * 1000 -
            (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
        );
        console.log(startTime.toISOString(), endTime.toISOString());
        console.log(
          await server$(async (startTime: string, endTime: string) => {
            const calendar = calendarService(session.value);
            const osteoCalendar = await calendar.getCalendar();
            try {
              if (osteoCalendar && osteoCalendar.id && session.value.user.email) {
                const res = await calendar.createEvent(osteoCalendar.id, {
                  summary: "Testing Meeting",
                  startTime,
                  endTime,
                  host: { email: session.value.user.email },
                  nonHost: { email: values.email },
                });
                return res;
              }
              return { msg: "Error Osteopathy Calendar is not present" };
            } catch (error) {
              console.log(error);
              return error;
            }
          })(startTime.toISOString(), endTime.toISOString())
        );
      }}
    >
      <div class="space-y-4 md:space-y-6">
        <Field
          name="email"
          validate={[
            required("Please enter your email."),
            email("The email address is badly formatted."),
          ]}
        >
          {(field, props) => (
            <Input
              {...props}
              value={field.value}
              error={field.error}
              type="email"
              label="Attendee Email"
              placeholder="example@email.com"
              required
            />
          )}
        </Field>
        <Field
          name="date"
          type="Date"
          validate={[required("Please enter Starting Date of your Event")]}
        >
          {(field, props) => (
            <Input
              {...props}
              value=""
              error={field.error}
              type="date"
              label="Date"
              description="Your Email will be used to reach out to you."
              required
            />
          )}
        </Field>
        <Field
          name="time"
          type="Date"
          validate={[required("Please enter Starting Date of your Event")]}
        >
          {(field, props) => {
            return (
              <Input
                {...props}
                value=""
                error={field.error}
                type="time"
                label="Start At"
                description="Your Email will be used to reach out to you."
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
        <Button type="submit"> Submit </Button>
      </div>
    </Form>
  );
});
