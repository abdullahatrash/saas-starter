import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// New tables for tattoo preview MVP
export const studios = pgTable('studios', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 100 }).notNull(),
  brandColor: varchar('brand_color', { length: 7 }).default('#000000'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const designs = pgTable('designs', {
  id: serial('id').primaryKey(),
  studioId: integer('studio_id')
    .notNull()
    .references(() => studios.id),
  title: varchar('title', { length: 200 }).notNull(),
  imageUrl: text('image_url').notNull(),
  tags: jsonb('tags').$type<Array<string>>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const bodyPhotos = pgTable('body_photos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  part: varchar('part', { length: 50 }).notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const previewJobs = pgTable('preview_jobs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  bodyPhotoId: integer('body_photo_id')
    .notNull()
    .references(() => bodyPhotos.id),
  designId: integer('design_id')
    .notNull()
    .references(() => designs.id),
  status: varchar('status', { length: 20 }).notNull().default('queued'),
  replicatePredictionId: text('replicate_prediction_id'),
  prompt: text('prompt').notNull(),
  seed: integer('seed'),
  variantParams: jsonb('variant_params'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const previewResults = pgTable('preview_results', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id')
    .notNull()
    .references(() => previewJobs.id),
  imageUrl: text('image_url').notNull(),
  thumbUrl: text('thumb_url'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userCredits = pgTable('user_credits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  credits: integer('credits').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id').references(() => teams.id),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  studios: many(studios),
  payments: many(payments),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  bodyPhotos: many(bodyPhotos),
  previewJobs: many(previewJobs),
  userCredits: one(userCredits, {
    fields: [users.id],
    references: [userCredits.userId],
  }),
  payments: many(payments),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Relations for new tables
export const studiosRelations = relations(studios, ({ one, many }) => ({
  team: one(teams, {
    fields: [studios.teamId],
    references: [teams.id],
  }),
  designs: many(designs),
}));

export const designsRelations = relations(designs, ({ one, many }) => ({
  studio: one(studios, {
    fields: [designs.studioId],
    references: [studios.id],
  }),
  previewJobs: many(previewJobs),
}));

export const bodyPhotosRelations = relations(bodyPhotos, ({ one, many }) => ({
  user: one(users, {
    fields: [bodyPhotos.userId],
    references: [users.id],
  }),
  previewJobs: many(previewJobs),
}));

export const previewJobsRelations = relations(previewJobs, ({ one, many }) => ({
  user: one(users, {
    fields: [previewJobs.userId],
    references: [users.id],
  }),
  bodyPhoto: one(bodyPhotos, {
    fields: [previewJobs.bodyPhotoId],
    references: [bodyPhotos.id],
  }),
  design: one(designs, {
    fields: [previewJobs.designId],
    references: [designs.id],
  }),
  results: many(previewResults),
}));

export const previewResultsRelations = relations(previewResults, ({ one }) => ({
  job: one(previewJobs, {
    fields: [previewResults.jobId],
    references: [previewJobs.id],
  }),
}));

export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [payments.teamId],
    references: [teams.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// Export new table types
export type Studio = typeof studios.$inferSelect;
export type NewStudio = typeof studios.$inferInsert;
export type Design = typeof designs.$inferSelect;
export type NewDesign = typeof designs.$inferInsert;
export type BodyPhoto = typeof bodyPhotos.$inferSelect;
export type NewBodyPhoto = typeof bodyPhotos.$inferInsert;
export type PreviewJob = typeof previewJobs.$inferSelect;
export type NewPreviewJob = typeof previewJobs.$inferInsert;
export type PreviewResult = typeof previewResults.$inferSelect;
export type NewPreviewResult = typeof previewResults.$inferInsert;
export type UserCredits = typeof userCredits.$inferSelect;
export type NewUserCredits = typeof userCredits.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_PREVIEW = 'CREATE_PREVIEW',
  PURCHASE_CREDITS = 'PURCHASE_CREDITS',
}
