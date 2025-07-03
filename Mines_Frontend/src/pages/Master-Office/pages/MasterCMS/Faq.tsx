import React, { useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import axios from "axios";
import { toast } from "react-toastify";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { MdDelete, MdEditNote } from "react-icons/md";

interface TableRow {
  id: number;
  question: string;
  answer: string;
}

const Faq = () => {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const [selectedData, setSelectedData] = useState<TableRow | null>(null);
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

  const columns: TableColumn<TableRow>[] = [
    { header: "Question", accessor: "question" },
    { header: "Answer", accessor: "answer" },

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
        `${import.meta.env.VITE_APP_BACKEND}/cms/faq`,
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
      // console.log("response how cms get", response);
      if (response.data) {
        setTableData(response.data.data);

        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.count,
        }));
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
        `${import.meta.env.VITE_APP_BACKEND}/cms/faq`,

        {
          question: formData.question,
          answer: formData.answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("response submitted", response);
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
      question: "",
      answer: "",
    });
  };

  const handleEdit = (id: number) => {
    const data = tableData.find((row) => row.id === id);
    if (data) {
      setSelectedData(data);
      setOpenEditInfo(true);
    }
  };

  const closeEdit = () => {
    setOpenEditInfo(false);
    setSelectedData(null);
  };

  const submitEdit = async () => {
    const token = sessionStorage.getItem("masterToken");
    if (!selectedData) return;
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/cms/faq/${selectedData.id}`,
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
        closeEdit();
      }
    } catch (error) {
      console.error("Failed to update data:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/cms/faq/${id}`,
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
      <h1 className="title">FAQ</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Question",
              name: "question",
              type: "text",
              value: formData.question,
              onChange: handleInputChange,
              placeholder: "Enter",
            },
            {
              label: "Answer",
              name: "answer",
              type: "text",
              value: formData.answer,
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
      {openEditInfo && (
        <PopupsWithInput
          onClose={closeEdit}
          fields={[
            {
              name: "question",
              label: "Question",
              type: "text",
              value: selectedData.question,
              onChange: handleEditInputChange,
            },
            {
              name: "answer",
              label: "Answer",
              type: "text",
              value: selectedData.answer,
              onChange: handleEditInputChange,
            },
          ]}
          dialogTitle="Edit Information"
          buttons={[
            {
              name: "Update",
              onClick: submitEdit,
              className:
                "w-24 h-[34px] outline-none rounded-md text-center bg-[#1d4ed8] text-white text-lg cursor-pointer",
            },
            {
              name: "Cancel",
              onClick: closeEdit,
              className:
                "w-24 h-[34px] text-center rounded-md text-[#1d4ed8] border-[#1d4ed8] border-2 font-semibold text-lg hover:bg-neutral-100 cursor-pointer",
            },
          ]}
        />
      )}
    </div>
  );
};

export default Faq;
