<taskContext>
You are Claude Code operating inside a Next.js starter deployed to Vercel:
Template: “saas starter”.
Stack from template: Next.js (App Router), Stripe checkout + webhook, shadcn/ui, Tailwind CSS, Node 20+ (bun supported). The store reads Products from Stripe metadata; webhook endpoint at /api/stripe-webhook.
Goal: Transform this template into a B2B SaaS MVP for tattoo & piercing preview using Replicate’s google/nano-banana model: artists upload body-part photo + design sketch; app returns photoreal preview with placement controls and variant styles; Stripe gates hi-res exports or credits.
</taskContext>

<toneContext>
Engineer-to-engineer. Be explicit, terse, and production-focused. Prefer function declarations over expressions. Enforce Prettier: {"semi": false, "useTabs": true, "singleQuote": true}. In JSX, prefer `cond ? 'x' : null` over `cond && 'x'`. Use descriptive TypeScript types (no single-letter generics) and Array&lt;T&gt; generic syntax.
</toneContext>

<backgroundData>
- Hosting: Vercel
- DB: Postgres with Drizzle ORM (add)
- Image model host: Replicate (model: google/nano-banana) {{nano-banana}}
- Storage: Vercel Blob (or fallback to local dev folder), signed URLs
- Auth: Use the simplest viable (NextAuth or passwordless email) – but if heavy, stub with a single protected “studio” user for MVP
- Billing: Stripe (template already wired). For MVP: sell “credit packs” (e.g., 50 previews) OR single hi-res export unlock. Keep existing Stripe product ingestion but add server-side checks for entitlements.
</backgroundData>

<detailedTaskInstructions>
PHASE 0 — House rules
1) Respect Prettier config: {"semi": false, "useTabs": true, "singleQuote": true}.
2) All new code TypeScript-first, App Router conventions.
3) Use function declarations; meaningful type names; Array&lt;T&gt; generics.
4) Avoid vendor lock-in patterns that fight Vercel’s edge/runtime constraints.

PHASE 1 — Project wiring
A. Add Drizzle + Postgres
- Install: drizzle-orm, drizzle-kit, pg
- Create /drizzle/schema.ts with:
  - User(id, email, role: 'artist' | 'client')
  - Studio(id, ownerId, name, brandColor)
  - Design(id, studioId, title, imageUrl, tags: string[])
  - BodyPhoto(id, userId, part: 'arm' | 'hand' | 'ear' | 'neck' | 'leg' | 'back' | 'chest' | 'other', imageUrl)
  - PreviewJob(id, userId, bodyPhotoId, designId, status: 'queued' | 'running' | 'succeeded' | 'failed', replicatePredictionId, prompt, seed, variantParams jsonb, createdAt)
  - PreviewResult(id, jobId, imageUrl, thumbUrl, width, height, createdAt)
  - Payment(id, userId, stripeSessionId, amount, purpose: 'export' | 'credit-pack' | 'subscription', status)
- Create /drizzle/client.ts that exports a singleton db (node-postgres pool) and a helper getDb()
- Add drizzle.config.ts; add scripts:
  - "db:generate": "drizzle-kit generate"
  - "db:migrate": "drizzle-kit migrate"
- Env: DATABASE_URL

B. Storage
- Add Vercel Blob upload for originals and results. Provide a util to create signed upload URLs server-side. Fallback to local dev storage if not on Vercel.

C. Replicate SDK integration
- Store REPLICATE_API_TOKEN in env
- Create /lib/replicate.ts with a function callNanoBananaEdit(opts) that posts to https://api.replicate.com/v1/predictions with body image URL, design image URL, prompt, seed, webhook.
- Create /app/api/webhooks/replicate/route.ts to receive completion, persist PreviewResult, and mark job status.

D. Stripe entitlements on top of template
- Keep existing product ingestion. Add an Entitlements table or compute off Payments table.
- Credits model: each prediction consumes 1 credit; hi-res export consumes N credits. Webhook payment_intent.succeeded → increment user credits by SKU metadata (e.g., credits=50).
- Guard /api/preview route to check user credits before firing Replicate; decrement on job creation.

