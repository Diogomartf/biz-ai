CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"size" integer NOT NULL,
	"processed_data" text NOT NULL
);
