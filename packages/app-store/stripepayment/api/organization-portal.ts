import type { NextApiRequest, NextApiResponse } from "next";

import { checkAdminOrOwner } from "@calcom/features/auth/lib/checkAdminOrOwner";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import { prisma } from "@calcom/prisma";
import { teamMetadataSchema } from "@calcom/prisma/zod-utils";

import stripe from "../lib/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const organizationId = parseInt(req.query.organizationId as string);
  if (!organizationId || isNaN(organizationId)) {
    return res.status(400).json({ message: "Valid organization ID required" });
  }

  // Check if user has admin/owner access to the organization
  const membership = await prisma.membership.findFirst({
    where: {
      userId: req.session.user.id,
      teamId: organizationId,
    },
    include: {
      team: {
        select: {
          isOrganization: true,
          metadata: true,
        },
      },
    },
  });

  if (!membership || !membership.team.isOrganization || !checkAdminOrOwner(membership.role)) {
    return res.status(403).json({ message: "Not authorized to access organization billing" });
  }

  // Parse team metadata to get subscription information
  const metadata = teamMetadataSchema.parse(membership.team.metadata);

  if (!metadata?.subscriptionId) {
    return res.status(400).json({ message: "No subscription found for this organization" });
  }

  try {
    // Get the subscription from Stripe to find the customer ID
    const subscription = await stripe.subscriptions.retrieve(metadata.subscriptionId);

    if (!subscription.customer) {
      return res.status(400).json({ message: "No customer found for subscription" });
    }

    // Determine return URL
    let return_url = `${WEBAPP_URL}/settings/organizations/billing`;

    if (typeof req.query.returnTo === "string") {
      const safeRedirectUrl = getSafeRedirectUrl(req.query.returnTo);
      if (safeRedirectUrl) return_url = safeRedirectUrl;
    }

    // Create billing portal session for the organization's customer
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer as string,
      return_url,
    });

    res.redirect(302, stripeSession.url);
  } catch (error) {
    console.error("Error creating organization billing portal session:", error);
    return res.status(500).json({ message: "Failed to create billing portal session" });
  }
}
