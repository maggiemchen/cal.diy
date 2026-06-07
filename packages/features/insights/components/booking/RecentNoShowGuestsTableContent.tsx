"use client";

import dayjs from "@calcom/dayjs";
import { getUserAvatarUrl } from "@calcom/lib/getAvatarUrl";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { RouterOutputs } from "@calcom/trpc/react";
import { Avatar } from "@calcom/ui/components/avatar";
import { EmptyScreen } from "@calcom/ui/components/empty-screen";
import { Tooltip } from "@calcom/ui/components/tooltip";

type NoShowGuestsData = RouterOutputs["viewer"]["insights"]["recentNoShowGuests"];

export const RecentNoShowGuestsTableContent = ({ data }: { data: NoShowGuestsData }) => {
  const { t } = useLocale();

  return (
    <div className="overflow-hidden rounded-md">
      {data && data.length > 0 ? (
        data.map((item) => (
          <div
            key={`${item.bookingId}-${item.guestEmail}`}
            className="border-subtle flex items-center justify-between border-b px-4 py-3 last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="text-default text-sm font-medium">{item.guestName}</div>
                <div className="text-muted text-xs">({item.guestEmail})</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-default text-sm font-medium">{item.eventTitle}</div>
                <div className="text-muted text-xs">
                  {dayjs(item.startTime).format("MMM D, YYYY · h:mm A")}
                </div>
              </div>
              {item.host && (
                <Tooltip content={`Host: ${item.host.name}`}>
                  <Avatar
                    alt={item.host.name || ""}
                    size="sm"
                    imageSrc={getUserAvatarUrl({ avatarUrl: item.host.avatarUrl })}
                    title={item.host.name || ""}
                  />
                </Tooltip>
              )}
            </div>
          </div>
        ))
      ) : (
        <EmptyScreen
          Icon="user-x"
          headline={t("no_no_show_guests")}
          description={t("no_no_show_guests_description")}
        />
      )}
    </div>
  );
};
