import { component$, useSignal, useStore } from "@builder.io/qwik";
import { Calendar } from "~/components/Calendar";
import {
  today,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
import { cn } from "~/utils";
import { getSession } from "~/lib/lucia";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import prisma from "~/lib/prisma";
import { Icons } from "~/components/Icons";
import groupBy from "just-group-by";
import orderBy from "just-order-by";
import { useSession } from "~/routes/plugin@root";

const getDate = (date: DateValue) => {
  return {
    day: date.day,
    month: date.month,
    year: date.year,
  };
};

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
  if (user?.osteopath?.id) {
    const appointments = await prisma.appointment.findMany({
      where: {
        osteopath: {
          id: user.osteopath.id,
        },
      },
      include: {
        user: true,
      },
    });
    return appointments;
  } else {
    return [];
  }
});

export default component$(() => {
  const appointmentsData = useAppointmentsLoader();
  const session = useSession();
  const appointments = useSignal(appointmentsData.value);
  const appointmentsByDate = useStore(
    groupBy(
      orderBy(appointments.value ?? [], [
        {
          property(v) {
            return v.startAt;
          },
        },
      ]),
      (item) => item.startAt.toDateString()
    )
  );
  const options = useStore({
    date: getDate(today(getLocalTimeZone()).add({ days: 1 })),
    isMorning: true,
    time: "",
    duration: 30,
  });
  const minutes = ["00", 15, 30, 45];
  const morninghours = ["07", "08", "09", 10, 11, 12];
  const morningtimes = [];
  for (let index = 0; index < morninghours.length; index++) {
    const hour = morninghours[index];
    for (let index = 0; index < minutes.length; index++) {
      const minute = minutes[index];
      morningtimes.push(`${hour + ":" + minute}`);
    }
  }
  const eveninghours = [13, 14, 15, 16, 17, 18];
  const eveningtimes = [];
  for (let index = 0; index < eveninghours.length; index++) {
    const hour = eveninghours[index];
    for (let index = 0; index < minutes.length; index++) {
      const minute = minutes[index];
      eveningtimes.push(`${hour + ":" + minute}`);
    }
  }
  const panel = useSignal<"idle" | "past">("idle");
  return (
    <main class="w-full max-w-5xl flex flex-col gap-y-6">
      Dashboard
      <div class="grid grid-cols-2">
        <div class="flex flex-col gap-x-4">
          <div class="flex gap-x-4">
            <Calendar
              aria-label="Appointment Event date"
              onChange$={(ev) => {
                options.date = getDate(ev);
              }}
            />
            <div class="flex flex-col gap-y-2">
              <div class="flex gap-x-1">
                <button
                  class={cn(
                    "w-full border px-1 py-2 rounded-md",
                    options.isMorning
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-800"
                  )}
                  onClick$={() => (options.isMorning = true)}
                >
                  Morning
                </button>
                <button
                  class={cn(
                    "w-full border px-1 py-2 rounded-md",
                    !options.isMorning
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-800"
                  )}
                  onClick$={() => (options.isMorning = false)}
                >
                  Evening
                </button>
              </div>
              <div class="flex flex-row gap-x-2">
                {options.isMorning && (
                  <div class="grid grid-cols-4 gap-1.5 p-1 shadow rounded-md">
                    {morningtimes.map((time) => (
                      <button
                        key={time}
                        onClick$={() =>
                          (options.time = options.time !== time ? time : "")
                        }
                        class={cn(
                          `px-1 text-base py-px cursor-pointer rounded tabular-nums flex items-center justify-center`,
                          options.time === time
                            ? "bg-blue-500 text-white"
                            : "hover:bg-slate-200 hover:text-slate-800 bg-slate-100 text-slate-600"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
                {!options.isMorning && (
                  <div class="grid grid-cols-4 gap-1.5 p-1 shadow rounded-md">
                    {eveningtimes.map((time) => (
                      <button
                        key={time}
                        onClick$={() =>
                          (options.time = options.time !== time ? time : "")
                        }
                        class={cn(
                          `px-1 text-base py-px cursor-pointer rounded tabular-nums flex items-center justify-center`,
                          options.time === time
                            ? "bg-blue-500 text-white"
                            : "hover:bg-slate-200 hover:text-slate-800 bg-slate-100 text-slate-600"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div class="mt-4 flex gap-x-4">
            <div class="flex items-center gap-x-1">
              <button
                onClick$={() => (options.duration = 30)}
                class={cn(
                  "p-2 border rounded-lg text-slate-700 flex items-center gap-x-1",
                  options.duration === 30 && "text-blue-500 border-blue-400"
                )}
              >
                {options.duration === 30 && <Icons.check />} 30 Minutes
              </button>
              <button
                onClick$={() => (options.duration = 45)}
                class={cn(
                  "p-2 border rounded-lg text-slate-700 flex items-center gap-x-1",
                  options.duration === 45 && "text-blue-500 border-blue-400"
                )}
              >
                {options.duration === 45 && <Icons.check />} 45 Minutes
              </button>
            </div>
            <button
              onClick$={async () => {
                const startAt = new Date();
                startAt.setMonth(options.date.month - 1, options.date.day);
                startAt.setFullYear(options.date.year);
                const [hour, minute] = options.time
                  .split(":")
                  .map((str) => +`${str}`);
                startAt.setHours(hour, minute);
                const res = await server$(async (startTime: string) => {
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
                        duration: options.duration,
                        label: "Appointment",
                        place: "Shruti Room No. 104",
                        startAt: startTime,
                        osteopath: {
                          connect: {
                            id: user?.osteopath?.id,
                          },
                        },
                      },
                      include: {
                        user: true,
                      },
                    });
                    return appointment;
                  } catch (error) {
                    console.log(error);
                  }
                })(startAt.toISOString());
                console.log("Response", res);
                if (res === undefined) {
                  alert("Server Error");
                  return;
                }
                appointments.value?.push(res);
                const keys = Object.keys(appointmentsByDate);
                const i = keys.findIndex(
                  (d) => d === res.startAt.toDateString()
                );
                if (i === -1) {
                  appointmentsByDate[res.startAt.toDateString()] = [res];
                } else {
                  appointmentsByDate[res.startAt.toDateString()].push(res);
                }
              }}
              class="pl-2 pr-3.5 py-1.5 flex items-center gap-x-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-400/40"
            >
              <Icons.plus class="w-6 h-6" />
              Create Appointment Slot
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-y-6">
          <div class="flex flex-col gap-y-4">
            <div class="flex flex-row gap-x-4">
              <button
                onClick$={() => (panel.value = "idle")}
                class={cn(
                  "text-xl text-slate-500",
                  panel.value === "idle" && "text-slate-800"
                )}
              >
                Appointments
              </button>
              <button
                onClick$={() => (panel.value = "past")}
                class={cn(
                  "text-xl text-slate-500",
                  panel.value === "past" && "text-slate-800"
                )}
              >
                Past Appointments
              </button>
            </div>
            <ul class="flex flex-col gap-y-4">
              {Object.keys(appointmentsByDate)
                .filter((v) => {
                  if (panel.value === "past") {
                    if (new Date(v) < new Date()) return v;
                  } else {
                    if (new Date(v) >= new Date()) return v;
                  }
                })
                .map((appointmentDate) => (
                  <li key={appointmentDate} class="">
                    <h4 class="text-lg mb-1">{appointmentDate}</h4>
                    <ul class="flex flex-col gap-y-1 pl-2.5">
                      {appointmentsByDate[appointmentDate].map(
                        (appointment) => {
                          const timeStr = appointment.startAt
                            .toLocaleTimeString("en", {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                            .toLowerCase();

                          const dateStr =
                            appointment.startAt
                              .toLocaleDateString("en", {
                                day: "2-digit",
                                month: "short",
                              })
                              .split(" ")
                              .reverse()
                              .join(" ") +
                            " ," +
                            appointment.startAt.getFullYear();
                          return (
                            <li
                              key={appointment.id}
                              class="flex flex-col gap-y-0.5"
                            >
                              <div class="flex flex-row gap-x-1">
                                <div class="">
                                  <Icons.arrow class="w-5 h-5" />
                                </div>
                                <div class="flex  flex-col gap-y-1">
                                  <div class="flex justify-between">
                                    <div class="text-lg leading-5">
                                      <span>{dateStr}</span>{" "}
                                      <span>Start at: {timeStr}</span>
                                      {" - "}
                                      <span class="">
                                        {appointment.duration} Minutes
                                      </span>
                                    </div>
                                  </div>
                                  {/* <div class="text-lg">Booked with Subash of B.tech</div> */}
                                </div>
                              </div>
                              {appointment.user?.name && (
                                <div class="flex flex-row gap-x-1">
                                  <div class="w-5"></div>
                                  <div class="">
                                    Booked with {appointment.user.name}
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
});
