import type { ReactNode } from "react";
import { forwardRef } from "react";

import { AtomsWrapper } from "../../src/components/atoms-wrapper";
import type { CalendarViewProps, CalendarViewRef } from "../CalendarView";
import { CalendarView } from "../CalendarView";

export type CalendarViewPlatformWrapperProps = CalendarViewProps & {
  children?: ReactNode;
  accessToken: string;
  apiUrl?: string;
};

export const CalendarViewPlatformWrapper = forwardRef<CalendarViewRef, CalendarViewPlatformWrapperProps>(
  ({ children, accessToken, apiUrl, ...props }, ref) => {
    return (
      <AtomsWrapper accessToken={accessToken} apiUrl={apiUrl}>
        <CalendarView {...props} ref={ref} />
        {children}
      </AtomsWrapper>
    );
  }
);

CalendarViewPlatformWrapper.displayName = "CalendarViewPlatformWrapper";