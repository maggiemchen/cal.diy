import { describe, it, expect } from "vitest";
import { FilterSegmentScope } from "@prisma/client";
import { ColumnFilterType } from "@calcom/features/data-table/lib/types";

import {
  BOOKING_INSIGHTS_SEGMENTS,
  ROUTING_INSIGHTS_SEGMENTS,
  ALL_PREDEFINED_SEGMENTS,
  getPredefinedSegmentsForTable,
  getPredefinedSegmentsByCategory,
} from "./predefinedFilterSegments";

describe("Predefined Filter Segments", () => {
  describe("BOOKING_INSIGHTS_SEGMENTS", () => {
    it("should have correct structure and properties", () => {
      expect(BOOKING_INSIGHTS_SEGMENTS).toHaveLength(5);
      
      BOOKING_INSIGHTS_SEGMENTS.forEach((segment) => {
        expect(segment).toHaveProperty("name");
        expect(segment).toHaveProperty("tableIdentifier", "/insights");
        expect(segment).toHaveProperty("scope", FilterSegmentScope.SYSTEM);
        expect(segment).toHaveProperty("category");
        expect(segment).toHaveProperty("description");
        expect(segment).toHaveProperty("displayOrder");
        expect(segment).toHaveProperty("isPredefined", true);
        expect(segment).toHaveProperty("activeFilters");
        expect(segment).toHaveProperty("perPage", 20);
        expect(Array.isArray(segment.activeFilters)).toBe(true);
      });
    });

    it("should include time-based segments with correct date filters", () => {
      const timeBasedSegments = BOOKING_INSIGHTS_SEGMENTS.filter(s => s.category === "Time-based");
      expect(timeBasedSegments).toHaveLength(2);
      
      const recentSegment = timeBasedSegments.find(s => s.name === "Recent Bookings");
      expect(recentSegment).toBeDefined();
      expect(recentSegment?.activeFilters).toHaveLength(1);
      expect(recentSegment?.activeFilters[0]).toMatchObject({
        id: "createdAt",
        type: ColumnFilterType.DATE_RANGE,
        value: {
          data: {
            preset: "w", // Last 7 days
          },
        },
      });
    });

    it("should include status-based segments with correct status filters", () => {
      const statusBasedSegments = BOOKING_INSIGHTS_SEGMENTS.filter(s => s.category === "Status-based");
      expect(statusBasedSegments).toHaveLength(3);
      
      const confirmedSegment = statusBasedSegments.find(s => s.name === "Confirmed Bookings");
      expect(confirmedSegment).toBeDefined();
      expect(confirmedSegment?.activeFilters[0]).toMatchObject({
        id: "status",
        type: ColumnFilterType.SINGLE_SELECT,
        value: {
          data: "ACCEPTED",
        },
      });
    });
  });

  describe("ROUTING_INSIGHTS_SEGMENTS", () => {
    it("should have correct structure and properties", () => {
      expect(ROUTING_INSIGHTS_SEGMENTS).toHaveLength(5);
      
      ROUTING_INSIGHTS_SEGMENTS.forEach((segment) => {
        expect(segment).toHaveProperty("name");
        expect(segment).toHaveProperty("tableIdentifier", "/insights/routing");
        expect(segment).toHaveProperty("scope", FilterSegmentScope.SYSTEM);
        expect(segment).toHaveProperty("category");
        expect(segment).toHaveProperty("description");
        expect(segment).toHaveProperty("displayOrder");
        expect(segment).toHaveProperty("isPredefined", true);
        expect(segment).toHaveProperty("activeFilters");
        expect(segment).toHaveProperty("perPage", 20);
      });
    });

    it("should include marketing segments with UTM filters", () => {
      const marketingSegments = ROUTING_INSIGHTS_SEGMENTS.filter(s => s.category === "Marketing");
      expect(marketingSegments).toHaveLength(1);
      
      const marketingSegment = marketingSegments[0];
      expect(marketingSegment.name).toBe("Marketing Attribution");
      expect(marketingSegment.activeFilters[0]).toMatchObject({
        id: "utm_campaign",
        type: ColumnFilterType.TEXT,
        value: {
          data: {
            operation: "isNotEmpty",
          },
        },
      });
    });
  });

  describe("Helper Functions", () => {
    it("getPredefinedSegmentsForTable should filter by table identifier", () => {
      const bookingSegments = getPredefinedSegmentsForTable("/insights");
      const routingSegments = getPredefinedSegmentsForTable("/insights/routing");
      const nonExistentSegments = getPredefinedSegmentsForTable("/unknown");

      expect(bookingSegments).toHaveLength(5);
      expect(routingSegments).toHaveLength(5);
      expect(nonExistentSegments).toHaveLength(0);
      
      expect(bookingSegments.every(s => s.tableIdentifier === "/insights")).toBe(true);
      expect(routingSegments.every(s => s.tableIdentifier === "/insights/routing")).toBe(true);
    });

    it("getPredefinedSegmentsByCategory should group by category", () => {
      const bookingCategories = getPredefinedSegmentsByCategory("/insights");
      const routingCategories = getPredefinedSegmentsByCategory("/insights/routing");

      // Booking insights should have Time-based and Status-based categories
      expect(Object.keys(bookingCategories)).toContain("Time-based");
      expect(Object.keys(bookingCategories)).toContain("Status-based");
      expect(bookingCategories["Time-based"]).toHaveLength(2);
      expect(bookingCategories["Status-based"]).toHaveLength(3);

      // Routing insights should have Time-based, Status-based, and Marketing categories
      expect(Object.keys(routingCategories)).toContain("Time-based");
      expect(Object.keys(routingCategories)).toContain("Status-based");
      expect(Object.keys(routingCategories)).toContain("Marketing");
      expect(routingCategories["Marketing"]).toHaveLength(1);
    });

    it("ALL_PREDEFINED_SEGMENTS should contain all segments", () => {
      const totalExpected = BOOKING_INSIGHTS_SEGMENTS.length + ROUTING_INSIGHTS_SEGMENTS.length;
      expect(ALL_PREDEFINED_SEGMENTS).toHaveLength(totalExpected);
      
      // Should contain all booking segments
      BOOKING_INSIGHTS_SEGMENTS.forEach((segment) => {
        expect(ALL_PREDEFINED_SEGMENTS).toContainEqual(segment);
      });
      
      // Should contain all routing segments
      ROUTING_INSIGHTS_SEGMENTS.forEach((segment) => {
        expect(ALL_PREDEFINED_SEGMENTS).toContainEqual(segment);
      });
    });
  });

  describe("Segment Properties", () => {
    it("should have unique display orders within each table", () => {
      const bookingOrders = BOOKING_INSIGHTS_SEGMENTS.map(s => s.displayOrder);
      const routingOrders = ROUTING_INSIGHTS_SEGMENTS.map(s => s.displayOrder);
      
      expect(new Set(bookingOrders).size).toBe(bookingOrders.length);
      expect(new Set(routingOrders).size).toBe(routingOrders.length);
    });

    it("should have unique names within each table", () => {
      const bookingNames = BOOKING_INSIGHTS_SEGMENTS.map(s => s.name);
      const routingNames = ROUTING_INSIGHTS_SEGMENTS.map(s => s.name);
      
      expect(new Set(bookingNames).size).toBe(bookingNames.length);
      expect(new Set(routingNames).size).toBe(routingNames.length);
    });

    it("should have non-empty descriptions", () => {
      ALL_PREDEFINED_SEGMENTS.forEach((segment) => {
        expect(segment.description).toBeTruthy();
        expect(segment.description.trim().length).toBeGreaterThan(0);
      });
    });
  });
});