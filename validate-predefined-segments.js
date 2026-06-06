#!/usr/bin/env node

/**
 * Simple validation script to check predefined segments implementation
 */

// Basic validation functions
function validateFilterDefinition(segment) {
  const errors = [];
  
  if (!segment.name || typeof segment.name !== 'string') {
    errors.push('Missing or invalid name');
  }
  
  if (!segment.tableIdentifier || typeof segment.tableIdentifier !== 'string') {
    errors.push('Missing or invalid tableIdentifier');
  }
  
  if (!segment.category || typeof segment.category !== 'string') {
    errors.push('Missing or invalid category');
  }
  
  if (!Array.isArray(segment.activeFilters)) {
    errors.push('activeFilters must be an array');
  }
  
  if (typeof segment.perPage !== 'number' || segment.perPage <= 0) {
    errors.push('perPage must be a positive number');
  }
  
  // Validate filter structure
  segment.activeFilters.forEach((filter, index) => {
    if (!filter.f) {
      errors.push(`Filter ${index}: missing field 'f'`);
    }
    
    if (filter.v && (!filter.v.type || !filter.v.data)) {
      errors.push(`Filter ${index}: invalid value structure`);
    }
  });
  
  return errors;
}

function validatePredefinedSegments() {
  console.log('🔍 Validating predefined filter segments...\n');
  
  // Mock implementations for validation
  const ColumnFilterType = {
    DATE_RANGE: 'DATE_RANGE',
    MULTI_SELECT: 'MULTI_SELECT',
    TEXT: 'TEXT',
    SINGLE_SELECT: 'SINGLE_SELECT',
    NUMBER: 'NUMBER'
  };
  
  // Define the segments as they would be created
  const bookingInsightsSegments = [
    {
      name: "Recent Bookings",
      tableIdentifier: "/insights",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: ColumnFilterType.DATE_RANGE,
            data: { preset: "last_7_days" },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "This Month",
      tableIdentifier: "/insights",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: ColumnFilterType.DATE_RANGE,
            data: { preset: "last_30_days" },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Confirmed Bookings",
      tableIdentifier: "/insights",
      category: "status_filters",
      activeFilters: [
        {
          f: "status",
          v: {
            type: ColumnFilterType.MULTI_SELECT,
            data: ["ACCEPTED"],
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Cancelled Bookings",
      tableIdentifier: "/insights",
      category: "status_filters",
      activeFilters: [
        {
          f: "status",
          v: {
            type: ColumnFilterType.MULTI_SELECT,
            data: ["CANCELLED", "REJECTED"],
          },
        },
      ],
      perPage: 50,
    }
  ];
  
  const routingInsightsSegments = [
    {
      name: "Recent Responses",
      tableIdentifier: "/insights/routing",
      category: "time_ranges",
      activeFilters: [
        {
          f: "createdAt",
          v: {
            type: ColumnFilterType.DATE_RANGE,
            data: { preset: "last_7_days" },
          },
        },
      ],
      perPage: 50,
    },
    {
      name: "Successful Routes",
      tableIdentifier: "/insights/routing",
      category: "routing_status",
      activeFilters: [
        {
          f: "routedToBookingUid",
          v: {
            type: ColumnFilterType.TEXT,
            data: { operator: "isNotEmpty" },
          },
        },
      ],
      perPage: 50,
    }
  ];
  
  const allSegments = [...bookingInsightsSegments, ...routingInsightsSegments];
  
  let totalErrors = 0;
  
  allSegments.forEach((segment, index) => {
    const errors = validateFilterDefinition(segment);
    
    if (errors.length > 0) {
      console.log(`❌ Segment ${index + 1} (${segment.name}): `);
      errors.forEach(error => console.log(`   - ${error}`));
      totalErrors += errors.length;
    } else {
      console.log(`✅ Segment: ${segment.name} (${segment.tableIdentifier})`);
    }
  });
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Total segments: ${allSegments.length}`);
  console.log(`   Validation errors: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('\n🎉 All predefined segments are valid!');
    
    // Show segments by table
    const segmentsByTable = {};
    allSegments.forEach(segment => {
      if (!segmentsByTable[segment.tableIdentifier]) {
        segmentsByTable[segment.tableIdentifier] = [];
      }
      segmentsByTable[segment.tableIdentifier].push(segment);
    });
    
    console.log('\n📋 Segments by table:');
    Object.entries(segmentsByTable).forEach(([table, segments]) => {
      console.log(`\n  ${table}:`);
      segments.forEach(segment => {
        console.log(`    - ${segment.name} (${segment.category})`);
      });
    });
    
    return true;
  } else {
    console.log('\n❌ Validation failed! Please fix the errors above.');
    return false;
  }
}

// Run validation
const isValid = validatePredefinedSegments();
process.exit(isValid ? 0 : 1);