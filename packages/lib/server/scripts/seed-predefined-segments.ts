#!/usr/bin/env tsx

/**
 * Script to seed predefined filter segments for analytics and reporting views.
 * This script creates common filter segments that users frequently need.
 * 
 * Usage:
 *   tsx seed-predefined-segments.ts
 */

import { PredefinedFilterSegmentsService } from "../repository/predefinedFilterSegments";

async function main() {
  console.log("🌱 Starting predefined filter segments seeding...");
  
  const service = new PredefinedFilterSegmentsService();
  
  try {
    await service.seedPredefinedSegments();
    console.log("✅ Predefined filter segments seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding predefined filter segments:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
}

export { main as seedPredefinedSegments };