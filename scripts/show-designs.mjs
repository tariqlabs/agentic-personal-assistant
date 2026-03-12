#!/usr/bin/env node
/**
 * Opens the design preview page in a headed browser for the user to pick a design.
 * Run: npm run dev (in another terminal) then npm run show-designs
 */
import { chromium } from "playwright";

const BASE = process.env.DESIGN_PREVIEW_URL || "http://localhost:5173";

async function main() {
  console.log("Launching browser... Ensure dev server is running: npm run dev");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/design-preview`, { waitUntil: "networkidle" });
  await page.pause(); // Keeps browser open for user to inspect
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
