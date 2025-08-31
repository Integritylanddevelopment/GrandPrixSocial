import { sql, relations } from "drizzle-orm"
import { pgTable, text, uuid, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import type { z } from "zod"

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Supabase auth.users.id (UUID)
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  points: integer("points").notNull().default(0),
  rank: integer("rank").notNull().default(0),
  teamId: uuid("team_id"),
  favoriteDriver: text("favorite_driver"),
  favoriteTeam: text("favorite_team"),
  
  // AI Consent & Privacy Settings
  aiConsentGiven: boolean("ai_consent_given").notNull().default(false),
  aiConsentDate: timestamp("ai_consent_date"),
  aiConsentVersion: text("ai_consent_version").default("1.0"),
  dataRetentionPeriod: text("data_retention_period").default("30days"), // 30days, 6months, 2years
  aiFeatures: jsonb("ai_features").default({
    contentPersonalization: false,
    socialMatching: false,
    interfaceCustomization: false,
    behaviorTracking: false,
    analyticsInsights: false,
    marketingCommunications: false
  }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#DC2626"),
  logo: text("logo"),
  sponsorId: uuid("sponsor_id"),
  captainId: uuid("captain_id").notNull(),
  memberCount: integer("member_count").notNull().default(1),
  totalPoints: integer("total_points").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  isRecruiting: boolean("is_recruiting").notNull().default(true),
  teamLevel: text("team_level").notNull().default("member"), // member, captain, engineer, principal, owner
  canHostEvents: boolean("can_host_events").notNull().default(false),
  canSellMerch: boolean("can_sell_merch").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  brandColor: text("brand_color").notNull(),
  website: text("website"),
  description: text("description"),
  partnershipLevel: text("partnership_level").notNull().default("standard"), // standard, premium, exclusive
  merchandiseDiscount: integer("merchandise_discount").default(0), // percentage discount
  cafePerks: text("cafe_perks").array().default([]),
  seasonContract: boolean("season_contract").default(false),
  activeBenefits: text("active_benefits").array().default([]),
})

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: uuid("author_id").notNull(),
  content: text("content").notNull(),
  images: text("images").array(),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  teamId: uuid("team_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  type: text("type").notNull(), // 'prediction', 'recruitment', 'activity'
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  requirements: jsonb("requirements"), // flexible requirements object
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const cafeEvents = pgTable("cafe_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").notNull().default(0),
  teamId: uuid("team_id"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Team Merchandise table
export const teamMerchandise = pgTable("team_merchandise", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // jersey, cap, mug, etc.
  price: integer("price").notNull(), // in cents
  imageUrl: text("image_url"),
  description: text("description"),
  inStock: boolean("in_stock").default(true),
  sponsorDiscount: boolean("sponsor_discount").default(false),
  cafeExclusive: boolean("cafe_exclusive").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Season Tournaments table
export const seasonTournaments = pgTable("season_tournaments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  season: text("season").notNull(), // "2024", "2025", etc.
  tournamentType: text("tournament_type").notNull(), // "championship", "sprint", "qualifier"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  prizePool: integer("prize_pool").notNull(),
  maxTeams: integer("max_teams").default(16),
  currentTeams: integer("current_teams").default(0),
  status: text("status").default("upcoming"), // upcoming, active, completed
  rules: text("rules"),
  sponsorId: uuid("sponsor_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// F1 Team Performance Tracking
export const f1TeamPerformance = pgTable("f1_team_performance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamName: text("team_name").notNull(), // Ferrari, Mercedes, Red Bull, etc.
  season: text("season").notNull(),
  raceWeekend: text("race_weekend").notNull(), // "Bahrain GP", "Saudi Arabia GP", etc.
  position: integer("position"), // final race position
  points: integer("points").notNull().default(0),
  driverResults: jsonb("driver_results"), // {driver1: {position: 1, points: 25}, driver2: {position: 3, points: 15}}
  qualifyingResults: jsonb("qualifying_results"),
  fastestLap: boolean("fastest_lap").default(false),
  podiumFinish: boolean("podium_finish").default(false),
  raceDate: timestamp("race_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Tournament Participation
export const tournamentParticipation = pgTable("tournament_participation", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: uuid("tournament_id").notNull(),
  teamId: uuid("team_id").notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  currentRound: integer("current_round").default(1),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  eliminated: boolean("eliminated").default(false),
  finalPosition: integer("final_position"),
})

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  points: true,
  rank: true,
})

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  memberCount: true,
  totalPoints: true,
  wins: true,
})

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
})

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likes: true,
  comments: true,
})

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
})

