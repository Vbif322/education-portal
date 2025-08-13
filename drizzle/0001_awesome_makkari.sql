ALTER TABLE "users" RENAME COLUMN "sessionID" TO "session_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_sessionID_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_session_id_unique" UNIQUE("session_id");