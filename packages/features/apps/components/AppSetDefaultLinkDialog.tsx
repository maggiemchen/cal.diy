import { zodResolver } from "@hookform/resolvers/zod";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { EventLocationType } from "@calcom/app-store/locations";
import { getEventLocationType } from "@calcom/app-store/locations";
import { Dialog } from "@calcom/features/components/controlled-dialog";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { DialogContent, DialogFooter, DialogClose } from "@calcom/ui/components/dialog";
import { Form } from "@calcom/ui/components/form";
import { TextField } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";

export type UpdateUsersDefaultConferencingAppParams = {
  appSlug: string;
  appLink?: string;
  customLabel?: string;
  onSuccessCallback: () => void;
  onErrorCallback: () => void;
};

type LocationTypeSetLinkDialogFormProps = {
  link?: string;
  customLabel?: string;
  type: EventLocationType["type"];
};

export function AppSetDefaultLinkDialog({
  locationType,
  setLocationType,
  onSuccess,
  handleUpdateUserDefaultConferencingApp,
  defaultConferencingApp,
}: {
  locationType: EventLocationType & { slug: string };
  setLocationType: Dispatch<SetStateAction<(EventLocationType & { slug: string }) | undefined>>;
  onSuccess: () => void;
  handleUpdateUserDefaultConferencingApp: (params: UpdateUsersDefaultConferencingAppParams) => void;
  defaultConferencingApp?: { appSlug?: string; appLink?: string; customLabel?: string };
}) {
  const { t } = useLocale();
  const eventLocationTypeOptions = getEventLocationType(locationType.type);

  const isStaticLinkType = eventLocationTypeOptions?.linkType === "static";
  const currentCustomLabel = locationType.slug === defaultConferencingApp?.appSlug ? defaultConferencingApp?.customLabel : "";
  const currentLink = locationType.slug === defaultConferencingApp?.appSlug ? defaultConferencingApp?.appLink : "";
  
  const form = useForm<LocationTypeSetLinkDialogFormProps>({
    resolver: zodResolver(
      z.object({ 
        link: isStaticLinkType ? z.string().regex(new RegExp(eventLocationTypeOptions?.urlRegExp ?? "")) : z.string().optional(),
        customLabel: z.string().optional()
      })
    ),
    defaultValues: {
      link: currentLink,
      customLabel: currentCustomLabel,
    },
  });

  return (
    <Dialog open={!!locationType} onOpenChange={() => setLocationType(undefined)}>
      <DialogContent
        title={t("set_default_video_app")}
        description={t("set_default_video_app_description")}
        type="creation"
        Icon="video">
        <Form
          form={form}
          handleSubmit={(values) => {
            handleUpdateUserDefaultConferencingApp({
              appSlug: locationType.slug,
              appLink: values.link,
              customLabel: values.customLabel,
              onSuccessCallback: () => {
                onSuccess();
              },
              onErrorCallback: () => {
                showToast(`Invalid App Link Format`, "error");
              },
            });
            setLocationType(undefined);
          }}>
          <>
            {isStaticLinkType && (
              <TextField
                type="text"
                required
                {...form.register("link")}
                placeholder={locationType.organizerInputPlaceholder ?? ""}
                label={locationType.label ?? ""}
              />
            )}
            <TextField
              type="text"
              {...form.register("customLabel")}
              placeholder={t("custom_video_app_label_placeholder")}
              label={t("custom_video_app_label")}
            />

            <DialogFooter showDivider className="mt-8">
              <DialogClose />
              <Button color="primary" type="submit">
                {t("save")}
              </Button>
            </DialogFooter>
          </>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
