import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const testResults = {
		environment: {
			nodeEnv: process.env.NODE_ENV,
			hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
			publicUrl: process.env.NEXT_PUBLIC_URL || 'not set',
			baseUrl: process.env.BASE_URL || 'not set',
			unlimitedCredits: process.env.DEV_UNLIMITED_CREDITS === 'true',
			initialCredits: process.env.INITIAL_USER_CREDITS || '3',
		},
		urls: {
			currentHost: request.headers.get('host'),
			isLocalhost: request.headers.get('host')?.includes('localhost'),
			wouldUseWebhook: process.env.NEXT_PUBLIC_URL && !process.env.NEXT_PUBLIC_URL.includes('localhost'),
		},
		mockMode: {
			active: !process.env.REPLICATE_API_TOKEN,
			reason: !process.env.REPLICATE_API_TOKEN ? 'No REPLICATE_API_TOKEN set' : 'API token is configured',
		},
		recommendations: [] as string[],
	}

	// Add recommendations based on configuration
	if (testResults.urls.isLocalhost && process.env.REPLICATE_API_TOKEN) {
		testResults.recommendations.push(
			'⚠️ Using localhost with Replicate API - uploaded images won\'t be accessible to Replicate servers.',
			'💡 Consider using ngrok or deploying to Vercel for testing with real predictions.',
			'💡 Or remove REPLICATE_API_TOKEN to use mock mode for local development.'
		)
	}

	if (!process.env.REPLICATE_API_TOKEN) {
		testResults.recommendations.push(
			'✅ Running in mock mode - predictions will be simulated locally.',
			'ℹ️ Mock predictions will complete after 2 seconds with a sample image.'
		)
	}

	if (!testResults.environment.publicUrl || testResults.environment.publicUrl === 'not set') {
		testResults.recommendations.push(
			'ℹ️ NEXT_PUBLIC_URL not set - webhooks disabled, using polling for prediction status.'
		)
	}

	return NextResponse.json(testResults, { status: 200 })
}