import React, { useMemo } from "react";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { BookingStatus } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc/react";

import { useSchedule } from "../schedules/lib/use-schedule/useSchedule";
import { Calendar } from "./weeklyview/components/Calendar";
import type { CalendarEvent } from "./weeklyview/types/events";
import type { CalendarAvailableTimeslots } from "./weeklyview/types/state";

export interface ReadOnlyCalendarProps {
  /** Username to show calendar for */
  username?: string;
  /** Date to start the calendar view */
  startDate?: Date;
  /** Date to end the calendar view */
  endDate?: Date;
  /** Start hour for the calendar view (0-23) */
  startHour?: number;
  /** End hour for the calendar view (0-23) */
  endHour?: number;
  /** Show events from connected external calendars */
  showExternalCalendars?: boolean;
  /** Show Cal.com bookings as events */
  showBookings?: boolean;
  /** Show available time slots */
  showAvailability?: boolean;
  /** Event slug for availability checking */
  eventSlug?: string;
  /** Event ID for availability checking */
  eventId?: number;
  /** Organization slug */
  orgSlug?: string;
  /** Calendar to color mapping */
  calendarToColorMap?: Record<string, string>;
  /** Custom CSS class name */
  className?: string;
  /** Hide the date navigation header */
  hideHeader?: boolean;
  /** Number of extra days to show (default 7 for week view) */
  extraDays?: number;
}

export function ReadOnlyCalendar({
  username,
  startDate = new Date(),
  endDate,
  startHour = 0,
  endHour = 23,
  showExternalCalendars = true,
  showBookings = false, // Disabled by default as it requires different data structure
  showAvailability = false,
  eventSlug,
  eventId,
  orgSlug,
  calendarToColorMap = {},
  className,
  hideHeader = false,
  extraDays = 7,
}: ReadOnlyCalendarProps) {
  const { t } = useLocale();
  
  const startDateDayjs = dayjs(startDate);
  const calculatedEndDate = useMemo(() => {
    if (endDate) return endDate;
    return startDateDayjs.add(extraDays - 1, "day").toDate();
  }, [startDate, endDate, extraDays, startDateDayjs]);

  const dateFrom = startDateDayjs.startOf("day").utc().format();
  const dateTo = startDateDayjs
    .add(extraDays - 1, "day")
    .endOf("day")
    .utc()
    .format();

  // Fetch user availability and busy times (similar to troubleshooter)
  const { data: busyEvents, isLoading: isAvailabilityLoading } = trpc.viewer.availability.user.useQuery(
    {
      username: username || "",
      dateFrom,
      dateTo,
      withSource: true,
    },
    {
      enabled: (showExternalCalendars || showAvailability) && !!username,
    }
  );

  // Fetch schedule/availability slots if requested
  const { data: schedule, isLoading: isScheduleLoading } = useSchedule({
    username: username || "",
    eventSlug,
    eventId,
    timezone: "UTC", // This should be passed in or detected
    month: startDateDayjs.format("YYYY-MM"),
    orgSlug,
  });

  // Transform busy events into CalendarEvent format
  const events: CalendarEvent[] = useMemo(() => {
    if (!busyEvents?.busy) return [];

    const calendarEvents = busyEvents.busy.map((event, idx) => ({
      id: idx,
      title: event.title ?? "Busy",
      start: new Date(event.start),
      end: new Date(event.end),
      source: event.source,
      options: {
        borderColor:
          event.source && calendarToColorMap[event.source] 
            ? calendarToColorMap[event.source] 
            : getBusyTimeColor(event.source),
        status: BookingStatus.ACCEPTED,
        "data-test-id": "readonly-calendar-busy-event",
      },
    }));

    // Add date overrides if available
    if (busyEvents.dateOverrides) {
      busyEvents.dateOverrides.forEach((dateOverride) => {
        const dateOverrideStart = dayjs(dateOverride.start);
        const dateOverrideEnd = dayjs(dateOverride.end);

        if (!dateOverrideStart.isSame(dateOverrideEnd)) {
          return;
        }

        const dayOfWeekNum = dateOverrideStart.day();
        const workingHoursForDay = busyEvents.workingHours.find((workingHours) =>
          workingHours.days.includes(dayOfWeekNum)
        );

        if (!workingHoursForDay) return;

        calendarEvents.push({
          id: calendarEvents.length,
          title: "Date Override",
          start: dateOverrideStart.add(workingHoursForDay.startTime, "minutes").toDate(),
          end: dateOverrideEnd.add(workingHoursForDay.endTime, "minutes").toDate(),
          options: {
            borderColor: "#6B7280",
            status: BookingStatus.ACCEPTED,
            "data-test-id": "readonly-calendar-date-override",
          },
        });
      });
    }

    return calendarEvents;
  }, [busyEvents, calendarToColorMap]);

  // Transform available slots for display
  const availableSlots = useMemo(() => {
    if (!showAvailability || !schedule?.slots) return undefined;

    const availableTimeslots: CalendarAvailableTimeslots = {};

    for (const day in schedule.slots) {
      availableTimeslots[day] = schedule.slots[day].map((slot) => ({
        start: dayjs(slot.time).toDate(),
        end: dayjs(slot.time)
          .add(30, "minutes") // Default slot duration, should be configurable
          .toDate(),
      }));
    }

    return availableTimeslots;
  }, [schedule, showAvailability]);

  const isLoading = isAvailabilityLoading || isScheduleLoading;

  return (
    <div className={className}>
      <Calendar
        startDate={startDate}
        endDate={calculatedEndDate}
        events={events}
        availableTimeslots={availableSlots}
        startHour={startHour}
        endHour={endHour}
        eventsDisabled={true} // This makes it read-only
        hoverEventDuration={0} // Disable hover interactions
        gridCellsPerHour={4}
        hideHeader={hideHeader}
        isPending={isLoading}
        sortEvents={true}
      />
    </div>
  );
}

// Helper function for color-coding external calendar sources
function getBusyTimeColor(source?: string): string {
  switch (source?.toLowerCase()) {
    case "google":
      return "#4285F4";
    case "outlook":
      return "#0078D4";
    case "apple":
      return "#007AFF";
    case "caldav":
      return "#FF9500";
    default:
      return "#6B7280"; // Gray for unknown sources
  }
}

// Export a default configuration for easy usage
export const DefaultReadOnlyCalendar = (props: Partial<ReadOnlyCalendarProps>) => (
  <ReadOnlyCalendar
    showExternalCalendars={true}
    showAvailability={false}
    hideHeader={false}
    extraDays={7}
    {...props}
  />
);