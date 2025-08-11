/* eslint-disable no-console */
import { spawn } from "child_process";
import waitOn from "wait-on";
import path from "path";

const root = process.cwd();

function run(cmd, args, opts) {
  return spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
}

async function main() {
  const apiPort = process.env.E2E_BACKEND_PORT || process.env.API_PORT || "4100";
  const webPort = process.env.E2E_FRONTEND_PORT || process.env.WEB_PORT || "3001";
  const clientOrigin = `http://localhost:${webPort}`;
  const apiUrl = `http://localhost:${apiPort}/api`;

  // Start backend and frontend
  const be = run("npm", ["run", "dev:test"], {
    env: { ...process.env, PORT: apiPort, CLIENT_ORIGIN: clientOrigin, NODE_ENV: 'test' },
    cwd: path.join(root, 'backend'),
  });
  const fe = run("npm", ["run", "dev"], {
    env: { ...process.env, PORT: webPort, NEXT_PUBLIC_API_URL: apiUrl, NEXT_PUBLIC_SITE_URL: clientOrigin },
    cwd: path.join(root, 'frontend'),
  });

  try {
    await waitOn({ resources: [`http-get://localhost:${apiPort}/api/health`, `http-get://localhost:${webPort}`], timeout: 120000 });
  } catch (e) {
    console.error("Services failed to start in time", e);
    be.kill();
    fe.kill();
    process.exit(1);
  }

  // Seed
  await fetch(`${apiUrl}/admin/seed`, { method: "POST", headers: { "X-Seed-Key": process.env.SEED_KEY || "dev-seed-key" } });

  // Run backend smoke first
  const smoke = run("npm", ["--prefix", "backend", "run", "test"], {});
  await new Promise((res, rej) => smoke.on("exit", (code) => (code === 0 ? res(null) : rej(new Error("smoke failed")))));

  // Run Playwright
  const pw = run("npx", ["playwright", "test", "-c", path.join("scripts", "e2e", "pw.config.ts")], { env: { ...process.env, E2E_FRONTEND_PORT: webPort, E2E_BACKEND_PORT: apiPort } });
  const code = await new Promise((res) => pw.on("exit", res));

  be.kill();
  fe.kill();

  process.exit(typeof code === "number" ? code : 1);
}

main();


