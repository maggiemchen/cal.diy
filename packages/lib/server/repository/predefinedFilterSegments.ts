import type { ColumnFilterType } from "@calcom/features/data-table";
import type { FilterSegment } from "@calcom/prisma/client";

import { FilterSegmentRepository } from "./filterSegment";

export interface PredefinedSegmentDefinition {
  name: string;
  tableIdentifier: string;
  category: string;
  activeFilters: any[];
  sorting?: any[];
  columnVisibility?: Record<string, boolean>;
  columnSizing?: Record<string, number>;
  perPage: number;
  searchTerm?: string;
}

export class PredefinedFilterSegmentsService {
  private filterSegmentRepository = new FilterSegmentRepository();

  // Common predefined segments for booking insights
  private bookingInsightsSegments: PredefinedSegmentDefinition[] = [
    {
      name: "Recent Bookings",
      tableIdentifier: "/insights",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_7_days",
            },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "This Month",
      tableIdentifier: "/insights",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_30_days",
            },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Confirmed Bookings",
      tableIdentifier: "/insights",
      category: "status_filters",
      activeFilters: [
        {
          f: "status",
          v: {
            type: "MULTI_SELECT" as ColumnFilterType,
            data: ["ACCEPTED"],
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Cancelled Bookings",
      tableIdentifier: "/insights",
      category: "status_filters",
      activeFilters: [
        {
          f: "status",
          v: {
            type: "MULTI_SELECT" as ColumnFilterType,
            data: ["CANCELLED", "REJECTED"],
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "No Shows",
      tableIdentifier: "/insights",
      category: "status_filters",
      activeFilters: [
        {
          f: "status",
          v: {
            type: "MULTI_SELECT" as ColumnFilterType,
            data: ["NOSHOW"],
          },
        },
      ],
      perPage: 50,
    },
  ];

  // Common predefined segments for routing form insights
  private routingInsightsSegments: PredefinedSegmentDefinition[] = [
    {
      name: "Recent Responses",
      tableIdentifier: "/insights/routing",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_7_days",
            },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "This Week",
      tableIdentifier: "/insights/routing",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_7_days",
            },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Successful Routes",
      tableIdentifier: "/insights/routing",
      category: "routing_status",
      activeFilters: [
        {
          f: "routedToBookingUid",
          v: {
            type: "TEXT" as ColumnFilterType,
            data: {
              operator: "isNotEmpty",
            },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Failed Routes",
      tableIdentifier: "/insights/routing",
      category: "routing_status",
      activeFilters: [
        {
          f: "routedToBookingUid",
          v: {
            type: "TEXT" as ColumnFilterType,
            data: {
              operator: "isEmpty",
            },
          },
        },
      ],
      perPage: 50,
    },
  ];

  // Common predefined segments for bookings list
  private bookingListSegments: PredefinedSegmentDefinition[] = [
    {
      name: "Today's Bookings",
      tableIdentifier: "/bookings/upcoming",
      category: "time_ranges",
      activeFilters: [
        {
          f: "dateRange",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "today",
            },
          },
        },
      ],
      perPage: 25,
    },
    {
      name: "This Week",
      tableIdentifier: "/bookings/upcoming",
      category: "time_ranges",
      activeFilters: [
        {
          f: "dateRange",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_7_days",
            },
          },
        },
      ],
      perPage: 25,
    },
    {
      name: "Recent Cancellations",
      tableIdentifier: "/bookings/cancelled",
      category: "time_ranges",
      activeFilters: [
        {
          f: "dateRange",
          v: {
            type: "DATE_RANGE" as ColumnFilterType,
            data: {
              preset: "last_30_days",
            },
          },
        },
      ],
      perPage: 25,
    },
  ];

  private getAllPredefinedSegments(): PredefinedSegmentDefinition[] {
    return [
      ...this.bookingInsightsSegments,
      ...this.routingInsightsSegments,
      ...this.bookingListSegments,
    ];
  }

  async createPredefinedSegment(definition: PredefinedSegmentDefinition): Promise<FilterSegment> {
    return this.filterSegmentRepository.createSystemSegment({
      input: {
        name: definition.name,
        tableIdentifier: definition.tableIdentifier,
        category: definition.category,
        activeFilters: definition.activeFilters,
        sorting: definition.sorting || [],
        columnVisibility: definition.columnVisibility || {},
        columnSizing: definition.columnSizing || {},
        perPage: definition.perPage,
        searchTerm: definition.searchTerm || null,
      },
    });
  }

  async seedPredefinedSegments(): Promise<void> {
    const allSegments = this.getAllPredefinedSegments();
    
    for (const segment of allSegments) {
      try {
        await this.createPredefinedSegment(segment);
        console.log(`Created predefined segment: ${segment.name} for ${segment.tableIdentifier}`);
      } catch (error) {
        console.error(`Failed to create predefined segment ${segment.name}:`, error);
      }
    }
  }

  getPredefinedSegmentsForTable(tableIdentifier: string): PredefinedSegmentDefinition[] {
    return this.getAllPredefinedSegments().filter(
      (segment) => segment.tableIdentifier === tableIdentifier
    );
  }

  getPredefinedSegmentsByCategory(
    tableIdentifier: string,
    category: string
  ): PredefinedSegmentDefinition[] {
    return this.getAllPredefinedSegments().filter(
      (segment) => segment.tableIdentifier === tableIdentifier && segment.category === category
    );
  }
}