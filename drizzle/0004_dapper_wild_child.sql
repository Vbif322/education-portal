ALTER TABLE "prod"."auth_tokens" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prod"."auth_tokens" ADD COLUMN "email" varchar(255);--> statement-breakpoint
CREATE INDEX "idx_auth_tokens_email_purpose" ON "prod"."auth_tokens" USING btree ("email","purpose");--> statement-breakpoint
ALTER TABLE "prod"."auth_tokens" ADD CONSTRAINT "auth_tokens_subject" CHECK (("prod"."auth_tokens"."purpose" = 'signup' AND "prod"."auth_tokens"."user_id" IS NULL AND "prod"."auth_tokens"."email" IS NOT NULL)
          OR ("prod"."auth_tokens"."purpose" <> 'signup' AND "prod"."auth_tokens"."user_id" IS NOT NULL));