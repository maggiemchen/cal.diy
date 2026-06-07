import { _generateMetadata } from "app/_utils";
import { getTranslate } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import OrganizationBillingView from "~/settings/billing/organization-billing-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("billing"),
    (t) => t("manage_billing_description"),
    undefined,
    undefined,
    "/settings/organizations/billing"
  );

const OrganizationBillingPage = async () => {
  const t = await getTranslate();

  return (
    <SettingsHeader
      title={t("billing")}
      description={t("manage_billing_description")}
      borderInShellHeader={true}>
      <OrganizationBillingView />
    </SettingsHeader>
  );
};

export default OrganizationBillingPage;
