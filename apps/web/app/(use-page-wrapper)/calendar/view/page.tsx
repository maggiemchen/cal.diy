import { _generateMetadata } from "app/_utils";

import CalendarView from "~/calendar/calendar-view";

export const generateMetadata = async () => {
  return await _generateMetadata(
    (t) => t("calendar_view"),
    (t) => t("view_your_calendar"),
    undefined,
    undefined,
    "/calendar/view"
  );
};

const ServerPage = async () => {
  return <CalendarView />;
};

export default ServerPage;