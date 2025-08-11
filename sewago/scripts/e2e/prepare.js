/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const beEnv = path.join(root, "backend", ".env");
const feEnv = path.join(root, "frontend", ".env.local");

function ensure(file, content) {
  if (fs.existsSync(file)) return;
  fs.writeFileSync(file, content, "utf8");
  console.log("Created", file);
}

ensure(
  beEnv,
  `# E2E defaults\nPORT=4000\nMONGODB_URI=mongodb://127.0.0.1:27017/sewago\nCLIENT_ORIGIN=http://localhost:3000\nSEED_KEY=dev-seed-key\n`
);
ensure(
  feEnv,
  `# E2E defaults\nPORT=3000\nNEXT_PUBLIC_API_URL=http://localhost:4000/api\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n`
);

console.log("Env prepared");


