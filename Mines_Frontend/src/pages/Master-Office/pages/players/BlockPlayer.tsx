import React, { useState, useEffect, useMemo } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";

import axios from "axios";
import { toast } from "react-toastify";
import { GridRowId } from "@mui/x-data-grid";
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
  username: string;
  playerName: string;
  playerId: string;
  playerType: string;
  mobileNumber: string;
  client: string;
  playerStatus: string;
}

const BlockPlayer = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setplayerCount] = useState({
    activePlayers: 0,
    count: 0,
    inactivePlayers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [selectedRows, setSelectedRows] = useState<Set<GridRowId>>(new Set());
  const [formData, setFormData] = useState({
    playerId: "",
    playerName: "",
    playerType: "",
    mobileNumber: "",
    client: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

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
      playerId: "",
      mobileNumber: "",
      playerName: "",
      playerType: "",
      client: "",
      dateRange: ["", ""] as [string, string],
    });
    setSelectedRows(new Set());
    setSearchParams({});
  };

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
      id: formData.playerId || undefined,
      phone_number: formData.mobileNumber || undefined,
      player_type: formData.playerType || undefined,
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
  const handleRowSelect = (id: GridRowId, isSelected: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleAllBlock = async () => {
    // console.log("handled ", ...selectedRows);
    try {
      // active or inactive
      const selectedPlayer = players.find(
        (player) => player.playerId === [...selectedRows][0]
      );

      const token = sessionStorage.getItem("masterToken");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/player/changeStatus`,
        {
          playerIds: [...selectedRows],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("player block ", response);
      if (response.data.success) {
        fetchPlayers();
        toast.success("Player Status Updated Successfully!");
        handleClear();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something Went wrong!");
    }
  };

  function Capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
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
        // console.log(response.data.data);

        const data: Player[] = response.data.data.map(
          (player: PlayerDetails) => ({
            id: player.id,
            username: player.username,
            playerName: player.player_name,
            playerType: player.player_type === "real" ? "RP" : "CP",
            playerId: player?.id,
            mobileNumber: player.phone_number,
            client: player?.playerSuperDistributor?.name,
            retailer: player.created_by,
            playerStatus: Capitalize(player.status),
          })
        );
        setPlayers(data);
        setplayerCount(response.data);
        setPagination((prev) => ({ ...prev, totalItems: response.data.count }));
      }
    } catch (error) {
      console.log("Error fetching admin:", error);
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
  const columns: TableColumn<Player>[] = [
    { header: "Username", accessor: "username" },
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Player ID", accessor: "playerId" },
    { header: "Player Type", accessor: "playerType" },
    { header: "Mobile Number", accessor: "mobileNumber" },
    { header: "Client Name", accessor: "client" },

    {
      header: "Status",
      accessor: (player: Player) => (
        <span
          className={
            player.playerStatus.toLowerCase() === "active"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {player.playerStatus}
        </span>
      ),
    },
  ];
  useEffect(() => {
    fetchPlayers();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);
  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };
  const player_typeOptions = useMemo(
    () => [
      { label: "Select Player Type", value: "" },
      { label: "RP", value: "real" },
      { label: "CP", value: "cash" },
    ],
    []
  );

  return (
    <div>
      <h1 className="title">Block Player</h1>
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
      <div className="flex m-6 p-2 bg-gray-100 rounded-md justify-start items-center font-medium">
        {selectedRows.size > 0 && (
          <div
            className="mx-4 bg-amber-700 text-white border p-2 px-4 rounded-md cursor-pointer"
            onClick={handleAllBlock}
          >
            Change Status ({selectedRows.size})
          </div>
        )}
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
      <div className="mx-4 my-4">
        <ReusableTable
          data={players}
          columns={columns}
          keyExtractor={(player) => player.playerId}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showCheckbox={true}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
        />
      </div>
    </div>
  );
};

export default BlockPlayer;
