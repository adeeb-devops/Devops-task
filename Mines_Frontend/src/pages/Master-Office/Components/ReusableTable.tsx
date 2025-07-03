import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridRowSelectionModel,
  GridRowId,
} from "@mui/x-data-grid";

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  cellClassName?: string;
  width?: number;
  type?: "text" | "paragraph" | "image";
  blur?: boolean;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  // keyExtractor: (item: T) => string | number;
  // keyExtractor: (item: T, index?: number) => React.Key;
  pagination: {
    page: number;
    rowsPerPage: number;
    totalItems: number;
  };
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showCheckbox?: boolean;
  // selectedRows?: Set<string | number>;
  // onRowSelect?: (id: string | number, isSelected: boolean) => void;
  keyExtractor: (item: T) => GridRowId;
  selectedRows?: Set<GridRowId>;
  onRowSelect?: (id: GridRowId, isSelected: boolean) => void;
  exportFilename?: string;
  showExport?: boolean;
}

function convertToCSV<T>(data: T[], columns: TableColumn<T>[]): string {
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
  columns: TableColumn<T>[],
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

function ReusableTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  onChangePage,
  onChangeRowsPerPage,
  showCheckbox = false,
  selectedRows = new Set(),
  onRowSelect,
  exportFilename = "export.csv",
  showExport = false,
}: ReusableTableProps<T>) {

  const gridColumns: GridColDef[] = columns.map((col) => ({
    field:
      typeof col.accessor === "string"
        ? col.accessor
        : col.header.toLowerCase().replace(/\s+/g, "_"),
    headerName: col.header,
    width: col.width,
    flex: col.width ? undefined : 1,
    cellClassName: `${col.cellClassName || ""} ${
      col.blur ? "blurred-cell" : ""
    }`.trim(),
    renderCell: (params: GridRenderCellParams) => {
      const value =
        typeof col.accessor === "function"
          ? col.accessor(params.row as T)
          : params.value;
      if (col.type === "image" && value) {
        return (
          <img
            src={value as string}
            alt="Cell content"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        );
      }
      return value;
    },
  }));

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    // This is the key change
    onChangePage({} as unknown, model.page);
    if (model.pageSize !== pagination.rowsPerPage) {
      onChangeRowsPerPage({
        target: { value: model.pageSize.toString() },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  const handleSelectionModelChange = (newSelectionModel: GridRowSelectionModel) => {
    if (onRowSelect) {
      const oldSelection = new Set(selectedRows);
      newSelectionModel.forEach((id) => {
        if (!oldSelection.has(id)) onRowSelect(id, true);
        oldSelection.delete(id);
      });
      oldSelection.forEach((id) => onRowSelect(id, false));
    }
  };
  const handleExport = () => {
    exportToCSV(data, columns, exportFilename);
  };
  const gridHeight = data?.length > 0 ? "auto" : "180px";

  return (
    <div>
      {showExport && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExport}
            className="bg-color font-medium text-white p-2 px-4 rounded-md"
          >
            Export to CSV
          </button>
        </div>
      )}

      <div style={{ height: gridHeight, width: "100%" }}>
        <DataGrid
          rows={data.map((item) => ({ ...item, id: keyExtractor(item) }))}
          columns={gridColumns}
          paginationMode="server"
          rowCount={pagination.totalItems}
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.rowsPerPage,
          }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[50, 100,150]}
          checkboxSelection={showCheckbox}
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          rowSelectionModel={Array.from(selectedRows)}
          onRowSelectionModelChange={handleSelectionModelChange}
          autoHeight
          getRowHeight={() => "auto"}
          sx={{
            "& .MuiDataGrid-cell": {
              whiteSpace: "normal",
              lineHeight: "1.5em",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f3f4f6",
              color: "#374151",
              fontWeight: "bold",
              borderBottom: "2px solid #e0e0e0",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              width: "100%",
              textAlign: "center",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "center",
            },
            "& .blurred-cell": {
              filter: "blur(4px)",
              transition: "filter 0.3s ease",
              // transition: "filter 0.3s ease, border 0.3s ease",
              // border: '2px solid #e0e0e0',  // Add a border to blurred cells
              // borderRadius: '4px',
            },
            "& .blurred-cell:hover": {
              filter: "blur(0)",
              // border: '2px solid transparent',
            },
          }}
        />
      </div>
    </div>
  );
}

export default ReusableTable;
