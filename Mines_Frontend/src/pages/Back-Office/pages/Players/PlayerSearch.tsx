import React, { useMemo, useState, useEffect } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import PopupsWithInput from "../../../Master-Office/Components/Popups/PopupsWithInput";
import { LiaUserEditSolid } from "react-icons/lia";
import ConfirmationPopup from "../../../Master-Office/Components/Popups/ConfirmationPopup";

type playerInfo = {
  total_winning_amount: number;
  total_betting_amount: number;
  total_credit_amount: number;
  total_deduct_amount: number;
};

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
  created_by_player: string | null;
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
  mobileNumber: string;
  walletBalance: number;
  playerStatus: string;
  retailer: string;
  lifeTimeTotalDeposite: number;
  lifeTimeTotalWithdrawl: number;
  lastLogin: string;
  playingFrom: string;
  bankDetails: string;
  client: string;
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
    playerName: "",
    playerId: "",
    mobileNumber: "",
    playerStatus: "",
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
  const [openInfo, setOpenInfo] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

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
  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("clientToken");

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
            retailer: player?.created_by,
            client: player?.organizationHead?.name,
            mobileNumber: player?.phone_number,
            playerType: player.player_type === "real" ? "RP" : "CP",
            playerStatus: Capitalize(player.status),
            NetSharing: player?.total_net_sharing || 0,
            playingFrom: formatDateTime(player?.createdAt),
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
      console.log("Error fetching player:", error);
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
  const playerInfo = async (name: string) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("clientToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/player/info/${name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response);

      if (response.data.success) {
        const playerInfo: playerInfo = response.data.playerInfo;

        // Safely update the state
        setSelectedPlayer((prev) =>
          prev
            ? {
                ...prev,
                lifeTimeTotalDeposite: playerInfo.total_credit_amount,
                lifeTimeTotalWithdrawl: playerInfo.total_deduct_amount,
              }
            : null
        );
      }
    } catch (error) {
      console.log("Error fetching admin info:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const OpenPlayerInfo = (player: Player) => {
    playerInfo(player.playerName);
    setSelectedPlayer(player);
    setOpenInfo(true);
  };
  const handleStatusClick = (player: Player) => {
    const newStatus =
      player.playerStatus.toLowerCase() === "active" ? "InActive" : "Active";
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of player "${player.playerName}" (ID: ${player.id}) from ${player.playerStatus} to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(player.playerId);
        setConfirmPopup(null);
      },
    });
  };
  const handleStatusUpdate = async (userId: string) => {
    const token = sessionStorage.getItem("clientToken");
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/player/changeStatus`,
        { playerIds: [userId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchPlayers(); // Refresh the player data
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  const columns: TableColumn<Player>[] = [
    { header: "Player ID", accessor: "playerId" },
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Mobile Number", accessor: "mobileNumber" },

    {
      header: "Wallet Balance",
      accessor: (player: Player) => `₹${player.walletBalance}`,
    },
    {
      header: "Player Status",
      accessor: (player: Player) => (
        <div className="flex items-center">
          <span
            className={
              player.playerStatus.toLowerCase() === "active"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {player.playerStatus}
          </span>
          <LiaUserEditSolid
            size={25}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleStatusClick(player)}
          />
        </div>
      ),
    },
    {
      header: "Player Info",
      accessor: (player: Player) => (
        <BsInfoCircle
          size={25}
          className="cursor-pointer hover:scale-125"
          onClick={() => OpenPlayerInfo(player)}
        />
      ),
    },
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
    const params = {
      player_name: formData.playerName || undefined,
      id: formData.playerId || undefined,
      phone_number: formData.mobileNumber || undefined,

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
              label: "Mobile Number",
              name: "mobileNumber",
              type: "number",
              value: formData.mobileNumber,
              onChange: handleInputChange,
              placeholder: "Enter Mobile Number",
              maxLength: 10,
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

        {openInfo && selectedPlayer && (
          <PopupsWithInput
            onClose={ClosePlayerInfo}
            disabled={true}
            fields={[
              {
                id: "playerName",
                label: "Player Name",
                type: "text",
                value: selectedPlayer.playerName,
              },
              {
                id: "playerId",
                label: "Player Id",
                type: "text",
                value: selectedPlayer.playerId,
              },
              {
                id: "lifeTimeTotalDeposite",
                label: "Lifetime total deposit",
                type: "text",
                value: selectedPlayer.lifeTimeTotalDeposite,
              },
              {
                id: "lifeTimeTotalWithdrawl",
                label: "Lifetime total withdrawal",
                type: "text",
                value: selectedPlayer.lifeTimeTotalWithdrawl,
              },
              // {
              //   id: "bankDetails",
              //   label: "Bank Details",
              //   type: "text",
              //   value: selectedPlayer.bankDetails,
              // },

              {
                id: "playingFrom",
                label: "Playing From",
                type: "text",
                value: selectedPlayer.playingFrom,
              },
              {
                id: "Last login",
                label: "Player Last Login",
                type: "text",
                value: selectedPlayer.lastLogin,
              },
            ]}
            dialogTitle="Player Information"
          />
        )}
      </div>
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

export default PlayerSearch;
