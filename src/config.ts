import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  BOT_TOKEN: z.string().min(10, "BOT_TOKEN is required"),
  STAFF_CHAT_ID: z.coerce.number(),
  BUSINESS_NAME: z.string().default("web assistant"),
  DATABASE_PATH: z.string().default("support.db"),
  WEBHOOK_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  // Optional: custom Bot API server (local server, or the test simulation)
  TELEGRAM_API_ROOT: z.string().url().optional(),
});

export const config = schema.parse(process.env);
