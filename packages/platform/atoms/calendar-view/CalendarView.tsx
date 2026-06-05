"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";

import dayjs from "@calcom/dayjs";
import { ReadOnlyCalendar } from "@calcom/features/calendars/ReadOnlyCalendar";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Select, Switch } from "@calcom/ui";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "@calcom/ui/components/icon";

export interface CalendarViewProps {
  /** Username to show calendar for */
  username?: string;
  /** Initial start date for the calendar view */
  initialDate?: Date;
  /** Start hour for the calendar view (0-23) */
  startHour?: number;
  /** End hour for the calendar view (0-23) */
  endHour?: number;
  /** Initial view type */
  initialViewType?: "week" | "day";
  /** Show external calendars by default */
  initialShowExternalCalendars?: boolean;
  /** Show availability slots by default */
  initialShowAvailability?: boolean;
  /** Enable view type selector */
  enableViewTypeSelector?: boolean;
  /** Enable time range selectors */
  enableTimeRangeSelector?: boolean;
  /** Enable external calendars toggle */
  enableExternalCalendarsToggle?: boolean;
  /** Enable availability toggle */
  enableAvailabilityToggle?: boolean;
  /** Hide the navigation header completely */
  hideHeader?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Callback when date changes */
  onDateChange?: (date: Date) => void;
  /** Callback when view type changes */
  onViewTypeChange?: (viewType: "week" | "day") => void;
  /** Callback when external calendars setting changes */
  onExternalCalendarsChange?: (enabled: boolean) => void;
  /** Callback when availability setting changes */
  onAvailabilityChange?: (enabled: boolean) => void;
}

export interface CalendarViewRef {
  /** Navigate to a specific date */
  navigateToDate: (date: Date) => void;
  /** Go to today */
  goToToday: () => void;
  /** Get current date */
  getCurrentDate: () => Date;
  /** Navigate by offset */
  navigate: (direction: "prev" | "next") => void;
}

