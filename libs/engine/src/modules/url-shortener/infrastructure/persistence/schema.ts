import { pgTable, text } from "drizzle-orm/pg-core";

export const shortenedUrls = pgTable("shortened_urls", {
  code: text("code").primaryKey(),
  destination: text("destination").notNull(),
});
