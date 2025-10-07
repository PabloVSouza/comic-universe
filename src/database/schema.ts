import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { v4 as uuidv4 } from 'uuid'

export const plugins = sqliteTable('Plugin', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  enabled: integer('enabled', { mode: 'boolean' }).default(true).notNull(),
  name: text('name').notNull(),
  repository: text('repository').notNull(),
  version: text('version').notNull(),
  path: text('path').notNull()
})

export const users = sqliteTable('User', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  default: integer('default', { mode: 'boolean' }).default(false).notNull(),
  settings: text('settings', { mode: 'json' }).$type<Record<string, any>>().default({}),
  websiteAuthToken: text('websiteAuthToken'),
  websiteAuthExpiresAt: text('websiteAuthExpiresAt'),
  websiteAuthDeviceName: text('websiteAuthDeviceName'),
  websiteUserId: text('websiteUserId')
})

export const comics = sqliteTable('Comic', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  siteId: text('siteId').notNull(),
  name: text('name').notNull(),
  cover: text('cover').notNull(),
  repo: text('repo').notNull(),
  author: text('author'),
  artist: text('artist'),
  publisher: text('publisher'),
  status: text('status'),
  genres: text('genres'),
  siteLink: text('siteLink'),
  year: text('year'),
  synopsis: text('synopsis').notNull(),
  type: text('type').notNull(),
  settings: text('settings', { mode: 'json' }).$type<Record<string, any>>().default({})
})

export const chapters = sqliteTable('Chapter', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  comicId: text('comicId')
    .notNull()
    .references(() => comics.id),
  siteId: text('siteId').notNull(),
  siteLink: text('siteLink'),
  releaseId: text('releaseId'),
  repo: text('repo').notNull(),
  name: text('name'),
  number: text('number').notNull(),
  pages: text('pages'),
  date: text('date'),
  offline: integer('offline', { mode: 'boolean' }).default(false).notNull(),
  language: text('language')
})

export const readProgress = sqliteTable('ReadProgress', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  chapterId: text('chapterId')
    .notNull()
    .references(() => chapters.id),
  comicId: text('comicId')
    .notNull()
    .references(() => comics.id),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  totalPages: integer('totalPages').notNull(),
  page: integer('page').notNull(),
  updatedAt: text('updatedAt').$defaultFn(() => new Date().toISOString())
})

export const changelog = sqliteTable('Changelog', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  entityType: text('entityType').notNull(),
  entityId: text('entityId').notNull(),
  action: text('action').notNull(),
  data: text('data'),
  createdAt: text('createdAt').$defaultFn(() => new Date().toISOString()),
  synced: integer('synced', { mode: 'boolean' }).default(false)
})

export const pluginsRelations = relations(plugins, () => ({}))

export const usersRelations = relations(users, ({ many }) => ({
  readProgress: many(readProgress),
  comics: many(comics)
}))

export const comicsRelations = relations(comics, ({ one, many }) => ({
  user: one(users, {
    fields: [comics.userId],
    references: [users.id]
  }),
  chapters: many(chapters),
  readProgress: many(readProgress)
}))

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  comic: one(comics, {
    fields: [chapters.comicId],
    references: [comics.id]
  }),
  readProgress: many(readProgress)
}))

export const readProgressRelations = relations(readProgress, ({ one }) => ({
  chapter: one(chapters, {
    fields: [readProgress.chapterId],
    references: [chapters.id]
  }),
  user: one(users, {
    fields: [readProgress.userId],
    references: [users.id]
  }),
  comic: one(comics, {
    fields: [readProgress.comicId],
    references: [comics.id]
  })
}))

export type Plugin = typeof plugins.$inferSelect
export type NewPlugin = typeof plugins.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Comic = typeof comics.$inferSelect
export type NewComic = typeof comics.$inferInsert

export type Chapter = typeof chapters.$inferSelect
export type NewChapter = typeof chapters.$inferInsert

export type ReadProgress = typeof readProgress.$inferSelect
export type NewReadProgress = typeof readProgress.$inferInsert
