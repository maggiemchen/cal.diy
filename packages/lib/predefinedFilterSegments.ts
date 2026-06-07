import type { ColumnFilter } from "@calcom/features/data-table/lib/types";
import { ColumnFilterType } from "@calcom/features/data-table/lib/types";

export interface PredefinedFilterSegment {
  name: string;
  tableIdentifier: string;
  scope: "SYSTEM";
  category: string;
  description: string;
  displayOrder: number;
  isPredefined: boolean;
  activeFilters: ColumnFilter[];
  sorting?: any;
  columnVisibility?: any;
  columnSizing?: any;
  perPage: number;
  searchTerm?: string;
}

// Predefined segments for booking insights (/insights)
export const BOOKING_INSIGHTS_SEGMENTS: PredefinedFilterSegment[] = [
  {
    name: "Recent Bookings",
    tableIdentifier: "/insights",
    scope: "SYSTEM" as const,
    category: "Time-based",
    description: "Show bookings from the last 7 days",
    displayOrder: 1,
    isPredefined: true,
    activeFilters: [
      {
        id: "createdAt",
        type: ColumnFilterType.DATE_RANGE,
        value: {
          data: {
            preset: "w", // Last 7 days preset
          },
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Confirmed Bookings",
    tableIdentifier: "/insights",
    scope: "SYSTEM" as const,
    category: "Status-based",
    description: "Show only confirmed bookings",
    displayOrder: 2,
    isPredefined: true,
    activeFilters: [
      {
        id: "status",
        type: ColumnFilterType.SINGLE_SELECT,
        value: {
          data: "ACCEPTED",
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Cancelled Bookings",
    tableIdentifier: "/insights",
    scope: "SYSTEM" as const,
    category: "Status-based", 
    description: "Show only cancelled bookings",
    displayOrder: 3,
    isPredefined: true,
    activeFilters: [
      {
        id: "status",
        type: ColumnFilterType.SINGLE_SELECT,
        value: {
          data: "CANCELLED",
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Pending Bookings",
    tableIdentifier: "/insights",
    scope: "SYSTEM" as const,
    category: "Status-based",
    description: "Show bookings awaiting confirmation", 
    displayOrder: 4,
    isPredefined: true,
    activeFilters: [
      {
        id: "status",
        type: ColumnFilterType.SINGLE_SELECT,
        value: {
          data: "PENDING",
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "This Month",
    tableIdentifier: "/insights",
    scope: "SYSTEM" as const,
    category: "Time-based",
    description: "Show bookings from the current month",
    displayOrder: 5,
    isPredefined: true,
    activeFilters: [
      {
        id: "createdAt", 
        type: ColumnFilterType.DATE_RANGE,
        value: {
          data: {
            preset: "m", // Month-to-date preset
          },
        },
      },
    ],
    perPage: 20,
  },
];

// Predefined segments for routing insights (/insights/routing)
export const ROUTING_INSIGHTS_SEGMENTS: PredefinedFilterSegment[] = [
  {
    name: "Recent Submissions",
    tableIdentifier: "/insights/routing",
    scope: "SYSTEM" as const,
    category: "Time-based",
    description: "Show routing form submissions from the last 7 days",
    displayOrder: 1,
    isPredefined: true,
    activeFilters: [
      {
        id: "createdAt",
        type: ColumnFilterType.DATE_RANGE,
        value: {
          data: {
            preset: "w", // Last 7 days preset
          },
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Successfully Booked",
    tableIdentifier: "/insights/routing",
    scope: "SYSTEM" as const,
    category: "Status-based",
    description: "Show routing forms that resulted in confirmed bookings",
    displayOrder: 2,
    isPredefined: true,
    activeFilters: [
      {
        id: "bookingStatusOrder",
        type: ColumnFilterType.SINGLE_SELECT,
        value: {
          data: "ACCEPTED",
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Failed Routes",
    tableIdentifier: "/insights/routing",
    scope: "SYSTEM" as const,
    category: "Status-based",
    description: "Show routing forms where booking failed or was cancelled",
    displayOrder: 3,
    isPredefined: true,
    activeFilters: [
      {
        id: "bookingStatusOrder",
        type: ColumnFilterType.MULTI_SELECT,
        value: {
          data: ["CANCELLED", "REJECTED"],
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "Marketing Attribution",
    tableIdentifier: "/insights/routing",
    scope: "SYSTEM" as const,
    category: "Marketing",
    description: "Show submissions with UTM campaign tracking",
    displayOrder: 4,
    isPredefined: true,
    activeFilters: [
      {
        id: "utm_campaign",
        type: ColumnFilterType.TEXT,
        value: {
          data: {
            operation: "isNotEmpty",
          },
        },
      },
    ],
    perPage: 20,
  },
  {
    name: "This Month",
    tableIdentifier: "/insights/routing",
    scope: "SYSTEM" as const,
    category: "Time-based", 
    description: "Show routing form submissions from the current month",
    displayOrder: 5,
    isPredefined: true,
    activeFilters: [
      {
        id: "createdAt",
        type: ColumnFilterType.DATE_RANGE,
        value: {
          data: {
            preset: "m", // Month-to-date preset
          },
        },
      },
    ],
    perPage: 20,
  },
];

// Combined list of all predefined segments
export const ALL_PREDEFINED_SEGMENTS: PredefinedFilterSegment[] = [
  ...BOOKING_INSIGHTS_SEGMENTS,
  ...ROUTING_INSIGHTS_SEGMENTS,
];

// Helper function to get predefined segments for a table
export const getPredefinedSegmentsForTable = (tableIdentifier: string): PredefinedFilterSegment[] => {
  return ALL_PREDEFINED_SEGMENTS.filter((segment) => segment.tableIdentifier === tableIdentifier);
};

// Helper function to get predefined segments by category
export const getPredefinedSegmentsByCategory = (
  tableIdentifier: string
): Record<string, PredefinedFilterSegment[]> => {
  const segments = getPredefinedSegmentsForTable(tableIdentifier);
  return segments.reduce((acc, segment) => {
    if (!acc[segment.category]) {
      acc[segment.category] = [];
    }
    acc[segment.category].push(segment);
    return acc;
  }, {} as Record<string, PredefinedFilterSegment[]>);
};