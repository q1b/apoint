import { PrismaClient } from '@prisma/client';

declare global {
	// eslint-disable-next-line no-var
	var __prisma: import('@prisma/client').PrismaClient;
}

const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
	globalThis.__prisma = prisma;
}

export default prisma ;