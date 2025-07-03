import React, { useState, useEffect, useMemo } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import { toast } from "react-toastify";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import axios from "axios";

type AdminUserRes = {
  id: number;
  username: string;
  last_login: string | null;
  ipaddress: string;
  actionName: string;
  createdAt: string;
  updatedAt: string;
};

interface Admin {
  srNo: number;
  username: string;
  systemId: string;
  action: string;
  dateTime: string;
  // role: string;
}

const ClientAdminLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setadminData] = useState<Admin[]>([]);
  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    user: "",
    ipaddress: "",
    // role: "",
    dateRange: ["", ""] as [string, string],
  });

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

  const handleSubmit = () => {
    // console.log("Form Data:", formData);
    const searchParams = {
      username: formData.user || undefined,
      // role: formData.role || undefined,
      ipAddress: formData.ipaddress || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };
    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      setSearchParams(searchParams);
      // fetchadmin();
    } else {
      toast.info(
        "No search criteria specified. Please enter at least one search parameter."
      );
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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleClear = () => {
    setFormData({
      user: "",
      ipaddress: "",
      // role: "",
      dateRange: ["", ""] as [string, string],
    });

    setSearchParams({});
  };
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };
  const fetchadmin = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/admin/AdminLogs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...searchParams,
            offset: pagination.page * pagination.rowsPerPage,
            limit: pagination.rowsPerPage,
          },
        }
      );

      if (response.data.success) {
        // console.log("response admin logs", response);
        const data: Admin[] = response.data.message.map(
          (admin: AdminUserRes, index) => ({
            srNo: index + 1,
            username: admin.username,
            systemId: admin.ipaddress,
            action: admin.actionName,
            dateTime: formatDateTime(admin.createdAt),
          })
        );
        setadminData(data);
        setPagination((prev) => ({ ...prev, totalItems: response.data.count }));
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
    } finally {
      setIsLoading(false);
    }
  };
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

  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  const columns: TableColumn<Admin>[] = [
    { header: "Client/Manager Name", accessor: "username" },
    { header: "System IP", accessor: "systemId" },
    { header: "Action Done", accessor: "action" },
    { header: "Date & Time", accessor: "dateTime" },
  ];
  // const roleOptions = useMemo(
  //   () => [
  //     { label: "Select Role", value: "" },
  //     { label: "Client", value: "client" },
  //     { label: "Manager", value: "manager" },
  //   ],
  //   []
  // );

  useEffect(() => {
    fetchadmin();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  return (
    <div>
      <h1 className="title">Admin Logs</h1>
      <div className="">        <InputWithButtons
          fields={[
            // {
            //   label: "Select Role",
            //   name: "role",
            //   type: "dropdown",
            //   value: formData.role,
            //   onChange: handleInputChange,
            //   options: roleOptions,
            // },
            {
              label: "Username",
              name: "user",
              type: "text",
              value: formData.user,
              onChange: handleInputChange,
              placeholder: "Enter Username",
            },
            {
              label: "IP Address",
              name: "ipaddress",
              type: "text",
              value: formData.ipaddress,
              onChange: handleInputChange,
              placeholder: "Enter IP Address",
            },
            {
              label: "Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              aligned: true,
            },
          ]}
          buttons={[
            {
              text: "Submit",
              onClick: handleSubmit,
              className: "SubmitButton",
              disabled: isLoading,
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
          data={adminData}
          columns={columns}
          keyExtractor={(admin) => admin.srNo}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showExport={false}
        />
      </div>
    </div>
  );
};

export default ClientAdminLogs;
