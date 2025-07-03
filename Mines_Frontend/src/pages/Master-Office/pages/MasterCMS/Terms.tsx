import React, { useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import { toast } from "react-toastify";
import axios from "axios";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { MdDelete, MdEditNote } from "react-icons/md";

interface TableRow {
  id: number | string;
  terms: string;
}

const Terms = () => {
  const [formData, setFormData] = useState({
    terms: "",
  });
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [selectedData, setSelectedData] = useState<TableRow | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

  const columns: TableColumn<TableRow>[] = [
    // { header: "ID", accessor: "id" },

    { header: "Terms", accessor: "terms", type: "paragraph" },
    {
      header: "Actions",
      accessor: (item) => (
        <div className="flex">
          <MdEditNote
            color="black"
            size={30}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleEdit(item.id)}
          />

          <MdDelete
            color="#d32f2f"
            size={30}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPagination((prev) => ({
      ...prev,
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };
  const fetchData = async () => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/cms/termsAndConditions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: pagination.rowsPerPage,
            offset: pagination.page * pagination.rowsPerPage,
          },
        }
      );
      // console.log("response terms get", response);
      if (response.data.success) {
        setTableData(response.data.data.terms);
        setPagination((prev) => ({ ...prev, totalItems: response.data.count }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const regex = /^[a-zA-Z0-9\s.,-]*$/;
    if (!regex.test(value)) {
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("masterToken");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/cms/termsAndConditions`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("response submitted terms ", response);
      // console.log("response submitted terms ", response);
      if (response.data.success) {
        toast.success("Created Successfully!");
        fetchData();
        handleClear();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const handleClear = () => {
    setFormData({
      // id: "",
      terms: "",
      // game_type: "",
    });
  };

  const handleEdit = (id: number | string) => {
    const data = tableData.find((row) => row.id === id);
    if (data) {
      setSelectedData(data);
      setOpenEditInfo(true);
    }
  };

  const CloseEdit = () => {
    setOpenEditInfo(false);
    setSelectedData(null);
  };
  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setSelectedData((prevData) =>
      prevData ? { ...prevData, [name]: value } : null
    );
  };

  const SubmitEdit = async () => {
    // console.log("Updated data ", formData);
    if (!selectedData) return;
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/cms/termsAndConditions/${
          selectedData.id
        }`,
        {
          terms: selectedData.terms,
          // game_type: selectedData.game_type
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Edit Successfully!");
        fetchData();
        CloseEdit();
      }
    } catch (error) {
      console.error("Failed to update data:", error);
    }
  };
  const handleDelete = async (id: number | string) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/cms/termsAndConditions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Deleted Successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete data:", error);
    }
  };

  return (
    <div>
      <h1 className="title">Terms & Conditions</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Terms",
              name: "terms",
              type: "textarea",
              value: formData.terms,
              onChange: handleInputChange,
              placeholder: "Enter",
            },
          ]}
          buttons={[
            {
              text: "Submit",
              onClick: handleSubmit,
              className: "SubmitButton",
            },
            {
              text: "Clear",
              onClick: handleClear,
              className: "ClearButton",
            },
          ]}
        />
      </div>
      <div className="mx-4 my-4">
        <ReusableTable
          data={tableData}
          columns={columns}
          keyExtractor={(message) => message.id}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
      {openEditInfo && selectedData && (
        <PopupsWithInput
          onClose={CloseEdit}
          fields={[
            {
              name: "terms",
              label: "Terms",
              type: "textarea",
              value: selectedData.terms,
              onChange: handleEditInputChange,
            },
            // {
            //   name: "game_type",
            //   label: "Game Type",
            //   type: "dropdown",
            //   value: selectedData.game_type,
            //   onChange: handleEditInputChange,
            //   options: game_typeOptions,
            // },
          ]}
          dialogTitle="Edit Terms"
          buttons={[
            {
              name: "Update",
              onClick: SubmitEdit,
              className: "SubmitButton",
            },
            {
              name: "Cancel",
              onClick: CloseEdit,
              className: "ClearButton",
            },
          ]}
        />
      )}
    </div>
  );
};

export default Terms;
