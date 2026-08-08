import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { GET as userUsageGET } from "@/app/api/user-usage/route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

import { createClient as createServerClientMock } from "@/lib/supabase/server";
import { createClient as createAdminClientMock } from "@supabase/supabase-js";

describe("Gate 2 Challenger Verification - Supabase Fallback & Middleware Behavior", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("1. Middleware behavior under missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    it("returns 500 JSON with application/json header for /api/ routes when env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const req = new NextRequest("http://localhost:3000/api/user-usage");
      const res = await middleware(req);

      expect(res).toBeDefined();
      expect(res.status).toBe(500);
      expect(res.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await res.json();
      expect(json).toEqual({
        error: "Server Configuration Error: Missing Supabase environment variables",
      });
    });

    it("returns 500 JSON for /api/generate-script when env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const req = new NextRequest("http://localhost:3000/api/generate-script", { method: "POST" });
      const res = await middleware(req);

      expect(res.status).toBe(500);
      expect(res.headers.get("content-type")).toMatch(/application\/json/i);
      const json = await res.json();
      expect(json.error).toBe("Server Configuration Error: Missing Supabase environment variables");
    });

    it("handles non-API protected routes (/history) by redirecting to /login without throwing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const req = new NextRequest("http://localhost:3000/history");
      const res = await middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("handles non-API public routes (/) by returning next response without throwing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const req = new NextRequest("http://localhost:3000/");
      const res = await middleware(req);

      expect(res.status).toBe(200);
    });
  });

  describe("2. /api/user-usage fallback behavior and JSON response guaranteed", () => {
    it("case 2a: service role key omitted - uses userSupabase and succeeds", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123", email: "user@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { plan_type: "pro", monthly_limit: 200 },
                  }),
                }),
              }),
            };
          }
          if (table === "script_history") {
            return {
              select: () => ({
                eq: () => ({
                  gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
                }),
              }),
            };
          }
          return {};
        }),
      });

      const request = new Request("http://localhost/api/user-usage", { method: "GET" });
      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toEqual({
        user_type: "pro",
        is_admin: false,
        limit: 200,
        used: 5,
        remaining: 195,
        period: "monthly",
      });
      expect(createAdminClientMock).not.toHaveBeenCalled();
    });

    it("case 2b: service role key omitted - Supabase queries fail, returns fallback payload with application/json", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123", email: "user@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: "RLS error / Permission denied" },
                  }),
                }),
              }),
            };
          }
          if (table === "script_history") {
            return {
              select: () => ({
                eq: () => ({
                  gte: vi.fn().mockResolvedValue({
                    count: null,
                    error: { message: "Query timeout" },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      });

      const request = new Request("http://localhost/api/user-usage", { method: "GET" });
      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toEqual({
        user_type: "free",
        is_admin: false,
        limit: 7,
        used: 0,
        remaining: 7,
        period: "weekly",
      });
    });

    it("case 2c: createClient() throws exception - caught by top-level try-catch, returns free tier fallback payload", async () => {
      (createServerClientMock as any).mockRejectedValue(
        new Error("Server Configuration Error: Missing Supabase environment variables")
      );

      const request = new Request("http://localhost/api/user-usage", { method: "GET" });
      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toEqual({
        user_type: "free",
        is_admin: false,
        limit: 7,
        used: 0,
        remaining: 7,
        period: "weekly",
      });
    });

    it("case 2d: getUser() throws exception - handled gracefully", async () => {
      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockRejectedValue(new Error("JWT expired or invalid")),
        },
      });

      const request = new Request("http://localhost/api/user-usage", { method: "GET" });
      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toEqual({
        user_type: "free",
        is_admin: false,
        limit: 7,
        used: 0,
        remaining: 7,
        period: "weekly",
      });
    });
  });
});
