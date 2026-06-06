#!/usr/bin/env tsx

/**
 * Validation script for predefined filter segments
 * Verifies that all segment definitions are properly structured and valid
 */

import type { ColumnFilterType } from "@calcom/features/data-table";

import type { PredefinedSegmentDefinition } from "../repository/predefinedFilterSegments";
import { PredefinedFilterSegmentsService } from "../repository/predefinedFilterSegments";

interface ValidationError {
  segment: string;
  errors: string[];
}

function validateFilterDefinition(segment: PredefinedSegmentDefinition): string[] {
  const errors: string[] = [];
  
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
  segment.activeFilters.forEach((filter: any, index: number) => {
    if (!filter.f) {
      errors.push(`Filter ${index}: missing field 'f'`);
    }
    
    if (filter.v && (!filter.v.type || filter.v.data === undefined)) {
      errors.push(`Filter ${index}: invalid value structure`);
    }
  });
  
  return errors;
}

async function validatePredefinedSegments(): Promise<boolean> {
  console.log('🔍 Validating predefined filter segments...\n');
  
  const service = new PredefinedFilterSegmentsService();
  const tables = ['/insights', '/insights/routing', '/bookings/upcoming'];
  
  const allValidationErrors: ValidationError[] = [];
  let totalSegments = 0;
  
  for (const table of tables) {
    const segments = service.getPredefinedSegmentsForTable(table);
    totalSegments += segments.length;
    
    console.log(`📋 Table: ${table} (${segments.length} segments)`);
    
    segments.forEach((segment) => {
      const errors = validateFilterDefinition(segment);
      
      if (errors.length > 0) {
        console.log(`❌ ${segment.name}: `);
        errors.forEach(error => console.log(`   - ${error}`));
        
        allValidationErrors.push({
          segment: segment.name,
          errors
        });
      } else {
        console.log(`✅ ${segment.name} (${segment.category})`);
      }
    });
    console.log();
  }
  
  // Summary
  console.log(`📊 Validation Summary:`);
  console.log(`   Total segments: ${totalSegments}`);
  console.log(`   Validation errors: ${allValidationErrors.length}`);
  
  if (allValidationErrors.length === 0) {
    console.log('\n🎉 All predefined segments are valid!');
    
    // Show segments organized by category
    console.log('\n📂 Segments by category:');
    const segmentsByCategory: Record<string, PredefinedSegmentDefinition[]> = {};
    
    tables.forEach(table => {
      service.getPredefinedSegmentsForTable(table).forEach(segment => {
        if (!segmentsByCategory[segment.category]) {
          segmentsByCategory[segment.category] = [];
        }
        segmentsByCategory[segment.category].push(segment);
      });
    });
    
    Object.entries(segmentsByCategory).forEach(([category, segments]) => {
      console.log(`\n  ${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:`);
      segments.forEach(segment => {
        console.log(`    - ${segment.name} (${segment.tableIdentifier})`);
      });
    });
    
    return true;
  } else {
    console.log('\n❌ Validation failed! Please fix the errors above.');
    allValidationErrors.forEach(({ segment, errors }) => {
      console.log(`\n${segment}:`);
      errors.forEach(error => console.log(`  - ${error}`));
    });
    
    return false;
  }
}

async function main() {
  try {
    const isValid = await validatePredefinedSegments();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validatePredefinedSegments };