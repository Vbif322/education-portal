CREATE TABLE "prod"."auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" varchar(32) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"requested_ip" varchar(64),
	CONSTRAINT "auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "prod"."auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "prod"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_tokens_user_purpose" ON "prod"."auth_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "idx_auth_tokens_expires" ON "prod"."auth_tokens" USING btree ("expires_at");