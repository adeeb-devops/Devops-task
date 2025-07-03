import React, { useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import { toast } from "react-toastify";
import axios from "axios";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { MdDelete, MdEditNote } from "react-icons/md";

interface TableRow {
  id: number | string;
  rule_name: string;
  rules: string;
}

const Rules = () => {
  const [formData, setFormData] = useState({
    rule_name: "",
    rules: "",
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
    { header: "Rule Name", accessor: "rule_name" },
    { header: "Rules", accessor: "rules" },
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
        `${import.meta.env.VITE_APP_BACKEND}/cms/rules`,
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
      // console.log("response rules get",response);
      if (response.data.success) {
        setTableData(response.data.data.rules);
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

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("masterToken");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/cms/rules`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("response submitted terms ",response);
      if (response.data.success) {
        toast.success("Created Successfully!");
        fetchData();
        handleClear();
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
    }
  };

  const handleClear = () => {
    setFormData({
      // id: 0,
      rule_name: "",
      rules: "",
      // game_type:"",
    });
  };

  const handleEdit = (id: number | string) => {
    // console.log(`Edit row with id: ${id}`);
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
  const SubmitEdit = async () => {
    // console.log("Updated data ",formData);
    if (!selectedData) return;
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/cms/rules/${selectedData.id}`,
        selectedData,
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
        `${import.meta.env.VITE_APP_BACKEND}/cms/rules/${id}`,
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

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage]);

  return (
    <div>
      <h1 className="title">Rules</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Rule Name",
              name: "rule_name",
              type: "text",
              value: formData.rule_name,
              onChange: handleInputChange,
              placeholder: "Enter",
            },
            {
              label: "Rules",
              name: "rules",
              type: "textarea",
              value: formData.rules,
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
              name: "rule_name",
              label: "Rule Name",
              type: "text",
              value: selectedData.rule_name,
              onChange: handleEditInputChange,
            },
            {
              name: "rules",
              label: "Rules",
              type: "textarea",
              value: selectedData.rules,
              onChange: handleEditInputChange,
            },
          ]}
          dialogTitle="Edit Rules"
          buttons={[
            {
              name: "Update",
              onClick: SubmitEdit,
              className:
                "w-24 h-[34px] outline-none rounded-md text-center bg-[#1d4ed8] text-white text-lg cursor-pointer",
            },
            {
              name: "Cancel",
              onClick: CloseEdit,
              className:
                "w-24 h-[34px] text-center rounded-md text-[#1d4ed8] border-[#1d4ed8] border-2 font-semibold text-lg hover:bg-neutral-100 cursor-pointer",
            },
          ]}
        />
      )}
    </div>
  );
};

export default Rules;
