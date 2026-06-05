# Cal.com Calendar Features

This package contains calendar-related components and utilities for Cal.com.

## Components

### WeeklyView Calendar

The core calendar component that powers Cal.com's scheduling interface.

- **Location**: `weeklyview/`
- **Main Component**: `Calendar.tsx`
- **Features**: Week/day views, event rendering, time slot selection, drag & drop

### ReadOnlyCalendar

A read-only calendar view that displays events and availability without allowing modifications.

- **Location**: `ReadOnlyCalendar.tsx`
- **Features**: External calendar integration, availability display, color-coded events
- **Documentation**: See `ReadOnlyCalendar.md`

### DatePicker

Custom month-view date picker for booking flows.

- **Location**: `DatePicker.tsx` 
- **Features**: Month navigation, date selection, availability indicators

## Key Features

### Read-Only Mode

The `eventsDisabled` prop in the weeklyview components provides read-only functionality:

```typescript
<Calendar 
  eventsDisabled={true}
  hoverEventDuration={0}
  // ... other props
/>
```

This disables:
- Event click interactions
- Empty cell clicks (time slot selection)
- Hover affordances
- All calendar modifications

### Calendar Integration

Supports multiple calendar providers:
- Google Calendar
- Microsoft Outlook  
- Apple Calendar
- CalDAV
- ICS feeds

### Data Sources

- **External Calendars**: Via `CalendarManager` and app-store integrations
- **Availability**: Via `AvailableSlotsService` and working hours
- **Busy Times**: Via `BusyTimesService` combining all sources

## Architecture

```
┌─────────────────────────────────────┐
│  Calendar Components                │
│  ├─ weeklyview/Calendar             │
│  ├─ DatePicker                      │
│  └─ ReadOnlyCalendar                │
├─────────────────────────────────────┤
│  State Management                   │
│  ├─ useCalendarStore (Zustand)      │
│  ├─ BookerStore                     │
│  └─ OverlayStore                    │
├─────────────────────────────────────┤
│  Data Layer                         │
│  ├─ tRPC Endpoints                  │
│  ├─ useSchedule Hook                │
│  └─ Calendar Hooks                  │
├─────────────────────────────────────┤
│  Services                           │
│  ├─ CalendarManager                 │
│  ├─ AvailableSlotsService           │
│  └─ BusyTimesService                │
└─────────────────────────────────────┘
```

## Usage Patterns

### Interactive Calendar (Default)

```typescript
import { Calendar } from "@calcom/features/calendars/weeklyview";

<Calendar
  events={events}
  onEmptyCellClick={handleTimeSelection}
  onEventClick={handleEventClick}
/>
```

### Read-Only Calendar

```typescript
import { ReadOnlyCalendar } from "@calcom/features/calendars/ReadOnlyCalendar";

<ReadOnlyCalendar
  username="john-doe"
  showExternalCalendars={true}
/>
```

### Platform Atom (Embeddable)

```typescript
import { CalendarView } from "@calcom/platform/atoms/calendar-view";

<CalendarView
  username="jane-smith"
  accessToken="api-token"
/>
```

## Testing

```bash
# Run all calendar tests
yarn test calendars

# Run specific component tests
yarn test ReadOnlyCalendar
yarn test weeklyview
yarn test eventsDisabled
```

## Development

### Adding New Calendar Sources

1. Create new `CalendarService` in `packages/app-store/[provider]/lib/`
2. Implement required methods: `createEvent`, `updateEvent`, `deleteEvent`, `getBusyTimes`
3. Add provider to `CalendarManager`
4. Update color coding in `ReadOnlyCalendar`

### Extending WeeklyView

1. Update types in `weeklyview/types/`
2. Modify components in `weeklyview/components/`
3. Update store in `weeklyview/state/store.ts`
4. Add tests in `weeklyview/__tests__/`

## Migration Guide

### From Troubleshooter to ReadOnlyCalendar

The new ReadOnlyCalendar provides enhanced functionality:

```typescript
// Old troubleshooter pattern
import { LargeCalendar } from "@calcom/features/troubleshooter/components/LargeCalendar";

// New read-only calendar
import { ReadOnlyCalendar } from "@calcom/features/calendars/ReadOnlyCalendar";

<ReadOnlyCalendar
  username={username}
  showExternalCalendars={true}
  showAvailability={true}  // Optional, troubleshooter always showed this
/>
```

### Enabling Read-Only Mode on Existing Calendars

```typescript
// Add these props to make any Calendar read-only
<Calendar
  eventsDisabled={true}
  hoverEventDuration={0}
  // Remove interaction handlers
  onEmptyCellClick={undefined}
  onEventClick={undefined}
/>
```