import { component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
// import { LuArrowUpRight } from "@qwikest/icons/lucide";
// import ordinal from "ordinal";
// import { Button } from "~/components/ui/Button";
import prisma from "~/lib/prisma";
import { useSession } from "~/routes/plugin@root";
import memomize from "just-memoize";
import calendarService, { CalendarName } from "~/lib/calendar";
import { Icons } from "../Icons";

export default component$(
  (props: {
    startAt: Date;
    osteopathy: { year: number; batch: "mos" | "bos" | string };
    host: { id: string; image: string; name: string; email: string | null };
    duration: number;
    id: string;
  }) => {
    const session = useSession();
    /**
     * Tasks
     * First: Create Google Calendar Event
     *           - Invite the attendees
     * Second: Using attendee credentials
     *           - Accept the Invitation to the Event
     * */
    const createGoogleCalendarEvent = server$(async () => {
      const getTokens = memomize(async () => {
        return {
          host: await prisma.session.findFirst({
            where: {
              user_id: props.host.id,
            },
            select: {
              id: true,
              access_token: true,
              refresh_token: true,
            },
          }),
          nonHost: {
            id: session.value.id,
            access_token: session.value.access_token,
            refresh_token: session.value.refresh_token,
          },
        };
      });
      const startTime = new Date(props.startAt.getTime()).toISOString();
      console.log("Start Time", startTime);
      console.log("End Time");
      //  (5 * 60 * 60 * 1000 + 30 * 60 * 1000) === 5 hours 30 minutes
      const endTime = new Date(
        props.startAt.getTime() + props.duration * 60 * 1000
      ).toISOString();
      console.log("End Time", endTime);
      const tokens = await getTokens();
      console.log("TOKENS FETCHED", tokens, props.host);
      let hostCalendar;
      if (tokens.host !== null && tokens.host.access_token !== null) {
        hostCalendar = calendarService(tokens.host);
        console.log("Cal request");
        const osteoCalendar = await hostCalendar.getCalendar();
        console.log("Finished Calendar", osteoCalendar?.id);
        if (osteoCalendar && osteoCalendar.id) {
          console.log("Started Create Event");
          const event = await hostCalendar.createEvent(osteoCalendar.id, {
            summary: "Testing",
            startTime,
            endTime,
            host: {
              email: props.host.email,
            },
            nonHost: {
              email: session.value.user.email,
            },
          });
          if (!event?.id) {
            console.error("Creating Event failed");
            return;
          }
          const attendee = event.attendees?.filter((a) => !a.organizer)[0];
          if (!attendee) {
            console.error("Attendee is not");
            return;
          }
          console.log("Ended Event\n");
          console.log("Started Create Event");
          const host_status = await hostCalendar.updateEvent(
            osteoCalendar.id,
            event.id,
            {
              summary: CalendarName,
              description: event.summary,
              start: {
                dateTime: event.start?.dateTime,
                timeZone: event.start?.timeZone,
              },
              end: {
                dateTime: event.end?.dateTime,
                timeZone: event.end?.timeZone,
              },
              attendees: [
                {
                  ...event.organizer,
                  id: String(event.organizer?.id),
                  organizer: true,
                  responseStatus: "accepted",
                  email: event.organizer?.email,
                },
                ...(event.attendees ? event.attendees : []),
              ],
              reminders: {
                useDefault: true,
              },
            }
          );
          console.log("Host Accepted", host_status?.data);
          const nonHostCalendar = calendarService(tokens.nonHost);
          let cal = await nonHostCalendar.getCalendar();
          if (!cal) {
            cal = await nonHostCalendar.addCalendar();
          }
          // if(cal === null ) {
          //   console.error("Unable to Create Osteopathy Calendar")
          //   return
          // }
          const res_status = await nonHostCalendar.importEvent({
            calendarId: cal.id ? cal.id : "primary",
            start: event.start,
            end: event.end,
            iCalUID: event.iCalUID,
          });
          console.log("Non-Host Accepted", res_status);
          return event.id;
        }
      }
    });

    const loading = useSignal(false);
    const timeStr = {
      start: props.startAt
        .toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .toLowerCase(),
      end: new Date(props.startAt.getTime() + props.duration * 60 * 1000)
        .toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .toLowerCase(),
    };
    const dateStr =
      props.startAt
        .toLocaleDateString("en", {
          day: "2-digit",
          month: "short",
        })
        .split(" ")
        .reverse()
        .join(" ") +
      " ," +
      props.startAt.getFullYear();
    return (
      <div class="relative flex items-center">
        <div class="flex gap-x-3">
          <div class="relative flex h-16 w-16">
            <img
              src={props.host.image}
              width={64}
              height={64}
              alt={`${props.host.name} Image`}
              class="object-contain rounded-full"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="absolute -left-5 -top-5 h-6 w-6 rounded-md border border-slate-200 bg-white p-0.5 text-slate-600"
            >
              <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z" />
              <path
                fill-rule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="flex flex-col justify-between">
            <h4 class="select-none font-semibold text-slate-600">
              {props.host.name}
            </h4>
            <div class="flex flex-col">
              <span class="select-none text-sm text-slate-600">{dateStr}</span>
              <span class="select-none text-sm text-slate-600">
                {timeStr.start.replace("am", "").replace("pm", "")} -{" "}
                {timeStr.end}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center absolute -bottom-7 w-full">
          <button
            class="w-max inline-flex items-center justify-center gap-x-0.5 rounded-lg border border-slate-200 pl-2 pr-1 text-lg py-0.5 shadow-slate-300/50 shadow-sm bg-white group-hover:bg-blue-500 transition-colors"
            onClick$={async () => {
              loading.value = true;
              console.log("Google Calendar Started");
              const eventId = await createGoogleCalendarEvent();
              console.log(
                "Google Calendar Stopped",
                eventId ? eventId : "UNDEFINED"
              );
              await server$(async (id: string, eventId: string | undefined) => {
                try {
                  const res = await prisma.appointment.update({
                    where: {
                      id,
                    },
                    data: {
                      eventId,
                      user: {
                        connect: {
                          id: session.value.user_id,
                        },
                      },
                    },
                  });
                  return res;
                } catch (error) {
                  console.log(error);
                }
              })(props.id, eventId);
              loading.value = false;
            }}
          >
            <span class="text-sm font-semibold text-slate-500 group-hover:text-white transition-colors">
              Book
            </span>
            <span>
              {loading.value ? (
                <Icons.spinner class="w-4 h-4 text-slate-600 group-hover:text-white" />
              ) : (
                <Icons.arrow class="w-4 h-4 text-slate-600 group-hover:text-white" />
              )}
            </span>
          </button>
        </div>
      </div>
    );
  }
);
