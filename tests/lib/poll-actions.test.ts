import { describe, it, expect, vi, beforeEach } from "vitest";
import * as server from "@/lib/supabase/server";
import { createPoll, deletePoll, submitVote, updatePoll } from "@/lib/poll-actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path?: string) => {
    const err: any = new Error(`REDIRECT:${path || ""}`);
    err.isRedirect = true;
    throw err;
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function createMockFormData(entries: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) value.forEach((v) => fd.append(key, v));
    else fd.append(key, value);
  }
  return fd;
}

describe("poll-actions", () => {
  let getUser: any;
  let from: any;
  let supabase: any;

  beforeEach(() => {
    from = vi.fn();
    getUser = vi.fn();
    supabase = { auth: { getUser }, from } as any;
    vi.spyOn(server, "createSupabaseServerClient").mockResolvedValue(supabase);
  });

  describe("createPoll", () => {
    it("redirects when missing fields", async () => {
      const fd = createMockFormData({ question: "", options: ["A"] });
      await expect(createPoll(fd)).rejects.toMatchObject({ isRedirect: true });
    });

    it("creates and redirects on success", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      from.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) });
      const fd = createMockFormData({ question: "Q?", options: ["A", "B"] });
      await expect(createPoll(fd)).rejects.toMatchObject({ isRedirect: true });
      expect(from).toHaveBeenCalledWith("polls");
    });
  });

  describe("deletePoll", () => {
    it("no-op when no pollId", async () => {
      const fd = createMockFormData({});
      await deletePoll(fd);
      expect(from).not.toHaveBeenCalled();
    });

    it("deletes when authed", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      const del = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis() });
      from.mockReturnValue({ delete: del });
      const fd = createMockFormData({ pollId: "p1" });
      await deletePoll(fd);
      expect(from).toHaveBeenCalledWith("polls");
    });
  });

  describe("updatePoll", () => {
    it("redirects when missing fields", async () => {
      const fd = createMockFormData({ id: "p1", question: "", option1: "A", option2: "B" });
      await expect(updatePoll(fd)).rejects.toMatchObject({ isRedirect: true });
    });

    it("updates and redirects on success", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      from.mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis() }),
      });
      const fd = createMockFormData({ id: "p1", question: "Q", option1: "A", option2: "B" });
      await expect(updatePoll(fd)).rejects.toMatchObject({ isRedirect: true });
      expect(from).toHaveBeenCalledWith("polls");
    });
  });

  describe("submitVote", () => {
    it("redirects when invalid option", async () => {
      const fd = createMockFormData({ pollId: "p1", option: "3" });
      await expect(submitVote(fd)).rejects.toMatchObject({ isRedirect: true });
    });

    it("upserts vote and redirects", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
      from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({}) });
      const fd = createMockFormData({ pollId: "p1", option: "1" });
      await expect(submitVote(fd)).rejects.toMatchObject({ isRedirect: true });
      expect(from).toHaveBeenCalledWith("votes");
    });
  });
});



