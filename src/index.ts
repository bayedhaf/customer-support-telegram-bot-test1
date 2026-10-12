import http from "node:http";
import { webhookCallback } from "grammy";
import { run } from "@grammyjs/runner";
import { bot } from "./bot.js";
import { config } from "./config.js";

async function setupCommands() {
  await bot.api.setMyCommands([
    { command: "start", description: "Open the main menu" },
    { command: "help", description: "Help" },
  ]);
  await bot.api.setMyCommands(
    [{ command: "stats", description: "Support statistics" }, { command: "close", description: "Close ticket (reply to it)" }],
    { scope: { type: "chat", chat_id: config.STAFF_CHAT_ID } },
  ).catch((e) => console.warn("Could not set staff commands (is the bot in the staff group?)", e.message));
}

await bot.init();
await setupCommands();
console.log(`Bot @${bot.botInfo.username} starting…`);

if (config.WEBHOOK_URL) {
  // Production: webhook
  await bot.api.setWebhook(config.WEBHOOK_URL, { secret_token: config.WEBHOOK_SECRET });
  const handle = webhookCallback(bot, "http", { secretToken: config.WEBHOOK_SECRET });
  const server = http.createServer((req, res) => {
    if (req.url === "/health") return void res.writeHead(200).end("ok");
    if (req.url === "/webhook" && req.method === "POST") return void handle(req, res);
    res.writeHead(404).end();
  });
  server.listen(config.PORT, () => console.log(`Webhook server on :${config.PORT}`));
  process.once("SIGTERM", () => server.close());
  process.once("SIGINT", () => server.close());
} else {
  // Development: long polling
  await bot.api.deleteWebhook();
  const runner = run(bot);
  const stop = () => runner.isRunning() && runner.stop();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  console.log("Long polling started. Press Ctrl+C to stop.");
}
