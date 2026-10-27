import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { MongoClient, type Collection } from "mongodb";
import type { Pledge, Status } from "./types";

// Pledges live in MongoDB when MONGODB_URI is set (production), otherwise in a local JSON file.

export type PledgePatch = Partial<Pick<Pledge, "serials" | "wipeMethod" | "wipedBy">> & { status?: Status };

export function newId() {
  // Unguessable, because the pledge link doubles as the business's private status page.
  return randomBytes(9).toString("base64url");
}

/* ---------- MongoDB ---------- */

type PledgeDoc = Omit<Pledge, "id"> & { _id: string };

// Keep one client across hot reloads and serverless invocations.
const g = globalThis as unknown as { _ssMongo?: Promise<MongoClient> };

async function database() {
  g._ssMongo ??= new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 10_000 }).connect().catch((e) => {
    g._ssMongo = undefined; // allow a retry on the next request
    throw e;
  });
  return (await g._ssMongo).db(process.env.MONGODB_DB || "second_shift");
}

async function collection(): Promise<Collection<PledgeDoc>> {
  return (await database()).collection<PledgeDoc>("pledges");
}

const fromDoc = ({ _id, ...rest }: PledgeDoc): Pledge => ({ id: _id, ...rest });

const mongo = {
  async list() {
    return (await (await collection()).find().sort({ createdAt: -1 }).toArray()).map(fromDoc);
  },
  async get(id: string) {
    const d = await (await collection()).findOne({ _id: id });
    return d ? fromDoc(d) : undefined;
  },
  async byShare(shareId: string) {
    const d = await (await collection()).findOne({ shareId });
    return d ? fromDoc(d) : undefined;
  },
  async create(p: Pledge) {
    const { id, ...rest } = p;
    await (await collection()).insertOne({ _id: id, ...rest });
    return p;
  },
  async update(id: string, patch: PledgePatch) {
    const col = await collection();
    const existing = await col.findOne({ _id: id });
    if (!existing) throw new Error("Pledge not found");
    const { status, ...fields } = patch;
    const set: Record<string, unknown> = { ...fields };
    const update: Record<string, unknown> = { $set: set };
    // Matching on the current status means a double-clicked "next stop" only moves the batch once.
    const filter: Record<string, unknown> = { _id: id, status: existing.status };
    if (status && status !== existing.status) {
      set.status = status;
      update.$push = { history: { status, at: new Date().toISOString() } };
    }
    if (Object.keys(set).length === 0) return fromDoc(existing);
    const d = await col.findOneAndUpdate(filter, update, { returnDocument: "after" });
    if (!d) throw new Error("This batch was just updated by someone else. Refresh and try again.");
    return fromDoc(d);
  },
  async taken() {
    const rows = await (await collection())
      .aggregate<{ _id: string; n: number }>([
        { $match: { "handover.type": "dropoff" } },
        { $group: { _id: "$handover.slot", n: { $sum: 1 } } },
      ])
      .toArray();
    return Object.fromEntries(rows.map((r) => [r._id, r.n]));
  },
};

/* ---------- Local JSON file (development) ---------- */

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

const file = {
  async list() {
    return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async get(id: string) {
    return (await readAll()).find((p) => p.id === id);
  },
  async byShare(shareId: string) {
    return (await readAll()).find((p) => p.shareId === shareId);
  },
  create(pledge: Pledge) {
    return withLock(async () => {
      const all = await readAll();
      all.push(pledge);
      await writeAll(all);
      return pledge;
    });
  },
  update(id: string, patch: PledgePatch) {
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
  },
  async taken() {
    const taken: Record<string, number> = {};
    for (const p of await readAll()) {
      if (p.handover.type === "dropoff") taken[p.handover.slot] = (taken[p.handover.slot] ?? 0) + 1;
    }
    return taken;
  },
};

/* ---------- Public API ---------- */

const store = () => (process.env.MONGODB_URI ? mongo : file);

export const listPledges = (): Promise<Pledge[]> => store().list();
export const getPledge = (id: string): Promise<Pledge | undefined> => store().get(id);
export const getPledgeByShareId = (shareId: string): Promise<Pledge | undefined> => store().byShare(shareId);
export const createPledge = (p: Pledge): Promise<Pledge> => store().create(p);
export const updatePledge = (id: string, patch: PledgePatch): Promise<Pledge> => store().update(id, patch);
export const takenSlots = (): Promise<Record<string, number>> => store().taken();

/* ---------- Failed staff sign-ins ---------- */

// Kept in the database in production so every serverless instance sees the same count.
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const localFailures = new Map<string, number[]>();
let ttlReady = false;

async function failures() {
  const col = (await database()).collection<{ key: string; at: Date }>("login_failures");
  if (!ttlReady) {
    await col.createIndex({ at: 1 }, { expireAfterSeconds: LOGIN_WINDOW_MS / 1000 });
    ttlReady = true;
  }
  return col;
}

export async function recentLoginFailures(key: string): Promise<number> {
  const since = Date.now() - LOGIN_WINDOW_MS;
  if (!process.env.MONGODB_URI) return (localFailures.get(key) ?? []).filter((t) => t > since).length;
  return (await failures()).countDocuments({ key, at: { $gt: new Date(since) } });
}

export async function recordLoginFailure(key: string): Promise<void> {
  if (!process.env.MONGODB_URI) {
    localFailures.set(key, [...(localFailures.get(key) ?? []), Date.now()]);
    return;
  }
  await (await failures()).insertOne({ key, at: new Date() });
}
