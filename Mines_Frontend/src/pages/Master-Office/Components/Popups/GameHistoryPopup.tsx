import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";

export interface HistoryItem {
  [key: string]: string | number;
}

export interface Column extends Omit<GridColDef, "field"> {
  id: string;
  label: string;
  colorCode?: boolean;
}

interface GameHistoryProps {
  onClose: () => void;
  title: string;
  data: HistoryItem[];
  columns: Column[];
}

const GameHistoryPopup: React.FC<GameHistoryProps> = ({
  onClose,
  title,
  data,
  columns,
}) => {
  const getColorClass = (value: number | string) => {
    if (typeof value === "number") {
      return value >= 0 ? "text-green-500" : "text-red-500";
    }
    if (typeof value === "string") {
      switch (value.toLowerCase()) {
        case "ongoing":
          return "text-black";
        case "completed":
          return "text-green-500";
        case "pending":
          return "text-yellow-500";
        case "failed":
          return "text-red-500";
        default:
          return "";
      }
    }
    return "";
  };

  const formattedColumns: GridColDef[] = columns.map((column) => ({
    ...column,
    field: column.id,
    headerName: column.label,
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      const value = params.value;
      return column.colorCode ? (
        <span className={`${getColorClass(value)} font-medium`}>{value}</span>
      ) : (
        value
      );
    },
  }));
  const gridHeight = data?.length > 0 ? "auto" : "180px";
  return (
    <Dialog onClose={onClose} open maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "black",
          fontWeight: "bold",
        }}
        className="bg-gray-200"
      >
        {title}
        <IconButton edge="end" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div style={{height:gridHeight, width: "100%" }} className="mt-4">
          <DataGrid
            rows={data}
            columns={formattedColumns}
            getRowId={(row) => row.sr || row.transactionID}
            // initialState={{
            //   pagination: {
            //     paginationModel: { pageSize: 5, page: 0 },
            //   },
            // }}
            // pageSizeOptions={[5, 10, 20]}
            // hideFooterPagination
            hideFooter
            autoHeight
            getRowHeight={() => "auto"}
            checkboxSelection={false}
            disableRowSelectionOnClick
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
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameHistoryPopup;
