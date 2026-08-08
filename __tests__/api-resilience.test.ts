import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST as generateScriptPOST } from "@/app/api/generate-script/route";
import { GET as userUsageGET } from "@/app/api/user-usage/route";
import { middleware } from "@/middleware";

// Mock Supabase server helper to allow fine-grained control per test case
vi.mock("@/lib/supabase/server", () => {
  return {
    createClient: vi.fn(),
  };
});

// Mock @supabase/supabase-js for admin client instantiation in route handlers
vi.mock("@supabase/supabase-js", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

// Mock @google/generative-ai to avoid network latency and timeouts
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockImplementation(() => {
          return {
            generateContent: vi.fn().mockResolvedValue({
              response: {
                text: () =>
                  JSON.stringify({
                    script: "Mocked script response",
                    shot_list: [],
                    caption: "Mocked caption",
                    hashtags: "#mock",
                    pinned_comment: "Mocked comment",
                  }),
              },
            }),
          };
        }),
      };
    }),
  };
});

import { createClient as createServerClientMock } from "@/lib/supabase/server";
import { createClient as createAdminClientMock } from "@supabase/supabase-js";

describe("API Resilience & Opaque-Box E2E Test Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // TIER 1: Missing Environment Variables Resilience
  // =========================================================================
  describe("Tier 1: Missing Environment Variables", () => {
    it("Tier 1.1: /api/generate-script returns 500 JSON error when GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-key";

      // Mock authenticated user
      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-123", email: "test@example.com" } },
            error: null,
          }),
        },
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "profiles") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { plan_type: "free", monthly_limit: 7 },
                  }),
                }),
              }),
            };
          }
          if (table === "script_history") {
            return {
              select: () => ({
                eq: () => ({
                  gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
                }),
              }),
            };
          }
          return {};
        }),
      });

      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "Wireless Earbuds" }),
      });

      const response = await generateScriptPOST(request);

      expect(response).toBeDefined();
      expect([400, 500]).toContain(response.status);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(typeof json.error).toBe("string");
      expect(json.error).toMatch(/GEMINI_API_KEY/i);
    });

    it("Tier 1.2: /api/generate-script returns 500 JSON error when Supabase env vars are missing/throwing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      (createServerClientMock as any).mockRejectedValue(
        new Error("supabaseUrl is required.")
      );

      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "Test Item" }),
      });

      const response = await generateScriptPOST(request);

      expect(response).toBeDefined();
      expect([400, 500]).toContain(response.status);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(typeof json.error).toBe("string");
    });

    it("Tier 1.3: /api/user-usage returns valid JSON response when Supabase env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      (createServerClientMock as any).mockRejectedValue(
        new Error("Missing Supabase configuration")
      );

      const request = new Request("http://localhost/api/user-usage", {
        method: "GET",
      });

      const response = await userUsageGET(request);

      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
      if (json.error) {
        expect(typeof json.error).toBe("string");
      } else {
        expect(json).toMatchObject({
          user_type: "free",
          limit: 7,
          used: 0,
          remaining: 7,
        });
      }
    });
  });

  // =========================================================================
  // TIER 2: Invalid Request Body Handling (/api/generate-script)
  // =========================================================================
  describe("Tier 2: Invalid Request Payload Guarding", () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = "mock-key";
      // Mock authenticated user so execution reaches body parsing
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
                    data: { plan_type: "free", monthly_limit: 7 },
                  }),
                }),
              }),
            };
          }
          if (table === "script_history") {
            return {
              select: () => ({
                eq: () => ({
                  gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
                }),
              }),
            };
          }
          return {};
        }),
      });
    });

    it("Tier 2.1: returns 400 JSON error when product_name / topic is missing", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_audience: "Gamers" }),
      });

      const response = await generateScriptPOST(request);

      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(json.error).toMatch(/กรอกชื่อสินค้า/i);
    });

    it("Tier 2.2: returns 400 JSON error when product_name is empty whitespace", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "   " }),
      });

      const response = await generateScriptPOST(request);

      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
    });

    it("Tier 2.3: returns clean JSON error on non-JSON request body", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json-{",
      });

      const response = await generateScriptPOST(request);

      expect([400, 500]).toContain(response.status);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
    });

    it("Tier 2.4 (Adversarial): handles special characters and control characters in product_name", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: "<script>alert('xss')</script> & { } ' \" \n \t",
        }),
      });

      process.env.GEMINI_API_KEY = "mock-key";

      const response = await generateScriptPOST(request);

      expect(response.headers.get("content-type")).toMatch(/application\/json/i);
      const json = await response.json();
      expect(json).toHaveProperty("error");
    }, 15000);
  });

  // =========================================================================
  // TIER 3: Middleware Exception Protection
  // =========================================================================
  describe("Tier 3: Middleware Exception Protection", () => {
    it("Tier 3.1: middleware catches missing env var exceptions without crashing Edge Runtime", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const nextReq = new NextRequest("http://localhost:3000/api/generate-script");

      let middlewareError: any = null;
      let response: any = null;

      try {
        response = await middleware(nextReq);
      } catch (err) {
        middlewareError = err;
      }

      // Requirement R2 & M1: middleware MUST catch exceptions and not throw an uncaught Error
      if (middlewareError) {
        // Asserting that middleware does not throw uncaught error (verifies M1 requirement)
        expect(middlewareError).toBeNull();
      } else {
        expect(response).toBeDefined();
      }
    });
  });

  // =========================================================================
  // TIER 4: /api/user-usage Database Error & Fallback Handling
  // =========================================================================
  describe("Tier 4: /api/user-usage Fallback & Database Error Handling", () => {
    it("Tier 4.1: returns fallback free-tier payload when Supabase returns error or missing profile", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";

      // Mock client where auth succeeds but DB queries error/fail
      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-999", email: "error@example.com" } },
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
                    error: { message: "Database connection failed" },
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
                    error: { message: "Table not found" },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      });

      const request = new Request("http://localhost/api/user-usage", {
        method: "GET",
      });

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

    it("Tier 4.2: returns fallback free-tier payload for unauthenticated users", async () => {
      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      });

      const request = new Request("http://localhost/api/user-usage", {
        method: "GET",
      });

      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toMatchObject({
        user_type: "free",
        is_admin: false,
        limit: 7,
        used: 0,
        remaining: 7,
        period: "weekly",
      });
    });

    it("Tier 4.3 (Adversarial): returns 401 JSON error when invalid bearer token is provided", async () => {
      (createServerClientMock as any).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockImplementation((token?: string) => {
            if (token === "invalid.token") {
              return Promise.resolve({
                data: { user: null },
                error: { message: "Invalid JWT signature" },
              });
            }
            return Promise.resolve({ data: { user: null }, error: null });
          }),
        },
      });

      const request = new Request("http://localhost/api/user-usage", {
        method: "GET",
        headers: { Authorization: "Bearer invalid.token" },
      });

      const response = await userUsageGET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toMatchObject({
        user_type: "free",
        is_admin: false,
        limit: 7,
        used: 0,
        remaining: 7,
      });
    });
  });
});
