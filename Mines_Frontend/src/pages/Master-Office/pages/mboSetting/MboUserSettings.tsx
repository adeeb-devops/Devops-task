import React, { useCallback, useEffect, useMemo, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { RiEditCircleLine } from "react-icons/ri";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import PageAccessPopup from "../../Components/Popups/PageAccessPopup";
import ConfirmationPopup from "../../Components/Popups/ConfirmationPopup";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import { TbPassword } from "react-icons/tb";
type AdminUser = {
  id: number;
  phone_number: string;
  username: string;
  password: string;
  role: "master_admin" | "admin" | "user"; // Assuming possible roles
  permissions: string[]; // Array of permission strings
  parent_id: number; // ID of the parent admin/user
  status: "active" | "inactive" | "suspended"; // Assuming possible statuses
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
};

interface Admin {
  username: string;
  userId: number;
  mobileNumber: string;
  userRole: string;
  userStatus: string;
  // permissions: string[];
  permissions: { [key: number]: string };
}
interface Password {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const MboUserSettings = () => {
  const [password, setPassword] = useState<Password>({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [openPasswordChange, setopenPasswordChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setadminData] = useState<Admin[]>([]);
  const [searchParams, setSearchParams] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState<Admin | null>(null);
  const [openPageList, setopenPageList] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    userId: "",
    mobileNumber: "",
    role: "Manager",
    status: "",
    dateRange: ["", ""] as [string, string],
  });
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onSubmit: () => void;
  } | null>(null);

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
  const ClosePageList = () => {
    setopenPageList(false);
    setSelectedPlayer(null);
  };
  const OpenPageList = (admin: Admin) => {
    setSelectedPlayer(admin);
    setopenPageList(true);
  };
  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  const handleSubmit = async () => {
    // Validate phone number
    if (formData.mobileNumber) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.mobileNumber)) {
        toast.error("Invalid phone number! Please enter a valid number.");
        return;
      }
    }
    // console.log("Form Data:", formData);
    const searchParams = {
      username: formData.username || undefined,
      id: formData.userId || undefined,
      phone_number: formData.mobileNumber || undefined,
      status: formData.status || undefined,
      role: formData.role || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };
    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setSearchParams(searchParams);
      setPagination((prev) => ({ ...prev, page: 0 }));
    } else {
      toast.info(
        "No search criteria specified. Please enter at least one search parameter."
      );
    }
  };
  const handleStatusClick = (admin: Admin) => {
    const newStatus = admin.userStatus === "active" ? "Blocked" : "Active";
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of user "${admin.username}" (ID: ${admin.userId}) from ${admin.userStatus} to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(admin.userId, newStatus);
        setConfirmPopup(null);
      },
    });
  };
  const handleStatusUpdate = async (userId: number, newStatus: string) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/admin/${userId}`,
        { status: newStatus.toLowerCase() },
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
  const handleAdminDelete = useCallback(async (admin: Admin) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/admin/${admin.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Admin Deleted!");
        fetchadmin();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }, []);

  const fetchadmin = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/admin`,
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
        // console.log("Admin response", response);
        const data: Admin[] = response.data.data.admin.map(
          (admin: AdminUser) => ({
            username: admin.username,
            userId: admin.id,
            mobileNumber: admin.phone_number,
            userRole: admin.role,
            userStatus: admin.status,
            permissions: admin.permissions || {},
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
  // console.log("response admin", adminData);

  const handleUpdatePermissions = async (
    userId: number,
    newPermissions: { [key: number]: string }
  ) => {
    const token = sessionStorage.getItem("masterToken");
    // console.log("permission edit ", newPermissions)
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/admin/${userId}`,
        { permissions: newPermissions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Permissions updated successfully");
        fetchadmin(); // Refresh the admin data
      }
    } catch (error) {
      toast.error("Failed to update permissions");
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
  const handleClear = () => {
    setFormData({
      username: "",
      userId: "",
      mobileNumber: "",
      role: "",
      status: "",
      dateRange: ["", ""] as [string, string],
    });

    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };
  const roleOptions = useMemo(
    () => [
      { label: "Select Role", value: "manager" },
      { label: "Manager", value: "manager" },
      { label: "Master Admin", value: "master_admin" },
      { label: "Admin", value: "admin" },
    ],
    []
  );
  const statusOptions = useMemo(
    () => [
      { label: "Select Status", value: "" },
      { label: "Active", value: "active" },
      { label: "InActive", value: "blocked" },
    ],
    []
  );

  const CloseChangepasswordContainer = () => {
    setopenPasswordChange(false);
    setSelectedPlayer(null);
    setPassword({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };
  const changePassword = async () => {
    if (!password || !selectedPlayer) return;

    if (password.newPassword !== password.confirmNewPassword) {
      toast.error("Password and Confirm Password should be same");
      return;
    }

    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BACKEND}/admin/password`,
        {
          id: selectedPlayer.userId,
          // oldPassword: password.oldPassword,
          newPassword: password.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        fetchadmin();
        toast.success("Password updated successfully");
        setPassword({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        toast.error(response?.data?.message || "Failed to update Password!");
      }
    } catch (error) {
      toast.error("Failed to update Password");
      CloseChangepasswordContainer();
    } finally {
      CloseChangepasswordContainer();
    }
  };
  const openChangepasswordContainer = (player: Admin) => {
    setSelectedPlayer(player);
    setopenPasswordChange(true);
  };

  const columns: TableColumn<Admin>[] = [
    { header: "User Name", accessor: "username" },
    { header: "User ID", accessor: "userId" },
    { header: "Mobile Number", accessor: "mobileNumber" },
    { header: "User Role", accessor: "userRole" },
    {
      header: "User Status",
      accessor: (admin: Admin) => (
        <div className="flex items-center">
          <span
            className={
              admin.userStatus === "active" ? "text-green-600" : "text-red-600"
            }
          >
            {admin.userStatus}
          </span>
          <LiaUserEditSolid
            size={25}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleStatusClick(admin)}
          />
        </div>
      ),
    },
    {
      // onClick={() => OpenEditInfoadminEdit(admin)}
      header: "Actions",
      accessor: (admin: Admin) => (
        <div className="flex">
          <RiEditCircleLine
            size={25}
            className="cursor-pointer hover:scale-125"
            onClick={() => OpenPageList(admin)}
          />
          <TbPassword
            size={30}
            className="cursor-pointer mx-3 hover:scale-125"
            onClick={() => openChangepasswordContainer(admin)}
          />
          <MdDelete
            size={25}
            className="text-red-700 ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleAdminDelete(admin)}
          />
        </div>
      ),
    },
  ];
  useEffect(() => {
    fetchadmin();
  }, [
    pagination.page,
    pagination.rowsPerPage,
    handleAdminDelete,
    searchParams,
  ]);

  return (
    <div>
      <h1 className="title">MBO User Settings</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "User Name",
              name: "username",
              type: "text",
              value: formData.username,
              onChange: handleInputChange,
              placeholder: "Enter User Name",
            },
            {
              label: "User ID",
              name: "userId",
              type: "text",
              value: formData.userId,
              onChange: handleInputChange,
              placeholder: "Enter User Id",
            },
            {
              label: "Mobile Number",
              name: "mobileNumber",
              type: "number",
              value: formData.mobileNumber,
              onChange: handleInputChange,
              placeholder: "Enter Mobile Number",
              maxLength: 10,
            },
            {
              label: "User Role",
              name: "role",
              type: "dropdown",
              value: formData.role,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: roleOptions,
            },
            {
              label: "Status",
              name: "status",
              type: "dropdown",
              value: formData.status,
              onChange: handleInputChange,

              options: statusOptions,
            },
            {
              label: "Select Date Range",
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
          keyExtractor={(admin) => admin.userId}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showExport={false}
        />
      </div>
      {openPageList && selectedPlayer && (
        <PageAccessPopup
          onClose={ClosePageList}
          initialPermissions={selectedPlayer.permissions}
          onSubmit={(newPermissions) =>
            handleUpdatePermissions(selectedPlayer.userId, newPermissions)
          }
          userType="admin"
        />
      )}
      {openPasswordChange && selectedPlayer && (
        <PopupsWithInput
          onClose={CloseChangepasswordContainer}
          fields={[
            // {
            //   id: "oldPassword",
            //   label: "Old Password",
            //   type: "text",
            //   value: password.oldPassword,
            //   onChange: (e) => {
            //     setPassword((prev) => ({
            //       ...prev,
            //       oldPassword: e.target.value,
            //     }));
            //   },
            // },
            {
              id: "newPassword",
              label: "New Password",
              type: "text",
              value: password.newPassword,
              onChange: (e) => {
                setPassword((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }));
              },
            },

            {
              id: "confirmNewPassword",
              label: "Confirm Password",
              type: "text",
              value: password.confirmNewPassword,
              onChange: (e) => {
                setPassword((prev) => ({
                  ...prev,
                  confirmNewPassword: e.target.value,
                }));
              },
            },
          ]}
          dialogTitle="Change Password"
          buttons={[
            {
              name: "Update",
              onClick: changePassword,
              className: "SubmitButton",
            },
            {
              name: "Cancel",
              onClick: CloseChangepasswordContainer,
              className: "ClearButton",
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

export default MboUserSettings;
