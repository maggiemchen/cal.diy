import { createColumnHelper, useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { useMemo } from "react";

import { ColumnFilterType } from "@calcom/features/data-table";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { BookingStatus } from "@calcom/prisma/enums";

import { useInsightsBookingFacetedUniqueValues } from "./useInsightsBookingFacetedUniqueValues";
import { useInsightsOrgTeams } from "./useInsightsOrgTeams";

type DummyTableRow = {
  userId: number | null;
  eventTypeId: number | null;
  status: BookingStatus;
  paid: boolean;
  attendeeName: string | null;
  attendeeEmail: string | null;
};

const emptyData: DummyTableRow[] = [];

export const useInsightsBookings = () => {
  const { t } = useLocale();
  const { isAll, teamId, userId } = useInsightsOrgTeams();

  const getInsightsFacetedUniqueValues = useInsightsBookingFacetedUniqueValues({
    userId,
    teamId,
    isAll,
  });

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<DummyTableRow>();
    return [
      columnHelper.accessor("eventTypeId", {
        id: "eventTypeId",
        header: t("event_type"),
        size: 200,
        meta: {
          filter: {
            type: ColumnFilterType.MULTI_SELECT,
          },
        },
        enableColumnFilter: true,
        enableSorting: false,
        cell: () => null,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: t("booking_status"),
        size: 200,
        meta: {
          filter: {
            type: ColumnFilterType.MULTI_SELECT,
          },
        },
        enableColumnFilter: true,
        enableSorting: false,
        cell: () => null,
      }),
      columnHelper.accessor("userId", {
        id: "userId",
        header: t("member"),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          filter: {
            type: ColumnFilterType.SINGLE_SELECT,
          },
        },
        cell: () => null,
      }),
      columnHelper.accessor("paid", {
        id: "paid",
        header: t("paid_event_type"),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          filter: {
            type: ColumnFilterType.MULTI_SELECT,
          },
        },
        cell: () => null,
      }),
      // Invisible attendee name filter
      columnHelper.accessor("attendeeName", {
        id: "attendeeName",
        header: t("attendee_name"),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          filter: {
            type: ColumnFilterType.TEXT,
          },
        },
        cell: () => null,
      }),
      // Invisible attendee email filter
      columnHelper.accessor("attendeeEmail", {
        id: "attendeeEmail",
        header: t("attendee_email_variable"),
        enableColumnFilter: true,
        enableSorting: false,
        meta: {
          filter: {
            type: ColumnFilterType.TEXT,
          },
        },
        cell: () => null,
      }),
    ];
  }, [t]);

  const table = useReactTable<DummyTableRow>({
    data: emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getInsightsFacetedUniqueValues,
  });

  return { table };
};
