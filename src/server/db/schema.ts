import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `meditation-timer_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  preferences: one(userPreferences),
  meditationSessions: many(meditationSessions),
  scheduledMeditations: many(scheduledMeditations),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const sounds = createTable(
  "sound",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 100 }).notNull(),
    description: d.text(),
    category: d.varchar({ length: 50 }).notNull(), // "ambience", "bell", "nature", etc.
    filePath: d.varchar({ length: 255 }).notNull(), // Path to audio file
    previewPath: d.varchar({ length: 255 }), // Path to preview snippet
    isDefault: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("sounds_category_idx").on(t.category)],
);

export const soundsRelations = relations(sounds, ({ many }) => ({
  userPreferencesEnd: many(userPreferences, { relationName: "endSound" }),
  userPreferencesPreferred: many(userPreferences, { relationName: "preferredSound" }),
  meditationSessions: many(meditationSessions),
  scheduledMeditations: many(scheduledMeditations),
}));

export const userPreferences = createTable(
  "user_preference",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    preparationTime: d.integer().default(10), // Seconds before meditation starts
    defaultDuration: d.integer().default(600), // Default meditation duration in seconds (10 min)
    endSoundId: d.integer().references(() => sounds.id), // Sound to play when timer ends
    backgroundImage: d.varchar({ length: 100 }).default("default"), // Background image for timer
    preferredSoundId: d.integer(), // Reference to preferred sound
    dailyGoal: d.integer().default(600), // Daily meditation goal in seconds (10 min)
    weeklyGoal: d.integer().default(1800), // Weekly meditation goal in seconds (30 min)
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (t) => [index("user_preferences_user_id_idx").on(t.userId)],
);

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
  endSound: one(sounds, {
    fields: [userPreferences.endSoundId],
    references: [sounds.id],
  }),
  preferredSound: one(sounds, {
    fields: [userPreferences.preferredSoundId],
    references: [sounds.id],
  }),
}));

export const meditationSessions = createTable(
  "meditation_session",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    duration: d.integer().notNull(), // Actual duration in seconds
    startTime: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completed: d.boolean().default(true),
    notes: d.text(),
    soundId: d.integer(), // Optional reference to sound used
    backgroundImage: d.varchar({ length: 100 }).default("default"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("meditation_sessions_user_id_idx").on(t.userId)],
);

export const meditationSessionsRelations = relations(meditationSessions, ({ one }) => ({
  user: one(users, {
    fields: [meditationSessions.userId],
    references: [users.id],
  }),
  sound: one(sounds, {
    fields: [meditationSessions.soundId],
    references: [sounds.id],
  }),
}));

export const backgroundImages = createTable(
  "background_image",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 100 }).notNull(),
    description: d.text(),
    category: d.varchar({ length: 50 }).notNull(), // "nature", "abstract", etc.
    imagePath: d.varchar({ length: 255 }).notNull(), // Path to image file
    thumbnailPath: d.varchar({ length: 255 }), // Path to thumbnail
    isDefault: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("background_images_category_idx").on(t.category)],
);

export const backgroundImagesRelations = relations(backgroundImages, ({ many }) => ({
  scheduledMeditations: many(scheduledMeditations),
}));

export const scheduledMeditations = createTable(
  "scheduled_meditation",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 100 }),
    description: d.text(),
    scheduledTime: d.timestamp({ withTimezone: true }).notNull(),
    duration: d.integer().notNull(), // Planned duration in seconds
    isRecurring: d.boolean().default(false),
    recurrenceRule: d.json(), // JSON object defining recurrence pattern
    soundId: d.integer(), // Optional reference to sound to use
    backgroundImageId: d.integer(), // Optional reference to background image
    notifyBefore: d.integer(), // Seconds before to send notification
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("scheduled_meditations_user_id_idx").on(t.userId),
    index("scheduled_meditations_scheduled_time_idx").on(t.scheduledTime),
  ],
);

export const scheduledMeditationsRelations = relations(scheduledMeditations, ({ one }) => ({
  user: one(users, {
    fields: [scheduledMeditations.userId],
    references: [users.id],
  }),
  sound: one(sounds, {
    fields: [scheduledMeditations.soundId],
    references: [sounds.id],
  }),
  backgroundImage: one(backgroundImages, {
    fields: [scheduledMeditations.backgroundImageId],
    references: [backgroundImages.id],
  }),
}));