# Predefined Filter Segments

This feature provides one-click access to commonly used filter combinations for data tables in analytics and reporting views. Instead of manually setting up filters every time, users can select from predefined segments that contain popular filter combinations.

## Overview

Predefined filter segments are system-defined, read-only filter combinations that appear in the segment selector dropdown of data tables. They are organized by category and marked with a sparkle icon (✨) to distinguish them from user-created segments.

## Features

- **One-click filtering**: Apply common filter combinations instantly
- **Categorized organization**: Segments are grouped by category (Time Ranges, Status Filters, etc.)
- **Read-only**: Cannot be edited or deleted by users
- **Universal access**: Available to all users across teams and organizations
- **Visual distinction**: Marked with sparkle icons in the UI

## Available Predefined Segments

### Booking Insights (`/insights`)

#### Time Ranges
- **Recent Bookings**: Last 7 days of bookings
- **This Month**: Last 30 days of bookings

#### Status Filters  
- **Confirmed Bookings**: Only accepted bookings
- **Cancelled Bookings**: Cancelled and rejected bookings
- **No Shows**: Bookings marked as no-show

### Routing Form Insights (`/insights/routing`)

#### Time Ranges
- **Recent Responses**: Last 7 days of form responses  
- **This Week**: Last 7 days of responses

#### Routing Status
- **Successful Routes**: Responses that resulted in bookings
- **Failed Routes**: Responses that didn't result in bookings

### Booking List (`/bookings/upcoming`)

#### Time Ranges
- **Today's Bookings**: Bookings scheduled for today
- **This Week**: Bookings in the last 7 days
- **Recent Cancellations**: Cancelled bookings in last 30 days

## Technical Implementation

### Database Schema

The `FilterSegment` model was extended with:
- `scope: SYSTEM` - New scope type for predefined segments
- `isSystem: boolean` - Marks segments as system-defined
- `category: string` - Organizes segments into categories
- `userId: nullable` - Optional for system segments

### Backend Architecture

```
PredefinedFilterSegmentsService
├── Segment definitions (categories, filters, table mappings)
├── Creation methods (createPredefinedSegment, seedPredefinedSegments)
└── Query methods (getPredefinedSegmentsForTable, getPredefinedSegmentsByCategory)

FilterSegmentRepository
├── Extended to handle SYSTEM scope segments
├── Read-only access (no edit/delete for system segments)  
└── Automatic inclusion in segment queries
```

### UI Components

The `FilterSegmentSelect` component automatically:
- Groups system segments by category at the top
- Shows sparkle icons for predefined segments
- Hides edit/delete actions for system segments
- Preserves existing user/team segment functionality

## Usage

### For Users

1. Navigate to any analytics or reporting view with a data table
2. Click the "Segment" dropdown button in the toolbar
3. Select from predefined segments at the top (marked with ✨)
4. The table will instantly apply the predefined filters

### For Developers

#### Adding New Predefined Segments

Edit `packages/lib/server/repository/predefinedFilterSegments.ts`:

```typescript
// Add to appropriate array (bookingInsightsSegments, routingInsightsSegments, etc.)
{
  name: "My New Segment",
  tableIdentifier: "/insights",
  category: "my_category",
  activeFilters: [
    {
      f: "fieldName",
      v: {
        type: ColumnFilterType.SINGLE_SELECT,
        data: "filterValue",
      },
    },
  ],
  perPage: 50,
}
```

#### Seeding Segments

Run the seed script to populate predefined segments:

```bash
tsx packages/lib/server/scripts/seed-predefined-segments.ts
```

#### Database Migration

Apply the schema changes:

```sql
-- Add SYSTEM scope
ALTER TYPE "FilterSegmentScope" ADD VALUE 'SYSTEM';

-- Add new fields
ALTER TABLE "FilterSegment" 
  ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "category" TEXT,
  ALTER COLUMN "userId" DROP NOT NULL;

-- Add index for system segments  
CREATE INDEX "FilterSegment_scope_tableIdentifier_category_idx" 
  ON "FilterSegment"("scope", "tableIdentifier", "category");
```

## Filter Structure

Each predefined segment follows this structure:

```typescript
interface PredefinedSegmentDefinition {
  name: string;                    // Display name
  tableIdentifier: string;         // Target table/view path
  category: string;                // Grouping category
  activeFilters: ActiveFilter[];   // Filter definitions
  sorting?: SortingState[];        // Optional sorting
  columnVisibility?: Record<string, boolean>; // Optional column config
  columnSizing?: Record<string, number>;      // Optional column sizes
  perPage: number;                 // Results per page
  searchTerm?: string;             // Optional search term
}
```

### Filter Types

Predefined segments can use any supported filter type:

- `DATE_RANGE`: Time-based filters with presets
- `MULTI_SELECT`: Multiple value selection  
- `SINGLE_SELECT`: Single value selection
- `TEXT`: Text-based filters with operators
- `NUMBER`: Numeric comparisons

## Benefits

### For Users
- **Faster workflow**: Skip manual filter setup for common queries
- **Consistency**: Standardized filter combinations across teams
- **Discovery**: Find useful filter patterns you might not have considered

### For Teams  
- **Onboarding**: New users can quickly access relevant data views
- **Best practices**: Promote consistent data analysis patterns
- **Efficiency**: Reduce time spent on repetitive filter configuration

## Validation

Use the validation script to verify segment definitions:

```bash
node validate-predefined-segments.js
```

This checks:
- Required fields are present and valid
- Filter structure is correct  
- Data types match expectations
- No validation errors exist

## Future Enhancements

Potential improvements include:
- Admin UI for managing predefined segments
- Usage analytics for popular segments
- Dynamic segments based on user context
- Import/export functionality for segment definitions
- A/B testing different segment configurations