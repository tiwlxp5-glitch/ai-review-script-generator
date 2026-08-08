import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST as generateScriptPOST } from "@/app/api/generate-script/route";
import { GET as userUsageGET } from "@/app/api/user-usage/route";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

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

describe("Adversarial API Resilience & Edge Error Handling Test Harness", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Helper to setup standard mock Supabase client
  function setupMockSupabase(user: any = { id: "user-123", email: "test@example.com" }) {
    (createServerClientMock as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockImplementation((token?: string) => {
          if (token === "invalid.token") {
            return Promise.resolve({ data: { user: null }, error: new Error("Invalid JWT") });
          }
          return Promise.resolve({ data: { user }, error: null });
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
            insert: () => ({
              select: () => ({
                single: vi.fn().mockResolvedValue({ data: { id: "hist-123" }, error: null }),
              }),
            }),
          };
        }
        return {};
      }),
    });
  }

  // =========================================================================
  // SECTION 1: /api/generate-script Payload Stress & Type Confusion
  // =========================================================================
  describe("/api/generate-script Unexpected & Malformed Payloads", () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = "mock-gemini-key";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
      setupMockSupabase();
    });

    it("1.1 Handles numeric product_name without throwing unhandled exception", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: 12345 }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
      expect(typeof json).toBe("object");
      expect(json).toHaveProperty("error");
    });

    it("1.2 Handles boolean product_name without throwing unhandled exception", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: true }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
    });

    it("1.3 Handles object product_name without throwing unhandled exception", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: { nested: "object" } }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
    });

    it("1.4 Handles array product_name without throwing unhandled exception", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: ["item1", "item2"] }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
    });

    it("1.5 Handles null product_name gracefully", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: null }),
      });

      const response = await generateScriptPOST(request);
      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json.error).toMatch(/กรอกชื่อสินค้า/i);
    });

    it("1.6 Handles numeric target_audience without throwing", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "Headphones", target_audience: 99999 }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
    });

    it("1.7 Handles numeric product_link_or_extra without throwing", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "Headphones", product_link_or_extra: 88888 }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
    });

    it("1.8 Handles malformed JSON payload (string literal)", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "NOT_VALID_JSON{{{",
      });

      const response = await generateScriptPOST(request);
      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json.error).toBe("Invalid JSON payload");
    });

    it("1.9 Handles empty JSON body ({})", async () => {
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      const response = await generateScriptPOST(request);
      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json.error).toMatch(/กรอกชื่อสินค้า/i);
    });

    it("1.10 Handles massive text payload (10KB)", async () => {
      const hugeName = "A".repeat(10000);
      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: hugeName }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
    }, 15000);
  });

  // =========================================================================
  // SECTION 2: /api/user-usage Resilience & Header Stress
  // =========================================================================
  describe("/api/user-usage Resilience & Header Stress", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
      setupMockSupabase();
    });

    it("2.1 GET request with malformed Bearer Token returns fallback 200 JSON", async () => {
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

    it("2.2 GET request when Supabase client throws unhandled error inside route returns fallback 200 JSON", async () => {
      (createServerClientMock as any).mockImplementation(() => {
        throw new Error("Fatal Supabase Driver Connection Crash");
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
      });
    });
  });

  // =========================================================================
  // SECTION 3: Missing Environment Variables Stress Test
  // =========================================================================
  describe("Missing Environment Variables Extreme Stress", () => {
    it("3.1 /api/generate-script when process.env is completely empty", async () => {
      process.env = {};

      (createServerClientMock as any).mockImplementation(() => {
        throw new Error("Server Configuration Error: Missing Supabase environment variables");
      });

      const request = new Request("http://localhost/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: "Phone" }),
      });

      const response = await generateScriptPOST(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);
      expect([400, 500]).toContain(response.status);

      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(typeof json.error).toBe("string");
    });

    it("3.2 /api/user-usage when process.env is completely empty", async () => {
      process.env = {};

      (createServerClientMock as any).mockImplementation(() => {
        throw new Error("Server Configuration Error: Missing Supabase environment variables");
      });

      const request = new Request("http://localhost/api/user-usage", {
        method: "GET",
      });

      const response = await userUsageGET(request);
      expect(response).toBeDefined();
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toBeDefined();
      // Returns fallback free tier or error object, guaranteed JSON
      if (json.error) {
        expect(typeof json.error).toBe("string");
      } else {
        expect(json).toMatchObject({
          user_type: "free",
          limit: 7,
        });
      }
    });

    it("3.3 Middleware when Supabase env vars are missing on /api/ routes returns 500 JSON", async () => {
      process.env = {};

      const req = new NextRequest("http://localhost/api/generate-script");
      const response = await middleware(req);

      expect(response).toBeDefined();
      expect(response.status).toBe(500);
      expect(response.headers.get("content-type")).toMatch(/application\/json/i);

      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(json.error).toMatch(/Missing Supabase environment variables/i);
    });
  });
});
