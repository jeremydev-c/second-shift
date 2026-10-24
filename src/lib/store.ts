import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Pledge, Status } from "./types";

// Local JSON file store for development. A Supabase store with the same shape replaces it in production.
const FILE = path.join(process.cwd(), ".data", "pledges.json");

async function readAll(): Promise<Pledge[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

// Serialise writes so two submissions in the same instant can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

async function writeAll(pledges: Pledge[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(pledges, null, 2));
  await fs.rename(tmp, FILE);
}

export function newId() {
  // Unguessable, because the pledge link doubles as the business's private status page.
  return randomBytes(9).toString("base64url");
}

export async function listPledges(): Promise<Pledge[]> {
  return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPledge(id: string): Promise<Pledge | undefined> {
  return (await readAll()).find((p) => p.id === id);
}

export function createPledge(pledge: Pledge): Promise<Pledge> {
  return withLock(async () => {
    const all = await readAll();
    all.push(pledge);
    await writeAll(all);
    return pledge;
  });
}

export function updatePledge(id: string, patch: Partial<Pick<Pledge, "serials" | "wipeMethod" | "wipedBy">> & { status?: Status }) {
  return withLock(async () => {
    const all = await readAll();
    const p = all.find((x) => x.id === id);
    if (!p) throw new Error("Pledge not found");
    if (patch.status && patch.status !== p.status) {
      p.status = patch.status;
      p.history.push({ status: patch.status, at: new Date().toISOString() });
    }
    if (patch.serials) p.serials = patch.serials;
    if (patch.wipeMethod !== undefined) p.wipeMethod = patch.wipeMethod;
    if (patch.wipedBy !== undefined) p.wipedBy = patch.wipedBy;
    await writeAll(all);
    return p;
  });
}

export async function takenSlots(): Promise<Record<string, number>> {
  const taken: Record<string, number> = {};
  for (const p of await readAll()) {
    if (p.handover.type === "dropoff") taken[p.handover.slot] = (taken[p.handover.slot] ?? 0) + 1;
  }
  return taken;
}
