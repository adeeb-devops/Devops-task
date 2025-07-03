import React, { useCallback, useEffect, useMemo, useState } from "react";

import { RiEditCircleLine } from "react-icons/ri";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import PageAccessPopup from "../../../Master-Office/Components/Popups/PageAccessPopup";
import ConfirmationPopup from "../../../Master-Office/Components/Popups/ConfirmationPopup";
interface Distributor {
  id: number;
  name: string;
  organization_id: string;
  distributor_id: string;
  distributor_key: string;
  role: string;
  phone_number: string;
  status: "active" | "inactive";
  logo: string | null;
  permissions: string[];
  last_login: string | null;
  system_ip: string;
  wallet_token: string | null;
  wallet_url: string | null;
  sharing_type: string | null;
  sharing_percentage: number | null;
  points: number;
  created_by: string;
  created_by_admin: string | null;
  parent_id: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Admin {
  id: number;
  username: string;
  userId: string;
  mobileNumber: string;
  userRole: string;
  status: string;
  superDistributor: string;
  permissions: { [key: number]: string };
}

const BoUserSettings = () => {
  const [adminData, setadminData] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState<Admin | null>(null);
  const [openPageList, setopenPageList] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    userId: "",
    mobileNumber: "",
    userStatus: "",
    role: "",
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
      name: formData.username || undefined,
      id: formData.userId || undefined,
      role: formData.role || undefined,
      phone_number: formData.mobileNumber || undefined,
      status: formData.userStatus || undefined,
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
      username: "",
      userId: "",
      mobileNumber: "",
      userStatus: "",
      dateRange: ["", ""] as [string, string],
      role: "",
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
      message: `Are you sure you want to change the status of user "${admin.superDistributor}" (ID: ${admin.id}) from ${admin.status} to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(admin.id, newStatus);
        setConfirmPopup(null);
      },
    });
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const token = sessionStorage.getItem("clientToken");
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
    const token = sessionStorage.getItem("clientToken");
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
        toast.success("Admin Deleted");
        fetchadmin();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }, []);

  function Capitalize(str) {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  }
  const formatGames = (games: string[]) => {
    if (!games || games.length === 0) return "No games";
    if (games.length === 1) return games[0];
    if (games.length === 2) return games.join(" and ");
    return games.slice(0, -1).join(", ") + ", and " + games[games.length - 1];
  };

  const fetchadmin = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("clientToken");

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
            userId: admin.id,
            username: admin.name,
            userRole: admin.role,
            superDistributor: admin.name,
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
    const token = sessionStorage.getItem("clientToken");
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
    { header: "User Name", accessor: "username" },
    { header: "User Id", accessor: "userId" },
    { header: "Mobile No.", accessor: "mobileNumber" },
    { header: "User Role", accessor: "userRole" },

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

  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  useEffect(() => {
    fetchadmin();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  const roles = [
    "super_distributor",
    "distributor",
    "sub_distributor",
    "retailer",
  ];

  const getDownwardRoles = (role) => {
    const roleIndex = roles.indexOf(role);

    if (roleIndex === -1) {
      return [];
    }

    return roles.slice(roleIndex + 1);
  };

  const clientRole = sessionStorage.getItem("clientRole");
  const availableRoles = getDownwardRoles(clientRole);

  const user_roles = useMemo(() => {
    // Start with the default "Select Role" option
    return [
      { label: "Select Role", value: "" },
      ...availableRoles.map((role) => ({
        label: role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        value: role,
      })),
    ];
  }, [availableRoles]);

  const sharingsOptions = useMemo(
    () => [
      { label: "Select User Status", value: "" },
      { label: "Active", value: "active" },
      { label: "InActive", value: "inactive" },
    ],
    []
  );

  return (
    <div>
      <h1 className="title">Bo User Settings</h1>
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
              label: "User Id",
              name: "userId",
              type: "number",
              value: formData.userId,
              onChange: handleInputChange,
              placeholder: "Enter User Id",
            },
            {
              label: "Mobile No.",
              name: "mobileNumber",
              type: "number",
              value: formData.mobileNumber,
              onChange: handleInputChange,
              placeholder: "Enter Mobile No.",
            },
            {
              label: "User Staus",
              name: "userStatus",
              type: "dropdown",
              value: formData.userStatus,
              onChange: handleInputChange,
              options: sharingsOptions,
            },
            {
              label: "Select Role",
              name: "role",
              type: "dropdown",
              value: formData.role,
              onChange: handleInputChange,
              options: user_roles,
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

export default BoUserSettings;
