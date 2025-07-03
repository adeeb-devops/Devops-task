import React, { useMemo, useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { RiEditCircleLine } from "react-icons/ri";
import { BsInfoCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";
import { MdDelete } from "react-icons/md";
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
type playerInfo = {
  total_bet_placed: number | string;
  total_net_commission: number | string;
};

interface Player {
  id: number;
  playerId: string;
  playerName: string;
  playerType: string;
  mobileNumber: string;
  client: string;
  walletBalance: number;
  playerStatus: string;
  registerationDate: string;
  total_bet_placed: number | string | null;
  total_net_commission: number | string | null;
  location: string;
  lastLogin: string;
  retailer: string;
}

const PlayerSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerCount, setplayerCount] = useState({
    activePlayers: 0,
    count: 0,
    inactivePlayers: 0,
  });
  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    playerId: "",
    playerName: "",
    playerType: "",
    mobileNumber: "",
    client: "",
    playerStatus: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerEditInfo, setPlayerEditInfo] = useState({
    username: "",
    mobilenumber: "",
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
    setIsLoading(true);
    try {
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
            playerId: player.player_id,
            playerName: player.player_name,
            retailer: player?.created_by,
            client: player?.organizationHead?.name,
            mobileNumber: player?.phone_number,
            playerType: player.player_type === "real" ? "RP" : "CP",
            playerStatus: Capitalize(player.status),
            NetSharing: player?.total_net_sharing || 0,
            // BetPlaced: player. || 0,
            // location: player?.Area?.area_name,
            walletBalance: player.balance.toFixed(),
            registerationDate: formatDateTime(player.createdAt),
            lastLogin: formatDateTime(player.last_login),
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
  const playerInfo = async (id: string) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/player/info/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const playerInfo: playerInfo = response.data.playerInfo;

        // Safely update the state
        setSelectedPlayer(
          (prev) =>
            prev
              ? {
                  ...prev, // Spread the previous state
                  total_bet_placed: playerInfo.total_bet_placed, // Update properties
                  total_net_commission: playerInfo.total_net_commission,
                }
              : null // If prev is null, keep it null
        );
      }
    } catch (error) {
      console.log("Error fetching admin info:", error);
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

  const ClosePlayerInfo = () => {
    setOpenInfo(false);
    setSelectedPlayer(null);
  };
  const OpenPlayerInfo = (player: Player) => {
    setOpenInfo(true);
  };

  const ClosePlayerEdit = () => {
    setOpenEditInfo(false);
    setSelectedPlayer(null);
  };

  const OpenEditInfoPlayerEdit = (player: Player) => {
    setSelectedPlayer(player);
    setPlayerEditInfo({
      username: player.playerName,
      mobilenumber: player.mobileNumber,
      // password: player.password,
    });
    setOpenEditInfo(true);
  };

  const SubmitPlayerEdit = async () => {
    if (!playerEditInfo.username) {
      toast.error("Please fill in all fields");
      return;
    }
    if (playerEditInfo.mobilenumber.length > 10) {
      toast.error("Mobile number cannot be more than 10 digit.");
      return;
    }
    try {
      const token = sessionStorage.getItem("masterToken");
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/player/${selectedPlayer?.id}`,
        {
          player_name: playerEditInfo.username,
          phone_number: playerEditInfo?.mobilenumber,
          // password:playerEditInfo.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // console.log("response msg update", response);
        toast.success("Player details Updated!");
        fetchPlayers();
        ClosePlayerEdit();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const ChangePlayerEdit = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    const regex = /^[a-zA-Z0-9\s.,-]*$/;
    if (!regex.test(value)) {
      return;
    }
    setPlayerEditInfo((prevState) => ({ ...prevState, [id]: value }));
  };

  const columns: TableColumn<Player>[] = [
    { header: "Player ID", accessor: "id" },
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Player Type", accessor: "playerType" },
    { header: "Mobile Number", accessor: "mobileNumber" },
    { header: "Client Name", accessor: "client" },
    {
      header: "Wallet Balance",
      accessor: (player: Player) => `₹${player.walletBalance}`,
    },
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
    {
      header: "Player Info",
      accessor: (player: Player) => (
        <BsInfoCircle
          size={25}
          className="cursor-pointer hover:scale-125"
          onClick={() => {
            setSelectedPlayer(player);
            playerInfo(player.playerId);
            OpenPlayerInfo(player);
          }}
        />
      ),
    },
    {
      header: "Edit Player Info",
      accessor: (player: Player) => (
        <div className="flex">
          <RiEditCircleLine
            size={25}
            className="cursor-pointer hover:scale-125"
            onClick={() => OpenEditInfoPlayerEdit(player)}
          />
          <MdDelete
            size={25}
            className="cursor-pointer ml-4 hover:scale-125 text-red-700"
            onClick={() => handleDelete(player)}
          />
        </div>
      ),
    },
  ];

  const handleDelete = async (player: Player) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/player/${player.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Player Deleted Successfully !");
        fetchPlayers();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
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
    const params = {
      player_name: formData.playerName || undefined,
      id: formData.playerId || undefined,
      phone_number: formData.mobileNumber || undefined,
      player_type: formData.playerType || undefined,
      super_distributor: formData.client || undefined,
      status: formData.playerStatus || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };
    const hasSearchParams = Object.values(params).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      setSearchParams(params);
      // fetchPlayers();
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
      playerName: "",
      playerId: "",
      mobileNumber: "",
      playerType: "",
      client: "",
      playerStatus: "",
      dateRange: ["", ""] as [string, string],
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };
  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  const player_statusOptions = useMemo(
    () => [
      { label: "Select Player Status", value: "" },
      { label: "Active", value: "active" },
      { label: "InActive", value: "inactive" },
    ],
    []
  );
  const player_typeOptions = useMemo(
    () => [
      { label: "Select Player Type", value: "" },
      { label: "RP", value: "real" },
      { label: "CP", value: "cash" },
    ],
    []
  );

  useEffect(() => {
    fetchPlayers();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  return (
    <div>
      <h1 className="title">Player Search</h1>
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
              label: "Status",
              name: "playerStatus",
              type: "dropdown",
              value: formData.playerStatus,
              onChange: handleInputChange,
              placeholder: "Select Status",
              options: player_statusOptions,
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
      <div className="flex m-6 p-2 bg-gray-100 rounded-md justify-start items-center">
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md">
          Total Players: {playerCount?.count}
        </div>
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md text-green-700">
          Total Active Players: {playerCount?.activePlayers}
        </div>
        <div className="mx-4 border-blue-500 border p-2 px-4 rounded-md text-red-700">
          Total Inactive Players: {playerCount?.inactivePlayers}
        </div>
      </div>
      <div className="mx-4 mb-4">
        <ReusableTable
          data={players}
          columns={columns}
          keyExtractor={(player) => player.id}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        {openEditInfo && selectedPlayer && (
          <PopupsWithInput
            onClose={ClosePlayerEdit}
            fields={[
              {
                id: "username",
                label: "Username",
                type: "text",
                value: playerEditInfo.username,
                onChange: ChangePlayerEdit,
              },
              {
                id: "mobilenumber",
                label: "Mobile Number",
                type: "number",
                value: playerEditInfo.mobilenumber,
                onChange: ChangePlayerEdit,
              },
            ]}
            dialogTitle="Edit Player Information"
            buttons={[
              {
                name: "Update",
                onClick: SubmitPlayerEdit,
                className: "SubmitButton",
              },
              {
                name: "Cancel",
                onClick: ClosePlayerEdit,
                className: "ClearButton",
              },
            ]}
          />
        )}
        {openInfo && selectedPlayer && (
          <PopupsWithInput
            onClose={ClosePlayerInfo}
            disabled={true}
            fields={[
              {
                id: "registerationDate",
                label: "Registeration Date",
                type: "text",
                value: selectedPlayer.registerationDate,
                onChange: ChangePlayerEdit,
              },
              {
                id: "NetSharing",
                label: "Total Net Commission",
                type: "text",
                value: selectedPlayer?.total_net_commission || 0,
                onChange: ChangePlayerEdit,
              },
              {
                id: "BetPlaced",
                label: "Total Bet Placed",
                type: "text",
                value: selectedPlayer?.total_bet_placed || 0,
                onChange: ChangePlayerEdit,
              },

              {
                id: "created_by",
                label: "Created By",
                type: "text",
                value: selectedPlayer.retailer,
                onChange: ChangePlayerEdit,
              },
              {
                id: "lastLogin",
                label: "Player Last Login",
                type: "text",
                value: selectedPlayer.lastLogin,
                onChange: ChangePlayerEdit,
              },
            ]}
            dialogTitle="Player Information"
          />
        )}
      </div>
    </div>
  );
};

export default PlayerSearch;
