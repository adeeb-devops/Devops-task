import React, { useCallback, useEffect, useMemo, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import { TbPassword } from "react-icons/tb";
import { toast } from "react-toastify";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { RiEditCircleLine } from "react-icons/ri";
import { LiaUserEditSolid } from "react-icons/lia";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import PageAccessPopup from "../../Components/Popups/PageAccessPopup";
import ConfirmationPopup from "../../Components/Popups/ConfirmationPopup";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";

type Distributor = {
  id: number;
  name: string;
  organization_id: string;
  distributor_id: string;
  distributor_key: string;
  role: string;
  phone_number: string;
  status: string;
  logo: string;
  permissions: string[];
  last_login: string | null;
  system_ip: string;
  wallet_token: string;
  wallet_url: string;
  sharing_type: string;
  sharing_percentage: number | null;
  points: number;
  created_by: string;
  created_by_admin: string | null;
  parent_id: number | null;
  createdAt: string;
  updatedAt: string;
};

interface Admin {
  id: number;
  clientName: string;
  organizationName: string;
  distributor_key: string;
  sharingType: string;
  role: string;
  games: string;
  area: string;
  points: number;
  status: string;
  referral: string;
  sharing_percentage: {
    self: string;
    client: string;
  };
  permissions: { [key: number]: string };
}
interface Password {
  password: string;
  confirmPassword: string;
}
const ClientSettings = () => {
  const [adminData, setadminData] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState<Admin | null>(null);
  const [openPasswordChange, setopenPasswordChange] = useState(false);
  const [openPageList, setopenPageList] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    sharingType: "",
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
  //create a state for password and confirm password
  const [password, setPassword] = useState<Password>({
    password: "",
    confirmPassword: "",
  });
  const ClosePageList = () => {
    setopenPageList(false);
    setSelectedPlayer(null);
  };
  const OpenPageList = (admin: Admin) => {
    setSelectedPlayer(admin);
    setopenPageList(true);
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

  const handleSubmit = () => {
    // console.log("Form Data:", formData);
    // console.log("Selected Pages:", selectedPages);
    const searchParams = {
      name: formData.clientName || undefined,
      sharing_type: formData.sharingType || undefined,
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
  const handleClear = () => {
    setFormData({
      sharingType: "",
      clientName: "",
      dateRange: ["", ""] as [string, string],
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };
  const handleStatusClick = (admin: Admin) => {
    const newStatus =
      admin.status.toLowerCase() === "active" ? "inactive" : "active";
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of user "${admin.clientName}" (ID: ${admin.id}) from ${admin.status} to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(admin.id, newStatus);
        setConfirmPopup(null);
      },
    });
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/${id}`,
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
  const handleAdminDelete = useCallback(async (admin: Admin) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/${admin.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Client record deleted successfully.");
        fetchadmin();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }, []);

  function Capitalize(str) {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  }
  const changePassword = async () => {
    if (!password || !selectedPlayer) return;

    if (password.password !== password.confirmPassword) {
      toast.error("Password and Confirm Password should be same");
      return;
    }

    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/password`,
        {
          id: selectedPlayer.id,
          distributor_key: password.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Password updated successfully");
        setPassword({
          password: "",
          confirmPassword: "",
        });
        fetchadmin();
        CloseChangepasswordContainer();
      }
    } catch (error) {
      toast.error("Failed to update Password");
      CloseChangepasswordContainer();
    }
  };

  const CloseChangepasswordContainer = () => {
    setopenPasswordChange(false);
    setSelectedPlayer(null);
    setPassword({
      password: "",
      confirmPassword: "",
    });
  };
  const openChangepasswordContainer = (player: Admin) => {
    setSelectedPlayer(player);
    setopenPasswordChange(true);
  };
  const fetchadmin = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/distributor`,
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
      // const InitialPermissions = pagePermissions.map;
      if (response.data.success) {
        // console.log("response", response);
        const data: Admin[] = response.data.data.distributor.map(
          (admin: Distributor) => ({
            id: admin.id,
            clientName: admin.name,
            points: admin.points,
            distributor_key: admin.distributor_key,
            mobileNumber: admin.phone_number,
            role: Capitalize(admin.role),
            status: Capitalize(admin.status),
            permissions: admin.permissions || {},
            sharingType: Capitalize(admin?.sharing_type),
            sharing_percentage: admin?.sharing_percentage,
          })
        );

        setadminData(data);
        setPagination((prev) => ({ ...prev, totalItems: response.data.count }));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error fetching data!");
    } finally {
      setIsLoading(false);
    }
  };
  // console.log("response admin", adminData);
  const handleUpdatePermissions = async (
    id: number,
    newPermissions: { [key: number]: string }
  ) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/${id}`,
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

  const columns: TableColumn<Admin>[] = [
    { header: "Client Name", accessor: "clientName" },
    { header: "Sharing Type", accessor: "sharingType" },
    { header: "Wallet Balance", accessor: "points" },
    {
      header: "Sharing Info",
      accessor: (admin: Admin) => (
        <div>{`${admin.sharing_percentage?.client} %`}</div>
      ),
    },
    {
      header: "Change Password",
      accessor: (admin: Admin) => (
        <div
          className="flex items-center gap-1"
          onClick={() => openChangepasswordContainer(admin)}
        >
          <TbPassword size={30} className="cursor-pointer hover:scale-125" />
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (admin: Admin) => (
        <div className="flex items-center">
          <span
            className={
              admin.status.toLowerCase() === "active"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {admin.status}
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
      header: "Action",
      accessor: (admin: Admin) => (
        <div className="flex">
          <RiEditCircleLine
            size={25}
            className="cursor-pointer hover:scale-125"
            onClick={() => OpenPageList(admin)}
          />
          <MdDelete
            size={25}
            className="text-red-700 ml-4 cursor-pointer hover:scale-125"
            onClick={() => handleAdminDelete(admin)}
          />
        </div>
      ),
    },
  ];
  useEffect(() => {
    fetchadmin();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);
  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };
  const sharingsOptions = useMemo(
    () => [
      { label: "Select sharing Type", value: "" },
      { label: "Turnover (On Bets)", value: "turnover" },
      { label: "Commission Sharing", value: "commission" },
      { label: "P&L Sharing", value: "plsharing" },
    ],
    []
  );

  return (
    <div>
      <h1 className="title">Manage Client</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Client Name",
              name: "clientName",
              type: "text",
              value: formData.clientName,
              onChange: handleInputChange,
              placeholder: "Enter Client  Name",
            },
            {
              label: "Sharing Type",
              name: "sharingType",
              type: "dropdown",
              value: formData.sharingType,
              onChange: handleInputChange,

              options: sharingsOptions,
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
          keyExtractor={(admin) => admin.id}
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
            handleUpdatePermissions(selectedPlayer.id, newPermissions)
          }
          userType="client"
        />
      )}
      {openPasswordChange && selectedPlayer && (
        <PopupsWithInput
          onClose={CloseChangepasswordContainer}
          fields={[
            {
              id: "password",
              label: "Old Password",
              type: "text",
              value: selectedPlayer.distributor_key,
            },
            {
              id: "password",
              label: "New Password",
              type: "text",
              value: password.password,
              onChange: (e) => {
                setPassword((prev) => ({ ...prev, password: e.target.value }));
              },
            },
            {
              id: "confirmPassword",
              label: "Confirm Password",
              type: "text",
              value: password.confirmPassword,
              onChange: (e) => {
                setPassword((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
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

export default ClientSettings;
