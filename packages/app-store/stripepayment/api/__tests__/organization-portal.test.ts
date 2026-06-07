import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";

import { checkAdminOrOwner } from "@calcom/features/auth/lib/checkAdminOrOwner";
import { prisma } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { teamMetadataSchema } from "@calcom/prisma/zod-utils";

import stripe from "../lib/server";
import handler from "../organization-portal";

// Mock dependencies
jest.mock("@calcom/features/auth/lib/checkAdminOrOwner");
jest.mock("@calcom/prisma");
jest.mock("@calcom/prisma/zod-utils");
jest.mock("../lib/server");

const mockCheckAdminOrOwner = checkAdminOrOwner as jest.MockedFunction<typeof checkAdminOrOwner>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockTeamMetadataSchema = teamMetadataSchema as jest.Mocked<typeof teamMetadataSchema>;
const mockStripe = stripe as jest.Mocked<typeof stripe>;

describe("/api/integrations/stripepayment/organization-portal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = undefined;

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Not authenticated",
    });
  });

  it("should return 400 if organization ID is not provided", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    req.session = { user: { id: 1 } };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Valid organization ID required",
    });
  });

  it("should return 403 if user is not an admin or owner of the organization", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = { user: { id: 1 } };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.MEMBER,
      team: {
        isOrganization: true,
        metadata: {},
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(false);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Not authorized to access organization billing",
    });
  });

  it("should return 400 if organization has no subscription", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = { user: { id: 1 } };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.OWNER,
      team: {
        isOrganization: true,
        metadata: {},
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(true);
    mockTeamMetadataSchema.parse.mockReturnValue({});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: "No subscription found for this organization",
    });
  });

  it("should successfully create billing portal session for organization owner", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = { user: { id: 1 } };

    const mockSubscription = {
      customer: "cus_test123",
    };

    const mockPortalSession = {
      url: "https://billing.stripe.com/session/test",
    };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.OWNER,
      team: {
        isOrganization: true,
        metadata: { subscriptionId: "sub_test123" },
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(true);
    mockTeamMetadataSchema.parse.mockReturnValue({
      subscriptionId: "sub_test123",
    });

    mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription as any);
    mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession as any);

    await handler(req, res);

    expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_test123");
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_test123",
      return_url: "http://localhost:3000/settings/organizations/billing",
    });

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe("https://billing.stripe.com/session/test");
  });

  it("should successfully create billing portal session for organization admin", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = { user: { id: 1 } };

    const mockSubscription = {
      customer: "cus_test123",
    };

    const mockPortalSession = {
      url: "https://billing.stripe.com/session/test",
    };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.ADMIN,
      team: {
        isOrganization: true,
        metadata: { subscriptionId: "sub_test123" },
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(true);
    mockTeamMetadataSchema.parse.mockReturnValue({
      subscriptionId: "sub_test123",
    });

    mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription as any);
    mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession as any);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(302);
    expect(res._getRedirectUrl()).toBe("https://billing.stripe.com/session/test");
  });

  it("should handle custom return URL", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        organizationId: "1",
        returnTo: "http://localhost:3000/settings/organizations/custom",
      },
    });

    req.session = { user: { id: 1 } };

    const mockSubscription = {
      customer: "cus_test123",
    };

    const mockPortalSession = {
      url: "https://billing.stripe.com/session/test",
    };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.OWNER,
      team: {
        isOrganization: true,
        metadata: { subscriptionId: "sub_test123" },
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(true);
    mockTeamMetadataSchema.parse.mockReturnValue({
      subscriptionId: "sub_test123",
    });

    mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription as any);
    mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession as any);

    await handler(req, res);

    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: "cus_test123",
      return_url: "http://localhost:3000/settings/organizations/custom",
    });
  });

  it("should return 500 if Stripe API fails", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { organizationId: "1" },
    });

    req.session = { user: { id: 1 } };

    mockPrisma.membership.findFirst.mockResolvedValue({
      role: MembershipRole.OWNER,
      team: {
        isOrganization: true,
        metadata: { subscriptionId: "sub_test123" },
      },
    } as any);

    mockCheckAdminOrOwner.mockReturnValue(true);
    mockTeamMetadataSchema.parse.mockReturnValue({
      subscriptionId: "sub_test123",
    });

    mockStripe.subscriptions.retrieve.mockRejectedValue(new Error("Stripe API error"));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Failed to create billing portal session",
    });
  });
});