export const insertCafeEventSchema = createInsertSchema(cafeEvents).omit({
  id: true,
  createdAt: true,
  currentAttendees: true,
})

export const insertTeamMerchandiseSchema = createInsertSchema(teamMerchandise).omit({
  id: true,
  createdAt: true,
})

export const insertSeasonTournamentSchema = createInsertSchema(seasonTournaments).omit({
  id: true,
  createdAt: true,
  currentTeams: true,
})

export const insertF1TeamPerformanceSchema = createInsertSchema(f1TeamPerformance).omit({
  id: true,
  createdAt: true,
})

export const insertTournamentParticipationSchema = createInsertSchema(tournamentParticipation).omit({
  id: true,
})

// Types
export type InsertUser = z.infer<typeof insertUserSchema>
export type User = typeof users.$inferSelect

export type InsertTeam = z.infer<typeof insertTeamSchema>
export type Team = typeof teams.$inferSelect

export type InsertSponsor = z.infer<typeof insertSponsorSchema>
export type Sponsor = typeof sponsors.$inferSelect

export type InsertPost = z.infer<typeof insertPostSchema>
export type Post = typeof posts.$inferSelect

export type InsertChallenge = z.infer<typeof insertChallengeSchema>
export type Challenge = typeof challenges.$inferSelect

export type InsertCafeEvent = z.infer<typeof insertCafeEventSchema>
export type CafeEvent = typeof cafeEvents.$inferSelect

export type InsertTeamMerchandise = z.infer<typeof insertTeamMerchandiseSchema>
export type TeamMerchandise = typeof teamMerchandise.$inferSelect

export type InsertSeasonTournament = z.infer<typeof insertSeasonTournamentSchema>
export type SeasonTournament = typeof seasonTournaments.$inferSelect

export type InsertF1TeamPerformance = z.infer<typeof insertF1TeamPerformanceSchema>
export type F1TeamPerformance = typeof f1TeamPerformance.$inferSelect

export type InsertTournamentParticipation = z.infer<typeof insertTournamentParticipationSchema>
export type TournamentParticipation = typeof tournamentParticipation.$inferSelect

// Extended types for frontend
export type PostWithAuthor = Post & {
  author: User
  team?: Team
}

export type TeamWithSponsor = Team & {
  sponsor?: Sponsor
  captain: User
}

// Database relations
export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  sponsor: one(sponsors, {
    fields: [teams.sponsorId],
    references: [sponsors.id],
  }),
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
  }),
  members: many(users),
  posts: many(posts),
  events: many(cafeEvents),
}))

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  teams: many(teams),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [posts.teamId],
    references: [teams.id],
  }),
}))

export const cafeEventsRelations = relations(cafeEvents, ({ one }) => ({
  team: one(teams, {
    fields: [cafeEvents.teamId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [cafeEvents.createdBy],
    references: [users.id],
  }),
}))

// Social Media Posts table for F1 content aggregation
export const socialMediaPosts = pgTable("social_media_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // "twitter", "instagram", "tiktok"
  accountHandle: text("account_handle").notNull(),
  accountType: text("account_type").notNull(), // "news", "gossip", "driver", "team"
  originalPostId: text("original_post_id").notNull().unique(),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(), // images, videos
  authorName: text("author_name").notNull(),
  authorFollowers: integer("author_followers"),
  engagement: jsonb("engagement"), // likes, shares, comments counts
  hashtags: text("hashtags").array(),
  mentions: text("mentions").array(),
  publishedAt: timestamp("published_at").notNull(),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  processed: boolean("processed").default(false),
  category: text("category"), // "breaking", "tech", "gossip", "transfers", "lifestyle"
  priority: text("priority").default("regular"), // "breaking", "trending", "regular"
})

// AI-processed F1 content (mixed news + gossip posts)
export const f1ProcessedContent = pgTable("f1_processed_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  newsPercentage: integer("news_percentage").notNull().default(70), // 70% news, 30% gossip
  gossipPercentage: integer("gossip_percentage").notNull().default(30),
  sourcePosts: text("source_posts").array(), // IDs of social media posts used
  category: text("category").notNull(), // "breaking", "trending", "tech", "gossip", "transfers"
  priority: text("priority").default("regular"),
  tags: text("tags").array(),
  readTime: integer("read_time").default(2), // estimated read time in minutes
  engagement: jsonb("engagement").default('{"views": 0, "likes": 0, "shares": 0, "comments": 0}'),
  mediaUrls: text("media_urls").array(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  processedBy: text("processed_by").default("openai"), // "openai", "manual"
  isActive: boolean("is_active").default(true),
})

