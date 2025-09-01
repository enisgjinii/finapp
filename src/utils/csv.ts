export interface CSVRow {
  [key: string]: string;
}

export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row;
  });
};

export const normalizeDate = (dateStr: string): Date | null => {
  // Try different date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      // Assume YYYY-MM-DD if year is first, otherwise DD/MM/YYYY
      if (part3.length === 4) {
        return new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
      } else {
        return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
      }
    }
  }

  return null;
};

export const normalizeAmount = (amountStr: string): number => {
  // Handle different decimal separators and currency symbols
  const cleaned = amountStr
    .replace(/[^0-9.,-]/g, '') // Remove currency symbols
    .replace(',', '.'); // Convert comma to dot for decimal
  
  return parseFloat(cleaned) || 0;
};