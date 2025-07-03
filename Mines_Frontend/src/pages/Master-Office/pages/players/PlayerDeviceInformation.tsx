import React, { useState, useEffect, useMemo } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { toast } from "react-toastify";
import axios from "axios";
import useGetClients from "../../../hooks/useGetClients";

type PlayerDetails = {
  id: number;
  player_id: string;
  player_name: string;
  username: string;
  phone_number: string | null;
  organization_id: string;
  status: string;
  balance: number;
  player_type: string;
  total_net_sharing: number;
  sound: boolean;
  vibration: boolean;
  created_by: string;
  created_by_admin: string | null;
  super_distributor: string;
  distributor: string | null;
  sub_distributor: string | null;
  retailer: string | null;
  device_type: string;
  system_ip: string;
  app_type: string;
  device_model: string;
  browser: string;
  mobile_unique_id: string;
  last_login: string;
  createdAt: string;
  updatedAt: string;
  organizationHead: {
    name: string;
    distributor_id: string;
  };
  playerSuperDistributor: {
    name: string;
    distributor_id: string;
  };
  playerDistributor: string | null;
  playerSubDistributor: string | null;
  playerRetailer: string | null;
};

interface Player {
  id: number;
  playerId: string;
  playerName: string;
  playerType: string;
  systemIp: string;
  dateTime: string;
  client: string;
  lastLogin: string;
  deviceType: string;
  appType: string;
  deviceModel: string;
  browserName: string;
  mobileUniqueId: string;
}
const PlayerDeviceInformation = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    playerId: "",
    playerName: "",
    playerType: "",
    mobileNumber: "",
    client: "",
    dateRange: ["", ""] as [string, string],
  });
  const [playerCount, setplayerCount] = useState({
    activePlayers: 0,
    count: 0,
    inactivePlayers: 0,
  });
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  const player_typeOptions = useMemo(
    () => [
      { label: "Select Player Type", value: "" },
      { label: "RP", value: "real" },
      { label: "CP", value: "cash" },
    ],
    []
  );

  const { clients } = useGetClients({
    role: "super_distributor",
  });
  const player_clientOptions = useMemo(() => {
    if (!clients) return [{ label: "Select Client", value: "" }];

    return [
      { label: "Select Client", value: "" },
      ...clients.map((client) => ({
        label: client.name,
        value: client.distributor_id,
      })),
    ];
  }, [clients]);
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/player`,
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
        // console.log("response players", response);
        const data: Player[] = response.data.data.map(
          (player: PlayerDetails) => ({
            id: player.id,
            playerId: player.id,
            playerName: player.player_name,
            playerType: player.player_type === "real" ? "RP" : "CP",
            systemIp: player?.system_ip,
            dateTime: formatDateTime(player.createdAt),
            client: player.created_by,
            lastLogin: formatDateTime(player.last_login),
            deviceType: player?.device_type,
            appType: player?.app_type,
            deviceModel: player?.device_model,
            browserName: player?.browser,
            mobileUniqueId: player?.mobile_unique_id,
          })
        );
        setPlayers(data);
        setplayerCount(response.data);
        setPagination((prev) => ({ ...prev, totalItems: response.data.count }));
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
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
  useEffect(() => {
    fetchPlayers();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  const columns: TableColumn<Player>[] = [
    { header: "Player ID", accessor: "playerId" },
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Player Type", accessor: "playerType" },
    { header: "System IP", accessor: "systemIp" },
    { header: "Date And Time", accessor: "dateTime" },
    { header: "Client Name", accessor: "client" },
    { header: "Last Login Date & Time", accessor: "lastLogin" },
    { header: "Device Type", accessor: "deviceType" },
    { header: "App Type", accessor: "appType" },
    { header: "Device Model", accessor: "deviceModel" },
    { header: "Browser Name", accessor: "browserName" },
    { header: "Mobile Unique ID", accessor: "mobileUniqueId" },
  ];

  const handleSubmit = () => {
    // Validate phone number
    if (formData.mobileNumber) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.mobileNumber)) {
        toast.error("Invalid phone number! Please enter a valid number.");
        return;
      }
    }

    const searchParams = {
      player_name: formData.playerName || undefined,
      player_type: formData.playerType || undefined,
      playerId: formData.playerId || undefined,
      phone_number: formData.mobileNumber || undefined,
      super_distributor: formData.client || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };
    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      setSearchParams(searchParams);
      // fetchPlayers();
    } else {
      toast.info(
        "No search criteria specified. Please enter at least one search parameter."
      );
    }
  };
  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleClear = () => {
    setFormData({
      playerName: "",
      playerId: "",
      mobileNumber: "",
      client: "",
      playerType: "",
      dateRange: ["", ""] as [string, string],
    });

    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };
  return (
    <div>
      <h1 className="title">Player Device Information</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Player ID",
              name: "playerId",
              type: "number",
              value: formData.playerId,
              onChange: handleInputChange,
              placeholder: "Enter Player ID",
            },
            {
              label: "Client Player Name",
              name: "playerName",
              type: "text",
              value: formData.playerName,
              onChange: handleInputChange,
              placeholder: "Enter Player Name",
            },
            {
              label: "Player Type",
              name: "playerType",
              type: "dropdown",
              value: formData.playerType,
              onChange: handleInputChange,
              placeholder: "Select Player Status",
              options: player_typeOptions,
            },
            {
              label: "Select Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter",
              aligned: true,
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
              label: "Select Client",
              name: "client",
              type: "dropdown",
              value: formData.client,
              onChange: handleInputChange,
              placeholder: "Select Client",
              options: player_clientOptions,
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
      <div className="flex m-6 p-2 bg-gray-100 rounded-md justify-start items-center font-medium">
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md">
          Total Players: {playerCount.count}
        </div>
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md text-green-700">
          Total Active Players: {playerCount.activePlayers}
        </div>
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md text-red-700">
          Total Inactive Players: {playerCount.inactivePlayers}
        </div>
      </div>
      <div className="mx-4 mb-4">
        <ReusableTable
          data={players}
          columns={columns}
          keyExtractor={(player) => player.playerId}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default PlayerDeviceInformation;
