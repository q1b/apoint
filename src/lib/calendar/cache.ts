// This is Server Specific Code
// Means this code can be used by other server files,
// You can't use this directly in client

import {
    calendar_v3,
    auth as googleAuth,
    calendar as googleCalendar
} from "@googleapis/calendar";
import { nanoid } from "nanoid"

export const CalendarName = "Osteopathy Appointment Calendar"

// https://github.com/supabase/gotrue-js/issues/131#issuecomment-1566224009 solution
export const getClient = (accessToken: string) => {
    const oAuth2Client = new googleAuth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )
    
    oAuth2Client.setCredentials({ access_token: accessToken })

    return googleCalendar({
        version: 'v3',
        auth: oAuth2Client,
    })
}

export const getRefreshClient = (refreshToken: string) => {
    const oAuth2Client = new googleAuth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )
    // oAuth2Client.setCredentials({ access_token: authToken })
    oAuth2Client.setCredentials({ refresh_token: refreshToken })

    return googleCalendar({
        version: 'v3',
        auth: oAuth2Client,
    })
}

/**
 * FLOW
 * const list = await getCalendarList();
  // console.log(list?.data.items[0]?.backgroundColor);
  const colors = await getCalendarColor();
  // adding
  const isCalPresent = await isOsteoCalendarPresent();
  // if (!isCalPresent) await addOsteoCalendar();
  const calendarId = "enkh6ndrjspcb2gv3h655hrslk@group.calendar.google.com";
  const eventsList = await getEventsList({ calendarId });
*/

export const getCalendarColor = async (calendar: calendar_v3.Calendar) => {
    try {
        return await calendar.colors.get({})
    } catch (err) {
        console.log("error in getting Calendar Colors: ", err);
    }
};

export const getCalendarList = async (calendar: calendar_v3.Calendar) => {
    try {
        return await calendar.calendarList.list();
    } catch (err) {
        console.log("error in getting CalendarList: ", err);
    }
};

export const getOsteoCalendar = async (calendar: calendar_v3.Calendar) => {
    try {
        const list = await getCalendarList(calendar);
        return list?.data.items?.find(
            (item) => item.summary === CalendarName
        );
    } catch (err) {
        console.log("error in getting getOsteoCalendar: ", err);
    }
};

export const changeOsteoCalendarColor = async (calendar: calendar_v3.Calendar, calendarId: string, colorId: string) => {
    try {
        const res = calendar.calendarList.update({
            calendarId,
            requestBody: {
                colorId
            },
        });
        console.log("Calendar Created");
        return res;
    } catch (err) {
        console.log("error while creating new Osteopathy Calendar ", err);
    }
};

export const addOsteoCalendar = async (calendar: calendar_v3.Calendar) => {
    try {
        const res = calendar.calendars.insert({
            requestBody: {
                summary: CalendarName,
                timeZone: "Asia/Kolkata",
            },
        });
        console.log("Calendar Created");
        return res;
    } catch (err) {
        console.log("error while creating new Osteopathy Calendar ", err);
    }
};

/**
 * GOOGLE CALENDAR EVENTS
 */

export const getEventsList = async (calendar: calendar_v3.Calendar, { calendarId }: { calendarId: string }) => {
    try {
        return calendar.events.list({
            calendarId,
        });
    } catch (err) {
        console.log("error in getting Calendar Colors: ", err);
    }
};

type TMins = "00" | "15" | "30" | "45";
type THour =
    | "01"
    | "02"
    | "03"
    | "04"
    | "05"
    | "06"
    | "07"
    | "08"
    | "09"
    | "10"
    | "11"
    | "12"
    | "13"
    | "14"
    | "15"
    | "16"
    | "17"
    | "18"
    | "19"
    | "20"
    | "21"
    | "22"
    | "23"
    | "00";
type TTime = `${THour}:${TMins}`;

type TDate = `${number}${number}${number}${number}-${| "01"
    | "02"
    | "03"
    | "04"
    | "05"
    | "06"
    | "07"
    | "08"
    | "09"
    | "11"
    | "12"}-${1 | 2 | 3}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0}`;

type Appointment = {
    date: TDate;
    from: TTime;
    to: TTime;
};

function appointment_timings(ap: Appointment): {
    start: {
        dateTime: string;
        timeZone: "Asia/Kolkata";
    };
    end: {
        dateTime: string;
        timeZone: "Asia/Kolkata";
    };
} {
    const date = ap.date;
    const timeZone = "Asia/Kolkata" as const;
    const withTime = (time: TTime) => {
        // temporary fix for time
        const getMins = (mins: number) => mins * 60 * 1000;
        const getHour = (hour: number) => hour * 60 * 60 * 1000;
        const d = new Date(date + `T${time}:00`);
        if (Intl.DateTimeFormat().resolvedOptions().timeZone === "UTC") {
            d.setTime(d.getTime() - getHour(5) - getMins(30));
        }
        return d.toISOString();
    };
    const start = {
        dateTime: withTime(ap.from),
        timeZone,
    };
    const end = {
        dateTime: withTime(ap.to),
        timeZone,
    };
    return { start, end };
}

export async function createAppointmentEvent(calendar: calendar_v3.Calendar, {
    time,
    hostEmail,
    nonHost,
    calendarId,
}: {
    time: {
        start: {
            dateTime: string,
            timeZone: 'Asia/Kolkata'
        },
        end: {
            dateTime: string,
            timeZone: 'Asia/Kolkata'
        },
    };
    hostEmail: string;
    nonHost: {
        email: string;
        description: string;
    };
    calendarId: string;
}) {
    try {
        const event = {
            summary: `appointment with ${nonHost.email}`,
            description: nonHost.description,
            ...time,
            attendees: [{ email: hostEmail }, { email: nonHost.email }],
        };

        const response = await calendar.events.insert({
            calendarId: calendarId ?? "primary",
            requestBody: event,
        });

        console.log("event created");
        return response;
    } catch (err) {
        console.log("error in creating appointment event: ", err);
    }
}

export async function createGCalEvent(calendar: calendar_v3.Calendar, {
    startTime, endTime, hostEmail, nonHostEmail
}: {
    startTime: Date,
    endTime: Date,
    hostEmail: string,
    nonHostEmail: string
}) {
    try {
        const event = {
            summary: `meet with ${hostEmail}`,
            description: "jaruri meet hai yeh bohot",
            start: {
                dateTime: startTime.toISOString(),
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: "Asia/Kolkata",
            },
            conferenceData: {
                createRequest: {
                    requestId: nanoid(),
                },
            },
            attendees: [{ email: hostEmail }, { email: nonHostEmail }],
        };

        await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
            requestBody: event,
        });
        console.log("event created");
    } catch (err) {
        console.log("error in creating gcal event: ", err);
    }
}
