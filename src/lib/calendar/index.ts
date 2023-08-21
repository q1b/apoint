import "@total-typescript/ts-reset"
import prisma from "~/lib/prisma";
import {
	calendar_v3,
	auth as google,
	calendar as googleCalendar
} from "@googleapis/calendar";

export const CalendarName = "Osteopathy Appointment Calendar"

export default function calendarService(credential: { access_token: string; refresh_token: string | null; id:string }) {
	const googleAuth = (credential: { access_token: string; refresh_token: string | null;id:string }) => {
		async function getGoogleAuth() {
			const { client_id, client_secret, redirect_uri } = {
				client_id: process.env.GOOGLE_CLIENT_ID!,
				client_secret: process.env.GOOGLE_CLIENT_SECRET!,
				redirect_uri: process.env.GOOGLE_REDIRECT_URI!
			}
			const myGoogleAuth = new MyGoogleAuth(client_id, client_secret, redirect_uri);
			myGoogleAuth.setCredentials({
				access_token: credential.access_token,
				refresh_token: credential.refresh_token,
				scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar'].join(' '),
				token_type: "Bearer"
			});
			return myGoogleAuth;
		}

		const refreshAccessToken = async (myGoogleAuth: Awaited<ReturnType<typeof getGoogleAuth>>) => {
			try {
				console.log("Requesting for Refersh Token")
				const ress = await myGoogleAuth.refreshToken(credential.refresh_token);
				console.log("Response from refresh_token",ress)
				const {res} = ress;
				const token = res?.data;
				credential.access_token = token.access_token;
				// credential.expiry_date = token.expiry_date;
				await prisma.session.update({
				  where: { id: credential.id },
				  data: { 
						access_token: credential.access_token
					 },
				});
				myGoogleAuth.setCredentials({
					access_token: credential.access_token,
					refresh_token: credential.refresh_token,
					scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar'].join(' '),
					token_type: "Bearer"
				});
			} catch (err) {
				let message;
				if (err instanceof Error) message = err.message;
				else message = String(err);
				console.error("GOOGLE ERROR MESSAGE \n",message)
				// if not invalid_grant, default behaviour (which admittedly isn't great)
				if (message !== "invalid_grant") return myGoogleAuth;
				// when the error is invalid grant, it's unrecoverable and the credential marked invalid.
				// TODO: Evaluate bubbling up and handling this in the CalendarManager. IMO this should be done
				//       but this is a bigger refactor.
			}
			return myGoogleAuth;
		};
		return {
			getToken: async () => {
				const myGoogleAuth = await getGoogleAuth();
				const isExpired = () => myGoogleAuth.isTokenExpiring();
				return !isExpired() ? Promise.resolve(myGoogleAuth) : refreshAccessToken(myGoogleAuth);
			},
		};
	};
	const auth = googleAuth(credential);
	// '2013-02-14T13:15:03-08:00' (YYYY-MM-DDTHH:mm:ssZ)
	const createEvent = async (calendarId: string,
		{ summary, startTime, endTime, timeZone, hostEmail, nonHostEmail }: { summary: string; startTime: string; endTime: string; timeZone?: string; hostEmail: string; nonHostEmail: string }) => {
		const myGoogleAuth = await auth.getToken();
		const payload: calendar_v3.Schema$Event = {
			summary: CalendarName,
			description: summary,
			start: {
				dateTime: startTime,
				timeZone: timeZone || 'Asia/Kolkata',
			},
			end: {
				dateTime: endTime,
				timeZone: timeZone || 'Asia/Kolkata',
			},
			attendees: [
				{ email: hostEmail, organizer: true },
				{ email: nonHostEmail, organizer: false }
			],
			reminders: {
				useDefault: true,
			},
		};
		const calendar = googleCalendar({
			version: "v3",
		});
		try {
			const res = await calendar.events.insert({
				auth: myGoogleAuth,
				calendarId,
				requestBody: payload,
				// conferenceDataVersion: 1,
				sendUpdates: 'none'
			})
			return res.data
		} catch (error) {
			if (error) {
				console.error("There was an error contacting google calendar service: ", error);
				return error
			}
		}
	}

	const deleteEvent = async (calendarId: string, eventId: string) => {
		const myGoogleAuth = await auth.getToken();
		const calendar = googleCalendar({
			version: "v3",
		});
		const defaultCalendarId = "primary";
		try {
			const res = await calendar.events.delete(
				{
					auth: myGoogleAuth,
					calendarId: calendarId ? calendarId : defaultCalendarId,
					eventId,
					sendNotifications: false,
					sendUpdates: "none"
				}
			)
			return res
		} catch (err) {
			console.error("There was an error contacting google calendar service: ", err);
			return err
		}
	}
	const getAvailability = async (
		calendarId: string,
		dateFrom: string,
		dateTo: string,
	) => {
		const myGoogleAuth = await auth.getToken();

		const calendar = googleCalendar({
			version: "v3",
			auth: myGoogleAuth,
		});


		const { data: calendarList } = await calendar.calendarList.list()
		const calendarIds = calendarList.items?.map((cal) => cal.id).filter(Boolean) || [calendarId]
		const apires = await calendar.freebusy.query(
			{
				requestBody: {
					timeMin: dateFrom,
					timeMax: dateTo,
					items: calendarIds.map((id) => ({ id: id })),
				},
			}
		)

		if (!apires?.data.calendars) return []
		const result = Object.values(apires.data.calendars).reduce((c, i) => {
			i.busy?.forEach((busyTime) => {
				c.push({
					start: busyTime.start || "",
					end: busyTime.end || "",
				});
			});
			return c;
		})
		return result
	}
	const listCalendars = async () => {
		const myGoogleAuth = await auth.getToken();
		const calendar = googleCalendar({
			version: "v3",
			auth: myGoogleAuth,
		});
		const calendarList = await calendar.calendarList.list();
		return calendarList.data.items?.map((cal) => ({
			externalId: cal.id ?? "No id",
			name: cal.summary ?? "No name",
			primary: cal.primary ?? false,
			readOnly: !(cal.accessRole === "reader" || cal.accessRole === "owner") && true,
			email: cal.id ?? "",
			summary: cal.summary
		})) || []
	}
	const getCalendar = async () => {
		const myGoogleAuth = await auth.getToken();
		const calendar = googleCalendar({
			version: "v3",
			auth: myGoogleAuth,
		});
		let list;
		try {
			list = await listCalendars();
		} catch (err) {
			console.log("Credential Failed", err);
		}
		const res = list?.find((item) => item.summary === CalendarName);
		if (!res) return undefined;
		const calendar_res = await calendar.calendars.get({
			calendarId: res.externalId as string,
		});
		return calendar_res?.data;
	}
	const addCalendar = async () => {
		const myGoogleAuth = await auth.getToken();
		const calendar = googleCalendar({
			version: "v3",
			auth: myGoogleAuth,
		});
		const res = await calendar.calendars.insert({
			requestBody: {
				summary: CalendarName,
				timeZone: "Asia/Kolkata",
			},
		});
		return res.data;
	}
	return {
		getCalendar,
		addCalendar,
		getAvailability,
		listCalendars,
		deleteEvent,
		createEvent,
	}
}

class MyGoogleAuth extends google.OAuth2 {
	constructor(client_id: string, client_secret: string, redirect_uri: string) {
		super(client_id, client_secret, redirect_uri);
	}

	isTokenExpiring() {
		return super.isTokenExpiring();
	}

	async refreshToken(token: string | null | undefined) {
		return super.refreshToken(token);
	}
}