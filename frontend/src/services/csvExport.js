// csvExport.js

/**
 * Converts data to CSV format and triggers download
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Object} options - Configuration options
 * @param {Array} options.headers - Array of header objects with label and key properties
 * @param {string} options.filename - Name of the downloaded file (without extension)
 */
export const exportToCSV = (data, options = {}) => {
  if (!data || !data.length) {
    return;
  }

  const {
    headers = Object.keys(data[0]).map((key) => ({ label: key, key })),
    filename = "export",
  } = options;

  // Create CSV rows
  const csvRows = [
    // Header row
    headers.map((header) => header.label).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          let cellData = row[header.key];

          // Handle nested objects
          if (typeof cellData === "object" && cellData !== null) {
            cellData = cellData.name || JSON.stringify(cellData);
          }

          // Handle dates
          if (cellData instanceof Date) {
            cellData = cellData.toLocaleDateString();
          }

          // Convert to string and escape special characters
          cellData = String(cellData ?? "")
            .replace(/"/g, '""') // Escape quotes
            .replace(/\n/g, " "); // Replace newlines

          // Wrap in quotes if contains comma or quotes
          return cellData.includes(",") || cellData.includes('"')
            ? `"${cellData}"`
            : cellData;
        })
        .join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
