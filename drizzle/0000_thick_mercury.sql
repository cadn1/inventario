CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"barcode" text,
	"location" text DEFAULT 'Alacena' NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'unid' NOT NULL,
	"min_stock" integer DEFAULT 1 NOT NULL,
	"expires_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