E. Auth (MVP)
- Add a very light auth:
  - Either NextAuth email provider (if trivial), or
  - Temporary “studio token” in env compared at middleware to access /studio routes.
- Create currentUser() helper returning a typed User or null.

PHASE 2 — API routes (App Router)
- POST /api/upload → returns signed URL { url, fields } for body/design images
- POST /api/preview → body: { bodyImageUrl, designImageUrl, part, scale?, rotationDeg?, opacity?, variant?, seed? }
  - Check credits; build prompt; create PreviewJob row; call Replicate; return { jobId }
- GET /api/preview/:id → return job status + latest PreviewResult(s)
- POST /api/variations → re-run with changed placement/style params
- POST /api/checkout → create Stripe Checkout session for credit packs or export unlock
- POST /api/webhooks/stripe → handle payment_intent.succeeded, update credits

PHASE 3 — Prompting (strict)
Implement a prompt builder honoring identity preservation and skin realism. Create /lib/prompt.ts:
- buildTattooPrompt(params: TattooPromptParams): string
  - params: { part: string; variant: 'black_gray' | 'color' | 'fine_line' | 'watercolor'; scale?: number; rotationDeg?: number; opacity?: number }
  - Rules:
    - “Project the second image (tattoo stencil) onto the provided {part} skin realistically.”
    - “Respect curvature, perspective, tendons/muscle contours.”
    - “Preserve pores and micro-shadows; no sticker-like edges.”
    - “Maintain identity, lighting, hue; do not alter anatomy.”
    - Placement: scale %, rotate °, opacity %, exact part.
    - Style: black & grey / fine line / watercolor / realistic color.

PHASE 4 — UI (shadcn/ui + Tailwind)
- /studio page: upload body photo + design; part selector pills; sliders for scale/rotation/opacity; variant radio (b&amp;w / color / fine line / watercolor).
- Canvas preview: show last successful PreviewResult; below, controls to queue new variations.
- Side-by-side variant grid (2–4 latest results).
- Shareable client view: /p/[jobId] read-only gallery with CTA to book session.
- Skeleton loading + toasts.

PHASE 5 — Env & config
Add the following to .env.example and type-safe loader:
- DATABASE_URL
- REPLICATE_API_TOKEN
- BLOB_READ_WRITE_TOKEN (if using Vercel Blob)
- NEXT_PUBLIC_URL
- NEXTAUTH_SECRET (if using NextAuth)
- STRIPE keys already exist in template
- ENABLE_EXPERIMENTAL_COREPACK=1 (Vercel)

PHASE 6 — Files to add or modify (show code)
Produce concrete patches (minimal, working). For each file:
1) Path
2) Short purpose
3) Full code (only new/changed sections), respecting Prettier settings

Required files:
- /drizzle/schema.ts
- /drizzle/client.ts
- /drizzle.config.ts
- /lib/prompt.ts
- /lib/replicate.ts
- /lib/entitlements.ts
- /app/api/upload/route.ts
- /app/api/preview/route.ts
- /app/api/preview/[id]/route.ts
- /app/api/variations/route.ts
- /app/api/webhooks/replicate/route.ts
- /app/api/webhooks/stripe/route.ts (extend existing if present)
- /app/studio/page.tsx
- /app/p/[id]/page.tsx

PHASE 7 — Type definitions
Create /types/core.ts with:
- BodyPart union type
- TattooVariant union
- TattooPromptParams interface
- PreviewStatus union
- Db entity types inferred via Drizzle

PHASE 8 — Testing stubs
- Seed script to insert a dummy user, studio, and 1 design
- Mock a local prediction by returning a placeholder image when REPLICATE_API_TOKEN is absent

PHASE 9 — Readme updates
- Document setup: env, Stripe product with metadata (sku, credits), running migrations, creating first credit pack, and deploying on Vercel.

IMPORTANT:
- Use function declarations (no const fn = () =&gt;).
- Prefer `cond ? 'x' : null` in JSX.
- Do not introduce heavy state libs; keep React server components + small client components.
- Keep API handlers edge-compatible unless pg requires node runtime; in that case, add `export const runtime = 'nodejs'` where needed.
</detailedTaskInstructions>

