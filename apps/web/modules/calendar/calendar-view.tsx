"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState, Suspense } from "react";

import dayjs from "@calcom/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Select, Switch } from "@calcom/ui";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "@calcom/ui/components/icon";
import { Loader } from "@calcom/ui/components/skeleton";
import { Meta } from "@calcom/ui/components/layout";

const ReadOnlyCalendarClientOnly = dynamic(
  () => import("@calcom/features/calendars/ReadOnlyCalendar").then((mod) => mod.ReadOnlyCalendar),
  {
    ssr: false,
  }
);

export default function CalendarView() {
  const { t } = useLocale();
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showExternalCalendars, setShowExternalCalendars] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);
  const [viewType, setViewType] = useState<"week" | "day">("week");
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);

  const extraDays = viewType === "week" ? 7 : 1;

  const navigateDate = (direction: "prev" | "next") => {
    const amount = viewType === "week" ? 7 : 1;
    const unit = viewType === "week" ? "days" : "day";
    
    setCurrentDate((prev) => 
      direction === "next" 
        ? dayjs(prev).add(amount, unit).toDate()
        : dayjs(prev).subtract(amount, unit).toDate()
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
    <>
      <Meta title={t("calendar_view")} description={t("view_your_calendar")} />
      
      <div className="flex h-full flex-col">
        {/* Header with controls */}
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
            <Select
              value={viewType}
              onValueChange={(value) => setViewType(value as "week" | "day")}
              options={[
                { label: t("week_view"), value: "week" },
                { label: t("day_view"), value: "day" },
              ]}
            />

            {/* Time range selectors */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{t("from")}:</span>
              <Select
                value={startHour.toString()}
                onValueChange={(value) => setStartHour(parseInt(value))}
                options={hourOptions}
              />
              <span className="text-sm">{t("to")}:</span>
              <Select
                value={endHour.toString()}
                onValueChange={(value) => setEndHour(parseInt(value))}
                options={hourOptions}
              />
            </div>

            {/* Toggle switches */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showExternalCalendars}
                  onCheckedChange={setShowExternalCalendars}
                />
                <span className="text-sm">{t("external_calendars")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={showAvailability}
                  onCheckedChange={setShowAvailability}
                />
                <span className="text-sm">{t("availability_slots")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar content */}
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Loader />
              </div>
            }>
            <ReadOnlyCalendarClientOnly
              username={session?.user?.username}
              startDate={currentDate}
              startHour={startHour}
              endHour={endHour}
              showExternalCalendars={showExternalCalendars}
              showAvailability={showAvailability}
              extraDays={extraDays}
              className="h-full"
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}