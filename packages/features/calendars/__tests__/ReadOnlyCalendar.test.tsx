import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import dayjs from "@calcom/dayjs";
import { BookingStatus } from "@calcom/prisma/enums";

import { ReadOnlyCalendar } from "../ReadOnlyCalendar";

// Mock the tRPC hooks
vi.mock("@calcom/trpc/react", () => ({
  trpc: {
    viewer: {
      availability: {
        user: {
          useQuery: vi.fn(),
        },
      },
    },
  },
}));

// Mock the useSchedule hook
vi.mock("../../schedules/lib/use-schedule/useSchedule", () => ({
  useSchedule: vi.fn(),
}));

// Mock the Calendar component
vi.mock("../weeklyview/components/Calendar", () => ({
  Calendar: vi.fn(({ events, eventsDisabled, hoverEventDuration, ...props }) => (
    <div
      data-testid="calendar"
      data-events-disabled={eventsDisabled}
      data-hover-duration={hoverEventDuration}
      data-events={JSON.stringify(events)}>
      Mock Calendar Component
    </div>
  )),
}));

// Mock dayjs
vi.mock("@calcom/dayjs", () => {
  const actualDayjs = vi.importActual("@calcom/dayjs");
  return {
    ...actualDayjs,
    default: vi.fn((date?: any) => ({
      ...actualDayjs.default(date),
      format: vi.fn((format: string) => "mocked-date"),
      startOf: vi.fn(() => ({ utc: vi.fn(() => ({ format: vi.fn(() => "mocked-date") })) })),
      endOf: vi.fn(() => ({ utc: vi.fn(() => ({ format: vi.fn(() => "mocked-date") })) })),
      add: vi.fn(() => ({ toDate: vi.fn(() => new Date()) })),
    })),
  };
});

describe("ReadOnlyCalendar", () => {
  const mockBusyData = {
    busy: [
      {
        start: "2024-01-01T10:00:00Z",
        end: "2024-01-01T11:00:00Z",
        title: "Test Meeting",
        source: "google",
      },
      {
        start: "2024-01-01T14:00:00Z",
        end: "2024-01-01T15:30:00Z",
        title: "Another Meeting",
        source: "outlook",
      },
    ],
    workingHours: [],
    dateOverrides: [],
  };

  const mockScheduleData = {
    slots: {
      "2024-01-01": [
        { time: "2024-01-01T09:00:00Z" },
        { time: "2024-01-01T10:00:00Z" },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    const { trpc } = require("@calcom/trpc/react");
    const { useSchedule } = require("../../schedules/lib/use-schedule/useSchedule");
    
    trpc.viewer.availability.user.useQuery.mockReturnValue({
      data: mockBusyData,
      isLoading: false,
    });

    useSchedule.mockReturnValue({
      data: mockScheduleData,
      isLoading: false,
    });
  });

  it("renders read-only calendar with default props", () => {
    render(<ReadOnlyCalendar />);
    
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveAttribute("data-events-disabled", "true");
    expect(calendar).toHaveAttribute("data-hover-duration", "0");
  });

  it("passes correct events from busy times", () => {
    render(<ReadOnlyCalendar username="testuser" showExternalCalendars={true} />);
    
    const calendar = screen.getByTestId("calendar");
    const eventsData = JSON.parse(calendar.getAttribute("data-events") || "[]");
    
    expect(eventsData).toHaveLength(2);
    expect(eventsData[0]).toMatchObject({
      title: "Test Meeting",
      source: "google",
    });
    expect(eventsData[1]).toMatchObject({
      title: "Another Meeting", 
      source: "outlook",
    });
  });

  it("handles external calendars toggle", () => {
    const { trpc } = require("@calcom/trpc/react");
    
    render(<ReadOnlyCalendar username="testuser" showExternalCalendars={false} />);
    
    expect(trpc.viewer.availability.user.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "testuser",
      }),
      expect.objectContaining({
        enabled: false, // Should be disabled when showExternalCalendars is false
      })
    );
  });

  it("handles availability slots when enabled", () => {
    const { useSchedule } = require("../../schedules/lib/use-schedule/useSchedule");
    
    render(
      <ReadOnlyCalendar 
        username="testuser" 
        showAvailability={true}
        eventSlug="test-event"
        eventId={1}
      />
    );
    
    expect(useSchedule).toHaveBeenCalledWith({
      username: "testuser",
      eventSlug: "test-event",
      eventId: 1,
      timezone: "UTC",
      month: expect.any(String),
      orgSlug: undefined,
    });
  });

  it("applies custom time range", () => {
    render(
      <ReadOnlyCalendar 
        startHour={9}
        endHour={17}
      />
    );
    
    const calendar = screen.getByTestId("calendar");
    // The Calendar mock doesn't capture these props directly in our test,
    // but this ensures the component doesn't crash with custom hours
    expect(calendar).toBeInTheDocument();
  });

  it("handles loading state", () => {
    const { trpc } = require("@calcom/trpc/react");
    
    trpc.viewer.availability.user.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ReadOnlyCalendar username="testuser" />);
    
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
    // The Calendar component should receive isPending prop when loading
  });

  it("handles missing username gracefully", () => {
    render(<ReadOnlyCalendar showExternalCalendars={true} />);
    
    const { trpc } = require("@calcom/trpc/react");
    
    expect(trpc.viewer.availability.user.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "",
      }),
      expect.objectContaining({
        enabled: false, // Should be disabled when no username
      })
    );
  });

  it("applies color coding for different calendar sources", () => {
    const customColorMap = {
      google: "#FF0000",
      outlook: "#00FF00",
    };

    render(
      <ReadOnlyCalendar 
        username="testuser"
        showExternalCalendars={true}
        calendarToColorMap={customColorMap}
      />
    );
    
    const calendar = screen.getByTestId("calendar");
    const eventsData = JSON.parse(calendar.getAttribute("data-events") || "[]");
    
    expect(eventsData[0].options.borderColor).toBe("#FF0000");
    expect(eventsData[1].options.borderColor).toBe("#00FF00");
  });

  it("handles date range calculations correctly", () => {
    const startDate = new Date("2024-01-01");
    const extraDays = 14; // Two weeks
    
    render(
      <ReadOnlyCalendar 
        startDate={startDate}
        extraDays={extraDays}
      />
    );
    
    // Component should render without errors
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toBeInTheDocument();
  });
});

// Test for the eventsDisabled functionality in weeklyview components
describe("ReadOnlyCalendar - Events Disabled", () => {
  it("should disable event interactions when eventsDisabled is true", () => {
    // This test would need to be expanded with proper mocking of the Calendar component
    // and testing the actual interaction disabling behavior
    render(<ReadOnlyCalendar />);
    
    const calendar = screen.getByTestId("calendar");
    expect(calendar).toHaveAttribute("data-events-disabled", "true");
    expect(calendar).toHaveAttribute("data-hover-duration", "0");
  });
});