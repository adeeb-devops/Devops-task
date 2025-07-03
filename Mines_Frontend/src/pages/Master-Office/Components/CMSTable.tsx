import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton } from "@mui/material";
import { MdDelete, MdEditNote } from "react-icons/md";

interface TableRow {
  id: number | string;
  [key: string]: any;
}

interface CMSTableProps {
  data: TableRow[];
  columns: GridColDef[];
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  pagination: {
    page: number;
    rowsPerPage: number;
    totalItems: number;
  };
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CMSTable: React.FC<CMSTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  pagination,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    renderCell: (params: GridRenderCellParams<TableRow>) => (
      <div>
        <IconButton onClick={() => onEdit(params.row.id)}>
          <MdEditNote color="black" size={30} />
        </IconButton>
        <IconButton onClick={() => onDelete(params.row.id)}>
          <MdDelete color="#d32f2f" size={30} />
        </IconButton>
      </div>
    ),
  };

  const allColumns: GridColDef[] = [
    ...columns.map(col => ({
      ...col,
      flex: 1,
      minWidth: 100,
    })),
    actionColumn
  ];

  const handlePaginationModelChange = (newModel: { page: number, pageSize: number }) => {
    if (newModel.pageSize !== pagination.rowsPerPage) {
      onChangeRowsPerPage({ target: { value: newModel.pageSize.toString() } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChangePage({} as unknown, newModel.page);
    }
  };

  const gridHeight = data.length > 0 ? 'auto' : '180px';

  return (
    <div style={{ height: gridHeight, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={allColumns}
        paginationModel={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
        }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[5, 10, 25]}
        rowCount={pagination.totalItems}
        paginationMode="server"
        disableRowSelectionOnClick
        autoHeight
        sx={{
          width: "100%",
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#f3f4f6",
            color: "#374151",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
      />
    </div>
  );
};

export default CMSTable;