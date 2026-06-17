import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DATABASE_URL = "file:./test.db";
const testDbPath = path.resolve("test.db");

export default function () {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  process.env.DATABASE_URL = DATABASE_URL;

  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL },
  });

  return () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  };
}