export const CalendarView = forwardRef<CalendarViewRef, CalendarViewProps>(
  (
    {
      username,
      initialDate = new Date(),
      startHour = 0,
      endHour = 23,
      initialViewType = "week",
      initialShowExternalCalendars = true,
      initialShowAvailability = false,
      enableViewTypeSelector = true,
      enableTimeRangeSelector = true,
      enableExternalCalendarsToggle = true,
      enableAvailabilityToggle = true,
      hideHeader = false,
      className,
      onDateChange,
      onViewTypeChange,
      onExternalCalendarsChange,
      onAvailabilityChange,
    },
    ref
  ) => {
    const { t } = useLocale();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [viewType, setViewType] = useState(initialViewType);
    const [showExternalCalendars, setShowExternalCalendars] = useState(initialShowExternalCalendars);
    const [showAvailability, setShowAvailability] = useState(initialShowAvailability);
    const [currentStartHour, setCurrentStartHour] = useState(startHour);
    const [currentEndHour, setCurrentEndHour] = useState(endHour);

    const extraDays = viewType === "week" ? 7 : 1;

    useImperativeHandle(ref, () => ({
      navigateToDate: (date: Date) => {
        setCurrentDate(date);
        onDateChange?.(date);
      },
      goToToday: () => {
        const today = new Date();
        setCurrentDate(today);
        onDateChange?.(today);
      },
      getCurrentDate: () => currentDate,
      navigate: (direction: "prev" | "next") => {
        const amount = viewType === "week" ? 7 : 1;
        const unit = viewType === "week" ? "days" : "day";
        
        const newDate = direction === "next" 
          ? dayjs(currentDate).add(amount, unit).toDate()
          : dayjs(currentDate).subtract(amount, unit).toDate();
        
        setCurrentDate(newDate);
        onDateChange?.(newDate);
      },
    }));

    const navigateDate = (direction: "prev" | "next") => {
      const amount = viewType === "week" ? 7 : 1;
      const unit = viewType === "week" ? "days" : "day";
      
      const newDate = direction === "next" 
        ? dayjs(currentDate).add(amount, unit).toDate()
        : dayjs(currentDate).subtract(amount, unit).toDate();
      
      setCurrentDate(newDate);
      onDateChange?.(newDate);
    };

    const goToToday = () => {
      const today = new Date();
      setCurrentDate(today);
      onDateChange?.(today);
    };

    const handleViewTypeChange = (newViewType: "week" | "day") => {
      setViewType(newViewType);
      onViewTypeChange?.(newViewType);
    };

    const handleExternalCalendarsChange = (enabled: boolean) => {
      setShowExternalCalendars(enabled);
      onExternalCalendarsChange?.(enabled);
    };

    const handleAvailabilityChange = (enabled: boolean) => {
      setShowAvailability(enabled);
      onAvailabilityChange?.(enabled);
    };

    const formatDateRange = () => {
      if (viewType === "day") {
        return dayjs(currentDate).format("MMMM D, YYYY");
      }
      
      const endDate = dayjs(currentDate).add(6, "days");
      if (dayjs(currentDate).month() === endDate.month()) {
        return `${dayjs(currentDate).format("MMMM D")} - ${endDate.format("D, YYYY")}`;
      }
      return `${dayjs(currentDate).format("MMM D")} - ${endDate.format("MMM D, YYYY")}`;
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
      label: `${i.toString().padStart(2, "0")}:00`,
      value: i.toString(),
    }));

    return (
      <div className={`flex h-full flex-col ${className || ""}`}>
        {/* Header with controls */}
        {!hideHeader && (
          <div className="border-subtle flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <h1 className="text-lg font-semibold">{t("calendar_view")}</h1>
              </div>
              
              {/* Date navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="icon" 
                  color="secondary"
                  onClick={() => navigateDate("prev")}
                  className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="button" 
                  color="secondary"
                  onClick={goToToday}
                  className="px-3 py-1 text-sm">
                  {t("today")}
                </Button>
                
                <Button 
                  variant="icon" 
                  color="secondary"
                  onClick={() => navigateDate("next")}
                  className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <span className="text-emphasis ml-2 min-w-[200px] text-sm font-medium">
                  {formatDateRange()}
                </span>
              </div>
            </div>

            {/* View controls */}
            <div className="flex items-center gap-4">
              {/* View type selector */}
              {enableViewTypeSelector && (
                <Select
                  value={viewType}
                  onValueChange={handleViewTypeChange}
                  options={[
                    { label: t("week_view"), value: "week" },
                    { label: t("day_view"), value: "day" },
                  ]}
                />
              )}

              {/* Time range selectors */}
              {enableTimeRangeSelector && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t("from")}:</span>
                  <Select
                    value={currentStartHour.toString()}
                    onValueChange={(value) => setCurrentStartHour(parseInt(value))}
                    options={hourOptions}
                  />
                  <span className="text-sm">{t("to")}:</span>
                  <Select
                    value={currentEndHour.toString()}
                    onValueChange={(value) => setCurrentEndHour(parseInt(value))}
                    options={hourOptions}
                  />
                </div>
              )}

              {/* Toggle switches */}
              <div className="flex items-center gap-4">
                {enableExternalCalendarsToggle && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showExternalCalendars}
                      onCheckedChange={handleExternalCalendarsChange}
                    />
                    <span className="text-sm">{t("external_calendars")}</span>
                  </div>
                )}
                
                {enableAvailabilityToggle && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showAvailability}
                      onCheckedChange={handleAvailabilityChange}
                    />
                    <span className="text-sm">{t("availability_slots")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendar content */}
        <div className="flex-1 overflow-hidden">
          <ReadOnlyCalendar
            username={username}
            startDate={currentDate}
            startHour={currentStartHour}
            endHour={currentEndHour}
            showExternalCalendars={showExternalCalendars}
            showAvailability={showAvailability}
            extraDays={extraDays}
            hideHeader={true} // We handle header ourselves
            className="h-full"
          />
        </div>
      </div>
    );
  }
);

CalendarView.displayName = "CalendarView";