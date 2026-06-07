"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";

import { CtaRow } from "~/settings/billing/billing-view";
import BillingCredits from "~/settings/billing/components/BillingCredits";

declare global {
  interface Window {
    Plain?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      init: (config: any) => void;
      open: () => void;
    };
  }
}

const OrganizationBillingView = () => {
  const pathname = usePathname();
  const { t } = useLocale();
  const { data: session } = useSession();
  const returnTo = pathname;

  // Get organization ID from session
  const organizationId = session?.user?.org?.id;

  // Create organization-specific billing portal URL
  const billingHref = organizationId
    ? `/api/integrations/stripepayment/organizationPortal?organizationId=${organizationId}&returnTo=${WEBAPP_URL}${returnTo}`
    : `/api/integrations/stripepayment/portal?returnTo=${WEBAPP_URL}${returnTo}`;

  const onContactSupportClick = async () => {
    if (window.Plain) {
      window.Plain.open();
    }
  };

  return (
    <>
      <div className="border-subtle space-y-6 rounded-b-lg border border-t-0 px-6 py-8 text-sm sm:space-y-8">
        <CtaRow title={t("view_and_manage_billing_details")} description={t("view_and_edit_billing_details")}>
          <Button color="primary" href={billingHref} target="_blank" EndIcon="external-link">
            {t("billing_portal")}
          </Button>
        </CtaRow>
      </div>
      <BillingCredits />
      <div className="border-subtle mt-6 space-y-6 rounded-lg border px-6 py-8 text-sm sm:space-y-8">
        <CtaRow title={t("need_anything_else")} description={t("further_billing_help")}>
          <Button color="secondary" onClick={onContactSupportClick}>
            {t("contact_support")}
          </Button>
        </CtaRow>
      </div>
    </>
  );
};

export default OrganizationBillingView;
