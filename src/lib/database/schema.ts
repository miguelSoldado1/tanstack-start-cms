import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "../auth/auth-schema";

export * from "../auth/auth-schema";

export const serviceType = ["full-pack-creation", "full-pack", "recording", "production", "mix-master"] as const;
export const serviceTypeEnum = pgEnum("service_type", serviceType);

export const projectStatus = ["pending", "in-progress", "completed", "delivered"] as const;
export const projectStatusEnum = pgEnum("project_status", projectStatus);

export const project = pgTable("project", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone").notNull(),
  userObservations: text("user_observations"),
  serviceType: serviceTypeEnum().notNull(),
  status: projectStatusEnum().default("pending").notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  teamId: integer("team_id").references(() => team.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingStatus = ["available", "pending", "confirmed", "unavailable"] as const;
export const bookingStatusEnum = pgEnum("status", bookingStatus);

export const booking = pgTable(
  "booking",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    status: bookingStatusEnum().notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    teamId: integer("team_id").references(() => team.id),
    googleEventId: text("google_event_id").unique().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.startDate, t.endDate, t.teamId)]
);

export const room = pgTable("room", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calendarId: text("calendar_id").notNull(),
  webhookResourceId: text("webhook_resource_id").notNull(),
  webhookChannelId: text("webhook_channel_id").notNull(),
  webhookSecret: text("webhook_secret").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  syncEventName: text("sync_event_name").notNull(),
  description: text("description"),
  roomId: integer("room_id")
    .references(() => room.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roomServicePrice = pgTable(
  "room_service_price",
  {
    id: serial("id").primaryKey(),
    roomId: integer("room_id")
      .references(() => room.id, { onDelete: "cascade" })
      .notNull(),
    serviceType: serviceTypeEnum().notNull(),
    stripePriceId: text("stripe_price_id"),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique().on(t.roomId, t.serviceType)]
);

export const roomRelations = relations(room, ({ many }) => ({
  teams: many(team),
  servicePrices: many(roomServicePrice),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
  room: one(room, {
    fields: [team.roomId],
    references: [room.id],
  }),
  bookings: many(booking),
  projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  bookings: many(booking),
  team: one(team, {
    fields: [project.teamId],
    references: [team.id],
  }),
}));

export const bookingRelations = relations(booking, ({ one }) => ({
  project: one(project, {
    fields: [booking.projectId],
    references: [project.id],
  }),
  team: one(team, {
    fields: [booking.teamId],
    references: [team.id],
  }),
}));

export const roomServicePriceRelations = relations(roomServicePrice, ({ one }) => ({
  room: one(room, {
    fields: [roomServicePrice.roomId],
    references: [room.id],
  }),
}));

export type BookingWithProject = typeof booking.$inferSelect & {
  project: typeof project.$inferSelect;
};

export type RoomWithTeams = typeof room.$inferSelect & {
  teams: (typeof team.$inferSelect)[];
};

export type SelectBooking = typeof booking.$inferSelect;

export type ServiceType = (typeof serviceTypeEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
