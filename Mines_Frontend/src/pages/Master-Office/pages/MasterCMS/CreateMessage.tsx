import React, { useCallback, useEffect, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import { MdDelete, MdEditNote } from "react-icons/md";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { toast } from "react-toastify";
import { LiaUserEditSolid } from "react-icons/lia";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import ConfirmationPopup from "../../Components/Popups/ConfirmationPopup";
import { Message } from "@mui/icons-material";
import axios from "axios";
import { useDistributors } from "../../Components/fetchDistributors";
// import axios from "axios";
interface Message {
  id: number;
  message_name: string;
  status: string;
  client_id: string;
  message_body: string;
  createdBy: string;
  dateTime: string;
}
const CreateMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<Message[]>([]);
  const [formData, setFormData] = useState({
    message_name: "",
    status: "",
    client_id: "",
    message_body: "",
  });

  const [openPageList, setopenPageList] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onSubmit: () => void;
  } | null>(null);

  const superDistributors = useDistributors("super_distributor", undefined);
  const columns: TableColumn<Message>[] = [
    { header: "Message Name", accessor: "message_name" },
    // { header: "Game Name", accessor: "game_name" },
    { header: "Message Body", accessor: "message_body" },
    {
      header: "Status",
      accessor: (message: Message) => (
        <div className="flex items-center">
          <span
            className={
              message.status === "Active" ? "text-green-600" : "text-red-600"
            }
          >
            {message.status}
          </span>
          <LiaUserEditSolid
            size={30}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleStatusClick(message)}
          />
        </div>
      ),
    },
    { header: "Created By", accessor: "createdBy" },
    { header: "Created Date", accessor: "dateTime" },
    {
      header: "Actions",
      accessor: (message: Message) => (
        <div className="flex">
          <MdEditNote
            size={30}
            className="hover:scale-125 mx-3"
            onClick={() => OpenPageList(message)}
          />
          <MdDelete
            size={30}
            className="text-red-700 cursor-pointer hover:scale-125"
            onClick={() => handleAdminDelete(message)}
          />
        </div>
      ),
    },
  ];
  const ClosePageList = () => {
    setopenPageList(false);
    setSelectedMessage(null);
  };
  const OpenPageList = (admin: Message) => {
    setSelectedMessage(admin);
    setopenPageList(true);
  };
  const handleStatusClick = (message: Message) => {
    const newStatus = message.status === "Active" ? "Inactive" : "Active";
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of message (ID: ${message.client_id}) from ${message.status} to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(message, newStatus);
        setConfirmPopup(null);
      },
    });
  };
  const handleStatusUpdate = async (message: Message, newStatus: string) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/cms/message/${message.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchadmin(); // Refresh the admin data
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  const handleAdminDelete = useCallback(async (admin: Message) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/cms/message/${admin.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Message Deleted");
        fetchadmin();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }, []);

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
  const handleInputChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const regex = /^[a-zA-Z0-9\s.,-]*$/;
    if (!regex.test(value)) {
      return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleMessage = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setSelectedMessage((prevMessage) =>
      prevMessage
        ? {
            ...prevMessage,
            [id]: value,
          }
        : null
    );
  };

  const handleClear = () => {
    setFormData({
      message_name: "",
      status: "",
      // game_name: "",
      client_id: "",
      message_body: "",
    });
    setIsLoading(false);
  };

  const SubmitMessageEdit = async () => {
    try {
      const token = sessionStorage.getItem("masterToken");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/cms/message/${
          selectedMessage?.id
        }`,
        {
          // ...selectedMessage,
          message_name: selectedMessage?.message_name,
          message_body: selectedMessage?.message_body,
          client_id: selectedMessage?.client_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // console.log("response msg update", response);
        toast.success("Message Updated");
        fetchadmin(); // Refresh the admin data
        ClosePageList(); // Close the popup after successful update
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };
  const handleSubmit = async () => {
    const token = sessionStorage.getItem("masterToken");
    try {
      // console.log("submitted msg", formData);
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/cms/message`,
        {
          message_name: formData.message_name,
          status: formData.status,

          client_id: formData.client_id,
          message_body: formData.message_body,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // console.log("response", response);
        toast.success("Message Created Successfully");
        handleClear();
        fetchadmin();
      }
    } catch (error) {
      toast.error("Please try again later!");
    }
    finally{
      setIsLoading(false);
    }
  };
  const fetchadmin = async () => {
    const token = sessionStorage.getItem("masterToken");
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/cms/message`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // console.log("response fetch", response);
        const data: Message[] = response.data.data.messages.map((item) => ({
          id: item.id,
          message_name: item.message_name,
          status: item.status,
          // game_name: item.game_name,
          client_id: item.client_id,
          message_body: item.message_body,
          createdBy: item.admin.username,
          dateTime: formatDateTime(item.createdAt),
        }));
        setTableData(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.count || 0,
        }));
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
    finally{
      setIsLoading(false);
    }
  };
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const statusOption = [
    { label: "Select Status", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  useEffect(() => {
    fetchadmin();
  }, [pagination.page, pagination.rowsPerPage]);

  return (
    <div>
      <h1 className="title">Create Message</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Message Name",
              name: "message_name",
              type: "text",
              value: formData.message_name,
              onChange: handleInputChange,
              placeholder: "Enter",
            },
            {
              label: "Status",
              name: "status",
              type: "dropdown",
              value: formData.status,
              onChange: handleInputChange,
              placeholder: "",
              options: statusOption,
            },
            {
              label: "Client Name",
              name: "client_id",
              type: "dropdown",
              value: formData.client_id,
              onChange: handleInputChange,
             options:superDistributors
            },
            {
              label: "Message Body",
              name: "message_body",
              type: "textarea",
              value: formData.message_body,
              onChange: handleInputChange,
              placeholder: "Enter the Message....",
            },
          ]}
          buttons={[
            {
              text: "Create",
              onClick: handleSubmit,
              className: "SubmitButton",
              disabled:isLoading
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
      {openPageList && selectedMessage && (
        <PopupsWithInput
          onClose={ClosePageList}
          fields={[
            {
              id: "message_name",
              label: "Message Name",
              type: "text",
              value: selectedMessage.message_name,
              onChange: handleMessage,
            },
            {
              id: "message_body",
              label: "Message Body",
              type: "text",
              value: selectedMessage.message_body,
              onChange: handleMessage,
            },
          ]}
          dialogTitle="Edit Message"
          buttons={[
            {
              name: "Update",
              onClick: SubmitMessageEdit,
              className:
                "w-24 h-[34px] outline-none rounded-md text-center bg-[#1d4ed8] text-white text-lg cursor-pointer",
            },
            {
              name: "Cancel",
              onClick: ClosePageList,
              className:
                "w-24 h-[34px] text-center rounded-md text-[#1d4ed8] border-[#1d4ed8] border-2 font-semibold text-lg hover:bg-neutral-100 cursor-pointer",
            },
          ]}
        />
      )}

      {confirmPopup && (
        <ConfirmationPopup
          isOpen={confirmPopup.isOpen}
          title={confirmPopup.title}
          message={confirmPopup.message}
          onClose={() => setConfirmPopup(null)}
          onSubmit={confirmPopup.onSubmit}
        />
      )}
    </div>
  );
};

export default CreateMessage;
