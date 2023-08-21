import { JSONObject } from "@builder.io/qwik-city";
import { kv } from "./kv";
import { extractFromEmail } from "~/utils";

/**
 * Important Notes
 * now, looking forward with just using Google Auth for source of truth
 */

const keys = [
	'user',
	'osteopath'
] as const

type TKeys = typeof keys;

// 2022mos MSc Osteopathy 2022-24 <mos2023-25@srisriuniversity.edu.in>, 
// 2022bos BSc Osteopathy 2022-26 <bos2023-27@srisriuniversity.edu.in>

// Rimjhim Chhimpa <rimjhim.c2022bos@srisriuniversity.edu.in>, 
// ANISHA SINGH THAKURI THAKURI <anisha.t2022mos@srisriuniversity.edu.in>

export type UserData = {
	name: string
	email: string
	image: string
	id: string
	created_at?: string
	batch?: string
	year?: string
}

export type OsteopathData = {
	id: string
	created_at: string
}

const createNewMethod = <const T extends JSONObject>(key: string, identifier: keyof Omit<T, 'created_at'>, preprocess: (data: Omit<T, 'created_at'>) => T) => {
	return async (data: Omit<T, 'created_at'>) => {
		try {
			if (await kv.has(`${key}:${data[identifier]}`)) {
				return {
					error: `${key} is already present`
				}
			} else {
				const preprocessed = preprocess(data);
				await kv.set(`${key}:${data[identifier]}`,
					preprocessed)
				return {
					data: {
						...preprocessed,
						created_at: (new Date()).toISOString()
					},
					error: undefined
				}
			}
		} catch (error) {
			console.error(error)
			return {
				error: `Failed to crate new ${key}`
			}
		}
	}
}

const createSelectMethod = <const T extends JSONObject>(key: string, identifier: string) => {
	return async () => {
		try {
			if (!(await kv.has(`${key}:${identifier}`))) {
				return {
					error: `${key} not found`
				}
			}
			const data = await kv.get(`${key}:${identifier}`) as T
			return {
				data: data
			}
		} catch (error) {
			console.error(error)
			return {
				error: `Failed to select ${key}`
			}
		}
	}
}

const createUpdateMethod = <const T extends JSONObject>(key: string, identifier: string) => {
	return async (data: Partial<T>) => {
		try {
			if (!(await kv.has(`${key}:${identifier}`))) {
				return {
					error: `${key} not found`
				}
			}
			const received_data = await kv.get(`${key}:${identifier}`) as T;
			if (received_data === null) return { error: 'Data is null' }
			await kv.set(`${key}:${identifier}`, {
				...received_data,
				...data
			});
			return {
				data: {
					...received_data,
					...data
				}
			}
		} catch (error) {
			return {
				error
			}
		}
	}
}

const createDeleteMethod = (key: string, identifier: string) => {
	return async () => {
		try {
			if (!(await kv.has(`${key}:${identifier}`))) {
				return {
					error: 'user not found'
				}
			}
			await kv.del(`${key}:${identifier}`)
			return {
				data: 'Successful'
			}
		} catch (error) {
			return {
				error
			}
		}
	};
}


function getDB<const T extends TKeys[number], K extends JSONObject>(key: T) {
	return (identifier: string) => ({
		select: createSelectMethod<K>(key, identifier),
		update: createUpdateMethod<K>(key, identifier),
		delete: createDeleteMethod(key, identifier)
	})
}

export const db = {
	users: async () => {
		const keys = await kv.getKeys('user') as unknown as string[];
		const temp = [];
		for (let index = 0; index < keys.length; index++) {
			const key = keys[index];
			const id = key.split(':')[1]
			temp.push(db.user(id).select())
		}
		const values = (await Promise.all(temp)).map((v, i) => ({ id: keys[i].split(':')[1], ...v.data } as UserData));
		return values;
	},
	new: {
		user: createNewMethod<UserData>('user', 'id',(data) => {
			const details = extractFromEmail(data.email)
			console.log(data.email,details)
			if(!details) return data;
			return {
				...data,
				year:details.year,
				batch:details.batch
			}
		}),
	},
	user: getDB<'user', UserData>('user'),
}