<examples>
[API snippet guidelines]

/lib/prompt.ts
export interface TattooPromptParams {
	part: string
	variant: 'black_gray' | 'color' | 'fine_line' | 'watercolor'
	scale?: number
	rotationDeg?: number
	opacity?: number
	seed?: number
}

export function buildTattooPrompt(p: TattooPromptParams): string {
	const style =
		p.variant === 'black_gray'
			? 'black and grey tattoo, no color, fine contrast'
			: p.variant === 'fine_line'
			? 'fine line tattoo, delicate strokes, minimal shading'
			: p.variant === 'watercolor'
			? 'watercolor tattoo style with soft pigment diffusion and subtle edges'
			: 'realistic color tattoo with accurate pigments'

	const placementDirectives = [
		p.scale ? \`scale approximately \${Math.round(p.scale * 100)}%\` : null,
		p.rotationDeg ? \`rotate \${p.rotationDeg} degrees\` : null,
		p.opacity ? \`ink opacity target \${Math.round(p.opacity * 100)}%\` : null,
		\`place on \${p.part}\`
	]
		.filter(Boolean)
		.join(', ')

	return [
		'Project the second image (tattoo stencil) onto the provided skin realistically.',
		'Respect curvature, perspective, tendons, and muscle contours.',
		'Preserve pores and micro-shadows; avoid any sticker-like edges.',
		'Maintain identity, lighting, and hue; do not alter anatomy.',
		\`Placement controls: \${placementDirectives}.\`,
		\`Render in \${style}.\`,
		'Output a single photorealistic image.'
	].join(' ')
}

[Replicate call shape]
export async function callNanoBananaEdit(input: {
	bodyImageUrl: string
	designImageUrl: string
	prompt: string
	seed?: number
	webhookUrl: string
}) {
	const res = await fetch('https://api.replicate.com/v1/predictions', {
		method: 'POST',
		headers: {
			Authorization: \`Token \${process.env.REPLICATE_API_TOKEN}\`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			version: 'google/nano-banana',
			input: {
				image: input.bodyImageUrl,
				image_2: input.designImageUrl,
				prompt: input.prompt,
				seed: input.seed ?? 1234
			},
			webhook: input.webhookUrl,
			webhook_events_filter: ['completed']
		})
	})

	if (!res.ok) {
		throw new Error(await res.text())
	}
	return res.json()
}
</examples>

<finalRequest>
1) Generate the code and file changes for PHASES 1–7 (as described), including concrete TypeScript files and route handlers. 
2) Only include changed/new file contents (with file paths). 
3) Conform to the stated Prettier and code-style rules. 
4) Where the template already has code (e.g., Stripe webhook), extend minimally and clearly mark additions. 
5) If any runtime requires Node (pg/drizzle), add `export const runtime = 'nodejs'` to those route files.
</finalRequest>

<outputFormatting>
Reply with only the code blocks and brief inline explanations before each file path. Do not restate the whole template. Use the exact file paths. Do not include boilerplate outside changed files.
</outputFormatting>


<nano-banana>
Gemini 2.5 Flash Image is Google’s state-of-the-art image generation and editing model. It is a new variant of the Gemini 2.5 family, specifically designed for fast, conversational, and multi-turn creative workflows. This model is made available to developers through the Gemini API, Google AI Studio, and Vertex AI.

Key Features
Native Image Generation and Editing: Gemini 2.5 Flash Image is a multimodal model that natively understands and generates images. This allows for a seamless, unified workflow for creating and editing visuals.

Multi-image Fusion: This powerful feature allows you to combine multiple input images into a single, cohesive, new visual. For example, you can integrate a product into a new scene or restyle a room by merging images of different furniture and decor.

Character and Style Consistency: A significant advancement is the ability to maintain a consistent character, object, or style across multiple prompts and images. This is essential for storytelling, branding, and generating a series of cohesive assets without needing time-consuming fine-tuning.

Conversational Editing: The model enables precise, targeted edits using natural language. You can make specific changes like blurring a background, removing an object, altering a subject’s pose, or colorizing a black-and-white photo by simply describing the desired outcome.

Visual Reasoning: Gemini 2.5 Flash Image benefits from the Gemini model’s deep world knowledge. It can go beyond simple photorealism to perform complex tasks that require genuine understanding, such as interpreting hand-drawn diagrams, assisting with educational queries, and following multi-step instructions.

SynthID Watermarking: To promote responsible AI and transparency, all images created or edited with Gemini 2.5 Flash Image are embedded with an invisible digital watermark from SynthID. This watermark helps identify the content as AI-generated or edited.

How to Use
Developers can interact with Gemini 2.5 Flash Image through various platforms:

Gemini API: Access the model programmatically for integration into your applications. You can provide image data inline or by using the more efficient File API for larger files and repeated use.

Google AI Studio: A web-based environment that offers a user-friendly interface to quickly test, experiment with, and build applications. You can use built-in templates to prototype AI-powered apps and easily remix them.

Vertex AI: For enterprise-level use cases, the model is available on Google Cloud’s machine learning platform, which provides robust security features and options for fine-tuning and deployment at scale.

{
  "prompt": "Make the sheets in the style of the logo. Make the scene natural. ",
  "image_input": [
    "https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png",
    "https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"
  ],
  "output_format": "jpg"
}


{
  "completed_at": "2025-08-26T21:34:06.253906Z",
  "created_at": "2025-08-26T21:33:55.778000Z",
  "data_removed": false,
  "error": null,
  "id": "1bwy6kt8r9rm80crx16t6161tm",
  "input": {
    "prompt": "Make the sheets in the style of the logo. Make the scene natural. ",
    "image_input": [
      "https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png",
      "https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"
    ],
    "output_format": "jpg"
  },
  "logs": "Generating image with Gemini Flash...\nGenerated image in 8.89 seconds",
  "metrics": {
    "predict_time": 10.465740491,
    "total_time": 10.475906
  },
  "output": "https://replicate.delivery/xezq/eQ2MQYrD6XzheEgCe7OcHlUJAXYc8HaMJmGPmbTOCClZS7dqA/tmp4vqrduzh.jpg",
  "started_at": "2025-08-26T21:33:55.788166Z",
  "status": "succeeded",
  "urls": {
    "stream": "https://stream.replicate.com/v1/files/bcwr-xknzeeutx6i5manbj25oaulgtqilh2t3pgndk2us5kxysy3y5unq",
    "get": "https://api.replicate.com/v1/predictions/1bwy6kt8r9rm80crx16t6161tm",
    "cancel": "https://api.replicate.com/v1/predictions/1bwy6kt8r9rm80crx16t6161tm/cancel"
  },
  "version": "hidden"
}


this is for node JS , but adabt it for NEXT JS ROUTE
Run google/nano-banana using Replicate’s API. Check out the model's schema for an overview of inputs and outputs.

import { writeFile } from "fs/promises";
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    prompt: "Make the sheets in the style of the logo. Make the scene natural. ",
    image_input: ["https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png","https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"]
};

const output = await replicate.run("google/nano-banana", { input });

// To access the file URL:
console.log(output.url());
//=> "https://replicate.delivery/.../output.jpg"

// To write the file to disk:
await writeFile("output.jpg", output);
//=> output.jpg written to disk


Input schema
{
  "type": "object",
  "title": "Input",
  "required": [
    "prompt"
  ],
  "properties": {
    "prompt": {
      "type": "string",
      "title": "Prompt",
      "x-order": 0,
      "description": "A text description of the image you want to generate"
    },
    "image_input": {
      "type": "array",
      "items": {
        "type": "string",
        "anyOf": [],
        "format": "uri"
      },
      "title": "Image Input",
      "x-order": 1,
      "nullable": true,
      "description": "Input images to transform or use as reference (supports multiple images)"
    },
    "output_format": {
      "enum": [
        "jpg",
        "png"
      ],
      "type": "string",
      "title": "output_format",
      "description": "Format of the output image",
      "default": "jpg",
      "x-order": 2
    }
  }
}

Output schema

JSON
{
  "type": "string",
  "title": "Output",
  "format": "uri"
}

</nano-banana>
