// Simple test for the CSV date formatting functions

const formatDateForCsv = (date) => {
  if (!date) return "";
  try {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  } catch {
    return "";
  }
};

const formatTimeForCsv = (date) => {
  if (!date) return "";
  try {
    return date.toISOString().split("T")[1].split(".")[0]; // HH:MM:SS format
  } catch {
    return "";
  }
};

const formatDateTimeForCsv = (date) => {
  return {
    date: formatDateForCsv(date),
    time: formatTimeForCsv(date)
  };
};

// Test cases
const testDate = new Date('2024-01-15T14:30:45.123Z');
const nullDate = null;
const undefinedDate = undefined;

console.log('Test with valid date (2024-01-15T14:30:45.123Z):');
console.log('formatDateForCsv:', formatDateForCsv(testDate));
console.log('formatTimeForCsv:', formatTimeForCsv(testDate));
console.log('formatDateTimeForCsv:', formatDateTimeForCsv(testDate));

console.log('\nTest with null date:');
console.log('formatDateForCsv:', formatDateForCsv(nullDate));
console.log('formatTimeForCsv:', formatTimeForCsv(nullDate));
console.log('formatDateTimeForCsv:', formatDateTimeForCsv(nullDate));

console.log('\nTest with undefined date:');
console.log('formatDateForCsv:', formatDateForCsv(undefinedDate));
console.log('formatTimeForCsv:', formatTimeForCsv(undefinedDate));
console.log('formatDateTimeForCsv:', formatDateTimeForCsv(undefinedDate));

// Test that the format matches Excel expectations
console.log('\nExcel compatibility test:');
const exampleDate = new Date('2024-06-06T09:15:30.000Z');
const formatted = formatDateTimeForCsv(exampleDate);
console.log(`Date: ${formatted.date} (should be YYYY-MM-DD)`);
console.log(`Time: ${formatted.time} (should be HH:MM:SS)`);
console.log(`Excel can easily sort/filter these separate columns!`);