// User comments on F1 content
export const contentComments = pgTable("content_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: uuid("content_id").notNull(),
  userId: uuid("user_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id"), // for nested comments
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Social Media Accounts to Monitor
export const monitoredAccounts = pgTable("monitored_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  accountType: text("account_type").notNull(), // "news", "gossip", "driver", "team"
  followers: integer("followers"),
  priority: integer("priority").default(1), // 1-5, higher = more important
  lastScrapedAt: timestamp("last_scraped_at"),
  isActive: boolean("is_active").default(true),
  scrapeFrequency: integer("scrape_frequency").default(120), // minutes between scrapes
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Live race tracking tables
// Races table for individual race information
export const races = pgTable("races", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  season: text("season").notNull(),
  round: integer("round").notNull(),
  raceName: text("race_name").notNull(),
  circuitId: uuid("circuit_id").notNull(),
  raceDate: timestamp("race_date").notNull(),
  raceTime: text("race_time"), // "14:00:00Z"
  status: text("status").default("scheduled"), // scheduled, practice, qualifying, race, finished
  weather: jsonb("weather"), // temperature, conditions, etc.
  totalLaps: integer("total_laps"),
  currentLap: integer("current_lap").default(0),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Circuits table for track information
export const circuits = pgTable("circuits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  circuitName: text("circuit_name").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  length: text("length"), // "5.412 km"
  turns: integer("turns"),
  lapRecord: text("lap_record"), // "1:31.447"
  lapRecordHolder: text("lap_record_holder"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Drivers table for current season drivers
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  driverNumber: integer("driver_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationality: text("nationality").notNull(),
  team: text("team").notNull(),
  teamColor: text("team_color").notNull(),
  points: integer("points").default(0),
  wins: integer("wins").default(0),
  podiums: integer("podiums").default(0),
  fastestLaps: integer("fastest_laps").default(0),
  championshipPosition: integer("championship_position"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Live race results for real-time tracking
export const liveRaceResults = pgTable("live_race_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  raceId: uuid("race_id").notNull(),
  driverId: uuid("driver_id").notNull(),
  position: integer("position").notNull(),
  lapsCompleted: integer("laps_completed").default(0),
  gap: text("gap"), // "+1.234s" or "1 LAP"
  lastLapTime: text("last_lap_time"), // "1:32.456"
  bestLapTime: text("best_lap_time"),
  sector1Time: text("sector1_time"),
  sector2Time: text("sector2_time"),
  sector3Time: text("sector3_time"),
  currentTyre: text("current_tyre"), // "SOFT", "MEDIUM", "HARD"
  tyreAge: integer("tyre_age").default(0),
  pitStops: integer("pit_stops").default(0),
  status: text("status").default("running"), // running, retired, dnf, finished
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Fantasy Leagues table
export const fantasyLeagues = pgTable("fantasy_leagues", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: uuid("creator_id").notNull(),
  maxParticipants: integer("max_participants").default(20),
  currentParticipants: integer("current_participants").default(0),
  entryFee: integer("entry_fee").default(0), // in points
  prizePool: integer("prize_pool").default(0),
  budget: integer("budget").default(100000000), // $100M budget in cents
  isPublic: boolean("is_public").default(true),
  isActive: boolean("is_active").default(true),
  season: text("season").notNull().default("2024"),
  scoringSystem: text("scoring_system").default("standard"), // standard, custom
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Fantasy Teams table
export const fantasyTeams = pgTable("fantasy_teams", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  leagueId: uuid("league_id").notNull(),
  teamName: text("team_name").notNull(),
  totalValue: integer("total_value").default(0), // total cost of drivers
  remainingBudget: integer("remaining_budget").default(100000000),
  totalPoints: integer("total_points").default(0),
  weeklyPoints: integer("weekly_points").default(0),
  position: integer("position").default(0),
  isValid: boolean("is_valid").default(false), // has valid lineup
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Fantasy Team Drivers (lineup)
export const fantasyTeamDrivers = pgTable("fantasy_team_drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fantasyTeamId: uuid("fantasy_team_id").notNull(),
  driverId: uuid("driver_id").notNull(),
  driverCost: integer("driver_cost").notNull(), // cost when selected
  isActive: boolean("is_active").default(true),
  addedAt: timestamp("added_at").defaultNow().notNull(),
})

// Fantasy Driver Prices (dynamic pricing)
export const fantasyDriverPrices = pgTable("fantasy_driver_prices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: uuid("driver_id").notNull(),
  price: integer("price").notNull(), // in cents
  weeklyChange: integer("weekly_change").default(0), // price change from last week
  popularity: integer("popularity").default(0), // % of teams that own this driver
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Fantasy Scoring Events
export const fantasyScoringEvents = pgTable("fantasy_scoring_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  raceId: uuid("race_id").notNull(),
  driverId: uuid("driver_id").notNull(),
  eventType: text("event_type").notNull(), // "finish_position", "fastest_lap", "pole", "dnf"
  points: integer("points").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Insert schemas for new tables
export const insertRaceSchema = createInsertSchema(races).omit({
  id: true,
  createdAt: true,
  currentLap: true,
  isLive: true,
})

export const insertCircuitSchema = createInsertSchema(circuits).omit({
  id: true,
  createdAt: true,
})

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  points: true,
  wins: true,
  podiums: true,
  fastestLaps: true,
})

export const insertLiveRaceResultSchema = createInsertSchema(liveRaceResults).omit({
  id: true,
  updatedAt: true,
})

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  scrapedAt: true,
  processed: true,
})

export const insertF1ProcessedContentSchema = createInsertSchema(f1ProcessedContent).omit({
  id: true,
  publishedAt: true,
  processedBy: true,
  isActive: true,
})

export const insertContentCommentSchema = createInsertSchema(contentComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const insertMonitoredAccountSchema = createInsertSchema(monitoredAccounts).omit({
  id: true,
  createdAt: true,
})

export const insertFantasyLeagueSchema = createInsertSchema(fantasyLeagues).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
  prizePool: true,
})

export const insertFantasyTeamSchema = createInsertSchema(fantasyTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalPoints: true,
  weeklyPoints: true,
  position: true,
})

export const insertFantasyTeamDriverSchema = createInsertSchema(fantasyTeamDrivers).omit({
  id: true,
  addedAt: true,
})

export const insertFantasyDriverPriceSchema = createInsertSchema(fantasyDriverPrices).omit({
  id: true,
  updatedAt: true,
})

export const insertFantasyScoringEventSchema = createInsertSchema(fantasyScoringEvents).omit({
  id: true,
  createdAt: true,
})

// Types for new tables
export type Race = typeof races.$inferSelect
export type InsertRace = z.infer<typeof insertRaceSchema>

export type Circuit = typeof circuits.$inferSelect
export type InsertCircuit = z.infer<typeof insertCircuitSchema>

export type Driver = typeof drivers.$inferSelect
export type InsertDriver = z.infer<typeof insertDriverSchema>

export type LiveRaceResult = typeof liveRaceResults.$inferSelect
export type InsertLiveRaceResult = z.infer<typeof insertLiveRaceResultSchema>

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>

export type F1ProcessedContent = typeof f1ProcessedContent.$inferSelect
export type InsertF1ProcessedContent = z.infer<typeof insertF1ProcessedContentSchema>

export type ContentComment = typeof contentComments.$inferSelect
export type InsertContentComment = z.infer<typeof insertContentCommentSchema>

export type MonitoredAccount = typeof monitoredAccounts.$inferSelect
export type InsertMonitoredAccount = z.infer<typeof insertMonitoredAccountSchema>

export type FantasyLeague = typeof fantasyLeagues.$inferSelect
export type InsertFantasyLeague = z.infer<typeof insertFantasyLeagueSchema>

export type FantasyTeam = typeof fantasyTeams.$inferSelect
export type InsertFantasyTeam = z.infer<typeof insertFantasyTeamSchema>

export type FantasyTeamDriver = typeof fantasyTeamDrivers.$inferSelect
export type InsertFantasyTeamDriver = z.infer<typeof insertFantasyTeamDriverSchema>

export type FantasyDriverPrice = typeof fantasyDriverPrices.$inferSelect
export type InsertFantasyDriverPrice = z.infer<typeof insertFantasyDriverPriceSchema>

export type FantasyScoringEvent = typeof fantasyScoringEvents.$inferSelect
export type InsertFantasyScoringEvent = z.infer<typeof insertFantasyScoringEventSchema>

// Extended types for frontend
export type UserWithTeam = User & {
  team?: Team
}

export type RaceWithCircuit = Race & {
  circuit: Circuit
}

export type LiveRaceResultWithDriver = LiveRaceResult & {
  driver: Driver
}

export type FantasyLeagueWithCreator = FantasyLeague & {
  creator: User
}

export type FantasyTeamWithUser = FantasyTeam & {
  user: User
  drivers: (FantasyTeamDriver & { driver: Driver })[]
}

// Relations for new tables
export const racesRelations = relations(races, ({ one, many }) => ({
  circuit: one(circuits, {
    fields: [races.circuitId],
    references: [circuits.id],
  }),
  results: many(liveRaceResults),
}))

export const circuitsRelations = relations(circuits, ({ many }) => ({
  races: many(races),
}))

export const driversRelations = relations(drivers, ({ many }) => ({
  raceResults: many(liveRaceResults),
}))

export const liveRaceResultsRelations = relations(liveRaceResults, ({ one }) => ({
  race: one(races, {
    fields: [liveRaceResults.raceId],
    references: [races.id],
  }),
  driver: one(drivers, {
    fields: [liveRaceResults.driverId],
    references: [drivers.id],
  }),
}))

export const fantasyLeaguesRelations = relations(fantasyLeagues, ({ one, many }) => ({
  creator: one(users, {
    fields: [fantasyLeagues.creatorId],
    references: [users.id],
  }),
  teams: many(fantasyTeams),
}))

export const fantasyTeamsRelations = relations(fantasyTeams, ({ one, many }) => ({
  user: one(users, {
    fields: [fantasyTeams.userId],
    references: [users.id],
  }),
  league: one(fantasyLeagues, {
    fields: [fantasyTeams.leagueId],
    references: [fantasyLeagues.id],
  }),
  drivers: many(fantasyTeamDrivers),
}))

export const fantasyTeamDriversRelations = relations(fantasyTeamDrivers, ({ one }) => ({
  fantasyTeam: one(fantasyTeams, {
    fields: [fantasyTeamDrivers.fantasyTeamId],
    references: [fantasyTeams.id],
  }),
  driver: one(drivers, {
    fields: [fantasyTeamDrivers.driverId],
    references: [drivers.id],
  }),
}))

export const fantasyDriverPricesRelations = relations(fantasyDriverPrices, ({ one }) => ({
  driver: one(drivers, {
    fields: [fantasyDriverPrices.driverId],
    references: [drivers.id],
  }),
}))

export const fantasyScoringEventsRelations = relations(fantasyScoringEvents, ({ one }) => ({
  race: one(races, {
    fields: [fantasyScoringEvents.raceId],
    references: [races.id],
  }),
  driver: one(drivers, {
    fields: [fantasyScoringEvents.driverId],
    references: [drivers.id],
  }),
}))

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid("team_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("member"), // member, captain, engineer, principal, owner
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  permissions: text("permissions").array().default([]), // custom permissions array
})

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
})

export type TeamMember = typeof teamMembers.$inferSelect
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}))

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Post comments table  
export const postComments = pgTable("post_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").notNull(),
  userId: uuid("user_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id"), // for nested comments
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Comment likes table
export const commentLikes = pgTable("comment_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: uuid("comment_id").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Insert schemas
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
})

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({
  id: true,
  createdAt: true,
})

// Types
export type PostLike = typeof postLikes.$inferSelect
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>

export type PostComment = typeof postComments.$inferSelect  
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>

export type CommentLike = typeof commentLikes.$inferSelect
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>

// Extended types
export type PostCommentWithAuthor = PostComment & {
  author: User
  isLiked?: boolean
}

export type PostWithDetails = Post & {
  author: User
  team?: Team
  isLiked?: boolean
  userComments?: PostCommentWithAuthor[]
}

// Relations
export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}))

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  parentComment: one(postComments, {
    fields: [postComments.parentCommentId],
    references: [postComments.id],
  }),
  replies: many(postComments),
  likes: many(commentLikes),
}))

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(postComments, {
    fields: [commentLikes.commentId],
    references: [postComments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}))
