import { useState, useCallback } from "react";

export type TimestampOption = "createdAt" | "startTime" | "endTime" | "updatedAt";

export const timestampOptions: Array<{ value: TimestampOption; label: string; description: string }> = [
  {
    value: "createdAt",
    label: "Booking Created",
    description: "When the booking was made",
  },
  {
    value: "startTime", 
    label: "Event Start",
    description: "When the event is scheduled to start",
  },
  {
    value: "endTime",
    label: "Event End", 
    description: "When the event is scheduled to end",
  },
  {
    value: "updatedAt",
    label: "Last Modified",
    description: "When the booking was last updated",
  },
];

export function useInsightsTimestampSelection() {
  const [selectedTimestamp, setSelectedTimestamp] = useState<TimestampOption>("createdAt");

  const updateTimestamp = useCallback((timestamp: TimestampOption) => {
    setSelectedTimestamp(timestamp);
  }, []);

  return {
    selectedTimestamp,
    updateTimestamp,
    timestampOptions,
  };
}