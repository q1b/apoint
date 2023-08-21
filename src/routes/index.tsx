import { component$, useSignal } from "@builder.io/qwik";
import calendarService from "~/lib/calendar/index";
import { useSession } from "./plugin@root";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/Button";
import { getSession } from "~/lib/lucia";
import AppointmentForm from "~/components/Forms/Appointment";
import AppointmentDialogForm from "~/components/Forms/AppointmentDialog";
import prisma from "~/lib/prisma";
import { LuArrowRight } from "@qwikest/icons/lucide";

export const useCalendarLoader = routeLoader$(async (event) => {
  const session = await getSession(event);
  if (session === null) return undefined;
  const calendar = calendarService(session);
  return calendar.getCalendar();
});

export const useAppointmentsLoader = routeLoader$(async (event) => {
  const session = await getSession(event);
  if (session === null) return undefined;
  const user = await prisma.user.findFirst({
    where: { id: session.user_id },
    select: {
      osteopath: {
        select: {
          id: true,
        },
      },
    },
  });
  const appointments = await prisma.appointment.findMany({
    where: {
      osteopath: {
        id: user?.osteopath?.id,
      },
    },
  });
  return appointments;
});

export default component$(() => {
  const calendarloader = useCalendarLoader();
  const appointmentsData = useAppointmentsLoader();
  const calendar = useSignal(calendarloader.value);
  const session = useSession();
  return (
    <main class="mt-16 flex flex-col items-center gap-y-4 w-full max-w-5xl">
      {calendar.value === undefined && (
        <Button
          onClick$={async () => {
            const res = await server$(async () => {
              const calendar = calendarService(session.value);
              return await calendar.addCalendar();
            })();
            calendar.value = res;
          }}
          color="primary"
        >
          Setup Calendar
        </Button>
      )}
      <div class="flex justify-between w-full">
        <div class="w-full h-96">
          <div class="flex justify-between px-5">
            <AppointmentDialogForm />
          </div>
          <div class="m-4 p-5 border border-slate-200 rounded-md">
            <h4 class="mb-3 font-semibold text-xl text-indigo-600">
              Upcomming Appointments
            </h4>
            <ul class="pl-1">
              {appointmentsData.value?.map((appointment) => {
                const timeStr = appointment.startAt
                  .toLocaleTimeString("en", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .toLowerCase();

                const dateStr = appointment.startAt
                  .toLocaleDateString("en", {
                    day: "2-digit",
                    month: "short",
                  })
                  .split(" ")
                  .reverse()
                  .join(" ");
                return (
                  <li class="flex flex-row gap-x-1" key={appointment.id}>
                    <div class="">
                      <LuArrowRight class="w-5 h-5" />
                    </div>
                    <div class="flex  flex-col gap-y-1">
                      <div class="flex justify-between">
                        <div class="text-lg leading-5">
                          <span>{dateStr} 2023,</span>{" "}
                          <span>Start at: {timeStr}</span>
                          {" - "}
                          <span class="">{appointment.duration} Minutes</span>
                        </div>
                      </div>
                      {/* <div class="text-lg">Booked with Subash of B.tech</div> */}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <aside>
          <div class="w-80 flex flex-col gap-y-4 p-4 bg-white border rounded-lg">
            <AppointmentForm />
          </div>
        </aside>
      </div>
    </main>
  );
});
