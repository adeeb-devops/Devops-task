import React, { useState } from "react";

interface CSVExportProps<T> {
  fetchData: () => Promise<T[]>; // Function to fetch data (e.g., API call)
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
  }[];
  filename?: string;
  buttonText?: string;
  className?: string;
}

function convertToCSV<T>(
  data: T[],
  columns: CSVExportProps<T>["columns"]
): string {
  const header = columns.map((col) => col.header).join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value =
          typeof col.accessor === "function"
            ? col.accessor(item)
            : item[col.accessor as keyof T];
        return `"${value}"`;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

function exportToCSV<T>(
  data: T[],
  columns: CSVExportProps<T>["columns"],
  filename: string
) {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function CSVExport<T>({
  fetchData,
  columns,
  filename = "export.csv",
  buttonText = "Export to CSV",
  className = "bg-gray-900 font-normal text-white p-1 px-2 rounded-md",
}: CSVExportProps<T>) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await fetchData(); // Fetch data from the API
      exportToCSV(data, columns, filename);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} className={className} disabled={loading}>
      {loading ? "Exporting..." : buttonText}
    </button>
  );
}

export default CSVExport;
