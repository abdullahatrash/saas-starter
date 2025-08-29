import { db } from '@/lib/db/drizzle'
import { userCredits, payments } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// Get initial credits from environment or use default
const getInitialCredits = () => {
	const fromEnv = process.env.INITIAL_USER_CREDITS
	return fromEnv ? parseInt(fromEnv) : 3
}

// Check if unlimited credits in dev mode
const isUnlimitedCreditsMode = () => {
	return process.env.DEV_UNLIMITED_CREDITS === 'true' && process.env.NODE_ENV !== 'production'
}

export async function getUserCredits(userId: number): Promise<number> {
	// In dev mode with unlimited credits, always return high number
	if (isUnlimitedCreditsMode()) {
		return 999999
	}

	const result = await db
		.select({ credits: userCredits.credits })
		.from(userCredits)
		.where(eq(userCredits.userId, userId))
		.limit(1)

	return result[0]?.credits || 0
}

export async function initializeUserCredits(userId: number, initialCredits?: number): Promise<void> {
	const credits = initialCredits ?? getInitialCredits()
	
	await db
		.insert(userCredits)
		.values({
			userId,
			credits,
		})
		.onConflictDoNothing()
}

export async function consumeCredits(userId: number, amount = 1): Promise<boolean> {
	// In unlimited mode, always allow consumption without updating DB
	if (isUnlimitedCreditsMode()) {
		return true
	}

	const currentCredits = await getUserCredits(userId)

	if (currentCredits < amount) {
		return false
	}

	await db
		.update(userCredits)
		.set({
			credits: currentCredits - amount,
			updatedAt: new Date(),
		})
		.where(eq(userCredits.userId, userId))

	return true
}

export async function addCredits(userId: number, amount: number): Promise<void> {
	const currentCredits = await getUserCredits(userId)

	await db
		.insert(userCredits)
		.values({
			userId,
			credits: amount,
		})
		.onConflictDoUpdate({
			target: userCredits.userId,
			set: {
				credits: currentCredits + amount,
				updatedAt: new Date(),
			},
		})
}

export async function recordPayment(data: {
	userId: number
	teamId?: number
	stripeSessionId?: string
	stripePaymentIntentId?: string
	amount: number
	purpose: 'export' | 'credit-pack' | 'subscription'
	status: 'pending' | 'succeeded' | 'failed'
	metadata?: any
}): Promise<void> {
	await db.insert(payments).values({
		...data,
		amount: data.amount.toString()
	})
}

export async function updatePaymentStatus(
	stripeSessionId: string,
	status: 'succeeded' | 'failed'
): Promise<{ userId: number; metadata: any } | null> {
	const result = await db
		.update(payments)
		.set({ status })
		.where(eq(payments.stripeSessionId, stripeSessionId))
		.returning({ userId: payments.userId, metadata: payments.metadata })

	return result[0] || null
}
