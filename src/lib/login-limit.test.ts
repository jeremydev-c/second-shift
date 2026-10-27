import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
delete process.env.MONGODB_URI;
const { recentLoginFailures, recordLoginFailure, LOGIN_WINDOW_MS } = await import("./store");

describe("failed sign-in tracking", () => {
  it("counts failures per address and forgets them after the window", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) await recordLoginFailure("1.2.3.4");
    await recordLoginFailure("5.6.7.8");
    expect(await recentLoginFailures("1.2.3.4")).toBe(3);
    expect(await recentLoginFailures("5.6.7.8")).toBe(1);
    vi.advanceTimersByTime(LOGIN_WINDOW_MS + 1);
    expect(await recentLoginFailures("1.2.3.4")).toBe(0);
    vi.useRealTimers();
  });
});
