import { describe, it, expect } from "vitest";
import { getUserRole } from "@/lib/roles";

function makeUser(meta: { appRole?: string; userRole?: string }) {
  return {
    id: "user-1",
    app_metadata: meta.appRole ? { role: meta.appRole } : {},
    user_metadata: meta.userRole ? { role: meta.userRole } : {},
  } as any;
}

describe("getUserRole", () => {
  it("defaults to user when no user", () => {
    expect(getUserRole(null)).toBe("user");
  });

  it("prefers app_metadata.role when admin", () => {
    const u = makeUser({ appRole: "admin" });
    expect(getUserRole(u)).toBe("admin");
  });

  it("falls back to user_metadata.role when admin", () => {
    const u = makeUser({ userRole: "admin" });
    expect(getUserRole(u)).toBe("admin");
  });

  it("returns user otherwise", () => {
    const u = makeUser({});
    expect(getUserRole(u)).toBe("user");
  });
});


