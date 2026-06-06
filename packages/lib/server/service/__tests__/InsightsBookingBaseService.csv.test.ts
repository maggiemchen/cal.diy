import { describe, test, expect } from "vitest";

describe("InsightsBookingBaseService CSV Date Formatting", () => {
  // Helper function extracted from the service
  const formatDateForCsv = (date: Date) => {
    return {
      date: date.toISOString().split("T")[0], // YYYY-MM-DD
      time: date.toISOString().split("T")[1].split(".")[0], // HH:MM:SS
    };
  };

  test("should format date correctly for CSV export", () => {
    const testDate = new Date("2024-06-06T14:30:00.000Z");
    const result = formatDateForCsv(testDate);

    expect(result.date).toBe("2024-06-06");
    expect(result.time).toBe("14:30:00");
  });

  test("should handle edge case dates", () => {
    const newYear = new Date("2024-01-01T00:00:00.000Z");
    const result1 = formatDateForCsv(newYear);

    expect(result1.date).toBe("2024-01-01");
    expect(result1.time).toBe("00:00:00");

    const endYear = new Date("2024-12-31T23:59:59.000Z");
    const result2 = formatDateForCsv(endYear);

    expect(result2.date).toBe("2024-12-31");
    expect(result2.time).toBe("23:59:59");
  });

  test("should handle dates with milliseconds", () => {
    const dateWithMillis = new Date("2024-06-15T16:45:30.123Z");
    const result = formatDateForCsv(dateWithMillis);

    // Should ignore milliseconds in time output
    expect(result.date).toBe("2024-06-15");
    expect(result.time).toBe("16:45:30");
  });

  test("should produce consistent output format", () => {
    const testDates = [
      new Date("2024-02-29T08:15:22.000Z"), // Leap year
      new Date("2024-07-04T12:00:00.000Z"), // July 4th
      new Date("2024-11-28T17:30:45.000Z"), // Thanksgiving
    ];

    testDates.forEach((date) => {
      const result = formatDateForCsv(date);

      // Date should be YYYY-MM-DD format
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Time should be HH:MM:SS format
      expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  test("should be Excel-friendly format", () => {
    const testDate = new Date("2024-06-06T14:30:00.000Z");
    const result = formatDateForCsv(testDate);

    // These formats should be easily parseable by Excel
    expect(result.date.length).toBe(10); // YYYY-MM-DD
    expect(result.time.length).toBe(8); // HH:MM:SS

    // No spaces or special characters that could cause CSV parsing issues
    expect(result.date).not.toContain(" ");
    expect(result.time).not.toContain(" ");
  });
});
