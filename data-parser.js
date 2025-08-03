const fs = require('fs');
const path = require('path');

// Data structures to store parsed information
const stations = new Set();
const months = new Set();
const daysOfWeek = new Set();
const years = new Set();
const timeSlots = new Set();
const routes = new Set();
const stationCoordinates = new Map();

// Statistics
let totalRows = 0;
let uniqueStations = 0;
let uniqueRoutes = 0;
let dataRange = { start: null, end: null };

console.log('Starting CSV Data Analysis...\n');

try {
  const csvPath = path.join(__dirname, 'data', 'subway_travel_times.csv');
  const fileStream = fs.createReadStream(csvPath, 'utf8');
  
  let buffer = '';
  let isFirstLine = true;
  let headers = [];
  
  fileStream.on('data', (chunk) => {
    buffer += chunk;
    
    // Process complete lines
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (isFirstLine) {
        headers = line.split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('Headers found:', headers);
        console.log('Number of columns:', headers.length);
        console.log('First few headers:', headers.slice(0, 10));
        isFirstLine = false;
        continue;
      }
      
      if (line.trim()) {
        processRow(line, headers);
      }
    }
  });
  
  fileStream.on('end', () => {
    // Process any remaining data in buffer
    if (buffer.trim() && !isFirstLine) {
      processRow(buffer, headers);
    }
    
    generateReport();
  });
  
  fileStream.on('error', (error) => {
    console.error('Error reading file:', error.message);
  });
  
} catch (error) {
  console.error('Error:', error.message);
}

function processRow(line, headers) {
  totalRows++;
  
  // Handle CSV parsing with potential commas in quoted fields
  const values = parseCSVLine(line);
  
  if (values.length < headers.length) {
    console.warn(`Row ${totalRows}: Insufficient columns (${values.length}/${headers.length})`);
    return;
  }
  
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
  });
  
  // Debug: Show first few rows
  if (totalRows <= 3) {
    console.log(`Row ${totalRows} data:`, row);
  }
  
  // Extract station information
  if (row.start_loc) {
    stations.add(row.start_loc);
  }
  if (row.end_loc) {
    stations.add(row.end_loc);
  }
  
  // Extract route information
  if (row.start_loc && row.end_loc) {
    const route = `${row.start_loc} → ${row.end_loc}`;
    routes.add(route);
  }
  
  // Extract time information
  if (row.month) {
    months.add(row.month);
  }
  if (row.day_of_week) {
    daysOfWeek.add(row.day_of_week);
  }
  if (row.time_of_day) {
    timeSlots.add(row.time_of_day);
  }
  
  // Track data range
  if (row.date) {
    const date = new Date(row.date);
    if (!isNaN(date.getTime())) {
      if (!dataRange.start || date < dataRange.start) {
        dataRange.start = date;
      }
      if (!dataRange.end || date > dataRange.end) {
        dataRange.end = date;
      }
    }
  }
  
  // Store station coordinates
  if (row.start_loc && row.start_lat && row.start_long) {
    stationCoordinates.set(row.start_loc, [parseFloat(row.start_lat), parseFloat(row.start_long)]);
  }
  if (row.end_loc && row.end_lat && row.end_long) {
    stationCoordinates.set(row.end_loc, [parseFloat(row.end_lat), parseFloat(row.end_long)]);
  }
  
  // Log progress every 10000 rows
  if (totalRows % 10000 === 0) {
    console.log(`Processed ${totalRows.toLocaleString()} rows...`);
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('CSV DATA ANALYSIS REPORT');
  console.log('='.repeat(60));
  
  console.log(`\nTotal Rows Processed: ${totalRows.toLocaleString()}`);
  
  console.log(`\nSTATION INFORMATION:`);
  console.log(`   Total Unique Stations: ${stations.size}`);
  console.log(`   Station List:`);
  const sortedStations = Array.from(stations).sort();
  sortedStations.forEach((station, index) => {
    console.log(`   ${(index + 1).toString().padStart(3)}. ${station}`);
  });
  
  console.log(`\nROUTE INFORMATION:`);
  console.log(`   Total Unique Routes: ${routes.size}`);
  console.log(`   Sample Routes (first 10):`);
  Array.from(routes).slice(0, 10).forEach((route, index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${route}`);
  });
  
  console.log(`\nTIME PERIODS:`);
  console.log(`   Months: ${Array.from(months).sort().join(', ')}`);
  console.log(`   Days of Week: ${Array.from(daysOfWeek).sort().join(', ')}`);
  console.log(`   Years: ${Array.from(years).sort().join(', ')}`);
  console.log(`   Time Slots: ${Array.from(timeSlots).sort().join(', ')}`);
  
  console.log(`\nDATA RANGE:`);
  if (dataRange.start && dataRange.end) {
    console.log(`   Start: ${dataRange.start.toDateString()}`);
    console.log(`   End: ${dataRange.end.toDateString()}`);
    console.log(`   Duration: ${Math.ceil((dataRange.end - dataRange.start) / (1000 * 60 * 60 * 24))} days`);
  }
  
  // Generate station coordinates (use real coordinates from CSV)
  console.log(`\nGENERATING STATION COORDINATES...`);
  const stationCoords = {};
  sortedStations.forEach((station, index) => {
    // Use real coordinates from CSV if available
    if (stationCoordinates.has(station)) {
      stationCoords[station] = stationCoordinates.get(station);
    } else {
      // Fallback to approximate coordinates if not found
      let lat = 40.7128; // NYC base latitude
      let lng = -74.0060; // NYC base longitude
      
      // Add some variation for stations without coordinates
      lat += (Math.random() - 0.5) * 0.1;
      lng += (Math.random() - 0.5) * 0.1;
      
      stationCoords[station] = [lat, lng];
    }
  });
  
  // Save the parsed data to JSON files
  const outputData = {
    stations: sortedStations,
    routes: Array.from(routes).sort(),
    months: Array.from(months).sort(),
    daysOfWeek: Array.from(daysOfWeek).sort(),
    years: Array.from(years).sort(),
    timeSlots: Array.from(timeSlots).sort(),
    dataRange: {
      start: dataRange.start ? dataRange.start.toISOString() : null,
      end: dataRange.end ? dataRange.end.toISOString() : null
    },
    stationCoordinates: stationCoords,
    statistics: {
      totalRows,
      uniqueStations: stations.size,
      uniqueRoutes: routes.size
    }
  };
  
  // Save to JSON file
  const outputPath = path.join(__dirname, 'parsed-station-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`\nData saved to: ${outputPath}`);
  console.log(`\nSUMMARY:`);
  console.log(`   • ${stations.size} unique stations`);
  console.log(`   • ${routes.size} unique routes`);
  console.log(`   • ${months.size} months of data`);
  console.log(`   • ${daysOfWeek.size} days of the week`);
  console.log(`   • ${years.size} years of data`);
  console.log(`   • ${timeSlots.size} time slots`);
  console.log(`   • ${totalRows.toLocaleString()} total data points`);
  
  console.log('\nAnalysis complete! Check parsed-station-data.json for the extracted data.');
} 