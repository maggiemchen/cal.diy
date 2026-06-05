import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { BookingStatus } from "@calcom/prisma/enums";

import { EventList } from "../components/event/EventList";
import { EmptyCell } from "../components/event/Empty";
import { useCalendarStore } from "../state/store";
import type { CalendarEvent } from "../types/events";

// Mock the store
vi.mock("../state/store");

// Mock dayjs
vi.mock("@calcom/dayjs", () => {
  const actualDayjs = vi.importActual("@calcom/dayjs");
  return {
    ...actualDayjs,
    default: vi.fn((date?: any) => ({
      ...actualDayjs.default(date),
      isSame: vi.fn(() => true),
      hour: vi.fn(() => 10),
      minute: vi.fn(() => 0),
      diff: vi.fn(() => 60),
      add: vi.fn((amount: number, unit: string) => ({
        toDate: vi.fn(() => new Date()),
      })),
      toDate: vi.fn(() => new Date()),
      isBetween: vi.fn(() => false),
    })),
  };
});

// Mock BookerTime
vi.mock("../../../bookings/Booker/components/hooks/useBookerTime", () => ({
  useBookerTime: () => ({ 
    timezone: "UTC",
    timeFormat: "HH:mm" 
  }),
}));

describe("EventsDisabled functionality", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: "Test Event",
      start: new Date("2024-01-01T10:00:00Z"),
      end: new Date("2024-01-01T11:00:00Z"),
      options: {
        status: BookingStatus.ACCEPTED,
      },
    },
  ];

  const mockStoreData = {
    startHour: 0,
    events: mockEvents,
    onEventClick: vi.fn(),
    onEmptyCellClick: vi.fn(),
    hoverEventDuration: 30,
    eventsDisabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUseCalendarStore = vi.mocked(useCalendarStore);
    mockUseCalendarStore.mockImplementation((selector: any) => {
      return selector(mockStoreData);
    });
  });

  describe("EventList with eventsDisabled", () => {
    it("should call onEventClick when eventsDisabled is false", () => {
      const mockDay = require("@calcom/dayjs").default();
      render(<EventList day={mockDay} />);

      const eventElement = screen.getByRole("button");
      fireEvent.click(eventElement);

      expect(mockStoreData.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it("should not call onEventClick when eventsDisabled is true", () => {
      const mockUseCalendarStore = vi.mocked(useCalendarStore);
      mockUseCalendarStore.mockImplementation((selector: any) => {
        return selector({
          ...mockStoreData,
          eventsDisabled: true,
        });
      });

      const mockDay = require("@calcom/dayjs").default();
      render(<EventList day={mockDay} />);

      // When eventsDisabled is true, the Event should render as div, not button
      const eventElements = screen.getAllByText("Test Event");
      expect(eventElements[0].closest("div")).toBeInTheDocument();
      
      // onEventClick should not be called when clicking disabled events
      fireEvent.click(eventElements[0]);
      expect(mockStoreData.onEventClick).not.toHaveBeenCalled();
    });

    it("should pass disabled prop to Event component when eventsDisabled is true", () => {
      const mockUseCalendarStore = vi.mocked(useCalendarStore);
      mockUseCalendarStore.mockImplementation((selector: any) => {
        return selector({
          ...mockStoreData,
          eventsDisabled: true,
        });
      });

      const mockDay = require("@calcom/dayjs").default();
      render(<EventList day={mockDay} />);

      const eventContainer = screen.getByText("Test Event").closest("div");
      expect(eventContainer?.className).toContain("hover:cursor-default");
    });
  });

  describe("EmptyCell with eventsDisabled", () => {
    const mockDay = require("@calcom/dayjs").default();

    it("should call onEmptyCellClick when eventsDisabled is false", () => {
      render(
        <EmptyCell
          day={mockDay}
          gridCellIdx={0}
          totalGridCells={96}
          selectionLength={24}
          startHour={0}
          timezone="UTC"
        />
      );

      const cellElement = screen.getByTestId("calendar-empty-cell");
      fireEvent.click(cellElement);

      expect(mockStoreData.onEmptyCellClick).toHaveBeenCalled();
    });

    it("should not call onEmptyCellClick when eventsDisabled is true", () => {
      const mockUseCalendarStore = vi.mocked(useCalendarStore);
      mockUseCalendarStore.mockImplementation((selector: any) => {
        return selector({
          ...mockStoreData,
          eventsDisabled: true,
        });
      });

      render(
        <EmptyCell
          day={mockDay}
          gridCellIdx={0}
          totalGridCells={96}
          selectionLength={24}
          startHour={0}
          timezone="UTC"
        />
      );

      const cellElement = screen.getByTestId("calendar-empty-cell");
      fireEvent.click(cellElement);

      expect(mockStoreData.onEmptyCellClick).not.toHaveBeenCalled();
    });

    it("should have pointer-events-none class when eventsDisabled is true", () => {
      const mockUseCalendarStore = vi.mocked(useCalendarStore);
      mockUseCalendarStore.mockImplementation((selector: any) => {
        return selector({
          ...mockStoreData,
          eventsDisabled: true,
        });
      });

      render(
        <EmptyCell
          day={mockDay}
          gridCellIdx={0}
          totalGridCells={96}
          selectionLength={24}
          startHour={0}
          timezone="UTC"
        />
      );

      const cellElement = screen.getByTestId("calendar-empty-cell");
      expect(cellElement).toHaveAttribute("data-disabled", "true");
      expect(cellElement.className).toContain("pointer-events-none");
    });

    it("should not show hover elements when eventsDisabled is true", () => {
      const mockUseCalendarStore = vi.mocked(useCalendarStore);
      mockUseCalendarStore.mockImplementation((selector: any) => {
        return selector({
          ...mockStoreData,
          eventsDisabled: true,
        });
      });

      render(
        <EmptyCell
          day={mockDay}
          gridCellIdx={0}
          totalGridCells={96}
          selectionLength={24}
          startHour={0}
          timezone="UTC"
        />
      );

      const cellElement = screen.getByTestId("calendar-empty-cell");
      
      // Hover elements should not be rendered when eventsDisabled is true
      const hoverElement = cellElement.querySelector(".group-hover\\:flex");
      expect(hoverElement).not.toBeInTheDocument();
    });
  });
});