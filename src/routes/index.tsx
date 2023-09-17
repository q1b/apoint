import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import BookingCard from "~/components/Forms/BookingCard";
import { Icons } from "~/components/Icons";
// import { getSession } from "~/lib/lucia";
import prisma from "~/lib/prisma";

export const useAppointmentsLoader = routeLoader$(async () => {
  // const session = await getSession(event);
  // const user_id = session !== null ? session.user_id : null;
  const appointments = await prisma.appointment.findMany({
    where: {
      user: null,
    },
    orderBy: {
      startAt: "asc",
    },
    select: {
      id: true,
      duration: true,
      osteopathId: true,
      startAt: true,
      place: true,
      user: true,
      osteopath: {
        include: {
          user: true,
        },
      },
    },
  });
  return appointments;
});

export default component$(() => {
  // const session = useSession();
  const appointments = useAppointmentsLoader();
  const appointment = appointments.value?.find((appointment) => {
    return appointment.startAt >= new Date() && !!appointment.user;
  });
  return (
    <main class="w-full max-w-5xl p-4">
      {appointment && (
        <>
          <div class="my-12 text-xl">
            <span class="">Your</span>{" "}
            <span class="font-semibold text-indigo-500">
              {appointment.duration} Minutes
            </span>{" "}
            <span>long Osteopathy Session has been scheduled for</span>{" "}
            <span class="font-semibold text-indigo-500">
              {appointment.startAt.toLocaleString("en", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                weekday: "long",
              })}
            </span>
            <span>with</span>
            <strong class="text-indigo-500">
              {appointment.osteopath.user.name}
            </strong>
            <br />
            <div class="flex flex-col gap-y-3 p-4 rounded-md shadow-sm w-max">
              <h4 class="text-xl text-slate-800">Contact Info</h4>
              <ul class="text-lg flex flex-col gap-y-1">
                <li class="flex items-center gap-x-3">
                  <Icons.phone class="w-5 h-5" />
                  <a href="tel:+918769514159">+91 8769514159</a>
                </li>
                <li class="flex items-center gap-x-3">
                  <Icons.mail class="w-5 h-5" />
                  <a href={`mailto:${appointment.osteopath.user.email}`}>
                    {appointment.osteopath.user.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
      {!appointment && (
        <div class="">
          <ul class="flex gap-6 flex-wrap items-center">
            {appointments.value
              ?.filter((appointment) => !appointment.user)
              .map((appointment) => {
                return (
                  <li
                    key={appointment.id}
                    class="px-3 pt-3 pb-4 bg-white border border-slate-200 w-max rounded-xl group"
                  >
                    <BookingCard
                      osteopathy={appointment.osteopath}
                      host={{
                        id: appointment.osteopath.userId,
                        name: appointment.osteopath.user.name!,
                        image: appointment.osteopath.user.image!,
                        email: appointment.osteopath.user.email,
                      }}
                      startAt={appointment.startAt}
                      id={appointment.id}
                      duration={appointment.duration}
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </main>
  );
});
