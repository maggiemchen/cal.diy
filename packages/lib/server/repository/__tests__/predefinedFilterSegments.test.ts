import { describe, it, expect, beforeEach, vi } from "vitest";

import type { FilterSegment } from "@calcom/prisma/client";

import { FilterSegmentRepository } from "../filterSegment";
import { PredefinedFilterSegmentsService } from "../predefinedFilterSegments";

// Mock the repository
vi.mock("../filterSegment", () => ({
  FilterSegmentRepository: vi.fn().mockImplementation(() => ({
    createSystemSegment: vi.fn(),
  })),
}));

describe("PredefinedFilterSegmentsService", () => {
  let service: PredefinedFilterSegmentsService;
  let mockRepository: FilterSegmentRepository;

  beforeEach(() => {
    service = new PredefinedFilterSegmentsService();
    mockRepository = new FilterSegmentRepository();
  });

  describe("getPredefinedSegmentsForTable", () => {
    it("should return segments for booking insights", () => {
      const segments = service.getPredefinedSegmentsForTable("/insights");
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Recent Bookings",
            tableIdentifier: "/insights",
            category: "time_ranges",
          }),
          expect.objectContaining({
            name: "Confirmed Bookings",
            tableIdentifier: "/insights",
            category: "status_filters",
          }),
        ])
      );
    });

    it("should return segments for routing insights", () => {
      const segments = service.getPredefinedSegmentsForTable("/insights/routing");
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Recent Responses",
            tableIdentifier: "/insights/routing",
            category: "time_ranges",
          }),
          expect.objectContaining({
            name: "Successful Routes",
            tableIdentifier: "/insights/routing",
            category: "routing_status",
          }),
        ])
      );
    });

    it("should return segments for bookings list", () => {
      const segments = service.getPredefinedSegmentsForTable("/bookings/upcoming");
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Today's Bookings",
            tableIdentifier: "/bookings/upcoming",
            category: "time_ranges",
          }),
        ])
      );
    });

    it("should return empty array for unknown table", () => {
      const segments = service.getPredefinedSegmentsForTable("/unknown/table");
      expect(segments).toHaveLength(0);
    });
  });

  describe("getPredefinedSegmentsByCategory", () => {
    it("should return segments filtered by category", () => {
      const segments = service.getPredefinedSegmentsByCategory("/insights", "time_ranges");
      
      expect(segments.length).toBeGreaterThan(0);
      segments.forEach((segment) => {
        expect(segment.category).toBe("time_ranges");
        expect(segment.tableIdentifier).toBe("/insights");
      });
    });

    it("should return empty array for non-existent category", () => {
      const segments = service.getPredefinedSegmentsByCategory("/insights", "non_existent");
      expect(segments).toHaveLength(0);
    });
  });

  describe("createPredefinedSegment", () => {
    it("should call repository with correct parameters", async () => {
      const mockCreateSystemSegment = vi.fn().mockResolvedValue({ id: 1 } as FilterSegment);
      (mockRepository.createSystemSegment as any) = mockCreateSystemSegment;
      
      const definition = {
        name: "Test Segment",
        tableIdentifier: "/test",
        category: "test_category",
        activeFilters: [],
        perPage: 25,
      };

      await service.createPredefinedSegment(definition);

      expect(mockCreateSystemSegment).toHaveBeenCalledWith({
        input: {
          name: "Test Segment",
          tableIdentifier: "/test",
          category: "test_category",
          activeFilters: [],
          sorting: [],
          columnVisibility: {},
          columnSizing: {},
          perPage: 25,
          searchTerm: null,
        },
      });
    });
  });

  describe("segment definitions validation", () => {
    it("should have valid filter structures", () => {
      const allSegments = [
        ...service.getPredefinedSegmentsForTable("/insights"),
        ...service.getPredefinedSegmentsForTable("/insights/routing"),
        ...service.getPredefinedSegmentsForTable("/bookings/upcoming"),
      ];

      allSegments.forEach((segment) => {
        // Validate required fields
        expect(segment.name).toBeTruthy();
        expect(segment.tableIdentifier).toBeTruthy();
        expect(segment.category).toBeTruthy();
        expect(Array.isArray(segment.activeFilters)).toBe(true);
        expect(typeof segment.perPage).toBe("number");
        expect(segment.perPage).toBeGreaterThan(0);

        // Validate filter structure
        segment.activeFilters.forEach((filter: any) => {
          expect(filter).toHaveProperty("f"); // field
          if (filter.v) {
            expect(filter.v).toHaveProperty("type");
            expect(filter.v).toHaveProperty("data");
          }
        });
      });
    });
  });
});