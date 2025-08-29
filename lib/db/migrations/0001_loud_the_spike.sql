CREATE TABLE "body_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"part" varchar(50) NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"studio_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"image_url" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "preview_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"body_photo_id" integer NOT NULL,
	"design_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"replicate_prediction_id" text,
	"prompt" text NOT NULL,
	"seed" integer,
	"variant_params" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preview_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"thumb_url" text,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studios" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"brand_color" varchar(7) DEFAULT '#000000',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "body_photos" ADD CONSTRAINT "body_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_jobs" ADD CONSTRAINT "preview_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_jobs" ADD CONSTRAINT "preview_jobs_body_photo_id_body_photos_id_fk" FOREIGN KEY ("body_photo_id") REFERENCES "public"."body_photos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_jobs" ADD CONSTRAINT "preview_jobs_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_results" ADD CONSTRAINT "preview_results_job_id_preview_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."preview_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studios" ADD CONSTRAINT "studios_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;