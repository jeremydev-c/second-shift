export const BRANDS = ["Dell", "Lenovo", "HP", "Apple", "Microsoft", "Acer", "ASUS", "Other"] as const;
export type Brand = (typeof BRANDS)[number];

export const CONDITIONS = {
  works: "Works well",
  wear: "Works, some wear",
  damaged: "Damaged (screen, keys, battery)",
  dead: "Doesn't turn on",
} as const;
export type Condition = keyof typeof CONDITIONS;

export const CHARGERS = {
  all: "Every laptop",
  some: "Some laptops",
  none: "None",
} as const;
export type Chargers = keyof typeof CHARGERS;

export type Batch = {
  brand: Brand;
  model: string;
  year: number;
  quantity: number;
  condition: Condition;
  chargers: Chargers;
};

export type Verdict = "great" | "good" | "recycle";

export type Fit = {
  score: number;
  verdict: Verdict;
  reasons: string[];
  sellable: number;
  peopleConnected: number;
  ewasteKg: number;
  estValueCad: number;
};

export type Handover =
  | { type: "dropoff"; slot: string }
  | { type: "pickup"; preferredWeek: string; address: string };

export const STATUSES = ["pledged", "received", "wiped", "refurbished", "placed"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  pledged: "Pledged",
  received: "Received at FGT",
  wiped: "Data wiped",
  refurbished: "Refurbished",
  placed: "In new hands",
};

export type Pledge = {
  id: string;
  // Public id for the shareable impact page, so sharing it never reveals the private tracker link.
  shareId: string;
  listOnWall: boolean;
  createdAt: string;
  company: string;
  contactName: string;
  email: string;
  postalCode: string;
  batch: Batch;
  fit: Fit;
  handover: Handover;
  status: Status;
  history: { status: Status; at: string }[];
  serials: string[];
  wipeMethod?: WipeMethod;
  wipedBy?: string;
};

// Media sanitisation levels from NIST SP 800-88, the standard businesses usually ask for.
export const WIPE_METHODS = {
  clear: "NIST SP 800-88 Clear (full overwrite)",
  purge: "NIST SP 800-88 Purge (firmware secure erase)",
  destroy: "Physical destruction (drive shredded)",
} as const;
export type WipeMethod = keyof typeof WIPE_METHODS;
