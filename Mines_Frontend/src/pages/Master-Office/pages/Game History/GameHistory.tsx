import React, { useEffect, useMemo, useState } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import axios from "axios";
import { toast } from "react-toastify";
import CSVExport from "../../Components/CSVExport";

type GameData = {
  id: number;
  template_id: number;
  player_name: string;
  game_id: string;
  bets: any[];
  game_type: string;
  active: boolean;
  tiles_count: number;
  mines_count: number;
  is_jackpot: boolean;
  betting_amount: number;
  winning_amount: number;
  jackpot_amount: number;
  payout_multiplier: number;
  createdAt: string;
  updatedAt: string;
  grid_type: string;
  player: {
    id: number;
    player_name: string;
    phone_number: string | null;
    player_type: string;
    client_name: string;
  };
  template: {
    id: number;
    game_name: string;
    jackpot_bonus: number;
    grid_options: {
      grid_type: string;
      number_of_tiles: number;
    }[];
  };
  transactions: {
    id: number;
    player_name: string;
    game_id: string;
    transaction_type: "bet-win" | "bet-loss" | "bet-place" | string;
    winning_amount: number;
    betting_amount: number;
    opening_balance: number;
    closing_balance: number;
    createdAt: string;
    updatedAt: string;
  }[];
};
interface Admin {
  id: number;
  playerName: string;
  gameName: string;
  betId: string;
  betType: string;
  gameType: string;
  gridType: string;
  numberOfMines: number;
  payoutMultiplayer: number;
  betAmount: number;
  winAmount: number;
  dateTime: string;
}

const GameHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, settableData] = useState<Admin[]>([]);
  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    playerName: "",
    gameName: "",
    betId: "",
    betType: "",
    gridType: "",
    numberOfMines: "",
    payoutMultiplayer: "",
    gameType: "",
    dateRange: ["", ""] as [string, string],
  });

  const columns: TableColumn<Admin>[] = [
    { header: "Game Name", accessor: "gameName" },
    { header: "Player Name", accessor: "playerName" },
    { header: "Bet ID", accessor: "betId" },
    { header: "Betting Amount", accessor: "betAmount" },
    { header: "Winning Amount", accessor: "winAmount" },
    { header: "Bet Type", accessor: "betType" },
    { header: "Game Type", accessor: "gameType" },
    { header: "Grid Type", accessor: "gridType" },
    { header: "Number of Mines", accessor: "numberOfMines" },
    { header: "Payout Multiplayer", accessor: "payoutMultiplayer" },
    { header: "Date & Time", accessor: "dateTime" },
  ];
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
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  }

  const fetchadmin = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/game/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...searchParams,
            limit: pagination.rowsPerPage,
            offset: pagination.page * pagination.rowsPerPage,
          },
        }
      );
      if (response.data.success) {
        // console.log("response game history", response.data.data.game);

        const data: Admin[] = response.data.data.game.map(
          (admin: GameData) => ({
            id: admin.id,
            gameName: Capitalize(admin.template?.game_name),
            playerName: Capitalize(admin.player_name),
            betId: admin?.game_id,
            betType: Capitalize(admin.game_type),
            gridType: admin?.grid_type,
            gameType: admin?.is_jackpot === false ? "Normal" : "Bonus",
            numberOfMines: admin?.mines_count,
            payoutMultiplayer: admin?.payout_multiplier.toFixed(2),
            dateTime: formatDateTime(admin.createdAt),
            betAmount: admin.transactions[0].betting_amount.toFixed(2),
            winAmount: admin.transactions[0].winning_amount.toFixed(2),
          })
        );
        settableData(data);
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
    // console.log("Changing page to:", newPage);
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
      playerName: "",
      payoutMultiplayer: "",
      numberOfMines: "",
      betId: "",
      gameType: "",
      gridType: "",
      gameName: "",
      betType: "",
      dateRange: ["", ""] as [string, string],
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSubmit = () => {
    const params = {
      playerName: formData.playerName || undefined,
      gameName: formData.gameName || undefined,
      betId: formData.betId || undefined,
      gridType: formData.gridType || undefined,
      betType: formData?.betType || undefined,
      isJackpot: formData.gameType || undefined,
      noOfMines: formData?.numberOfMines || undefined,
      payoutMultiplier: formData?.payoutMultiplayer || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };
    const hasSearchParams = Object.keys(params).length > 0;
    if (hasSearchParams) {
      setSearchParams(params);
      setPagination((prev) => ({ ...prev, page: 0 }));
      // fetchadmin();
    } else {
      toast.info(
        "No search criteria specified. Please enter at least one search parameter."
      );
    }
  };

  useEffect(() => {
    fetchadmin();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  const fetchExport = async () => {
    try {
      const token = sessionStorage.getItem("masterToken");
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/game/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...searchParams,
            limit: Number.MAX_SAFE_INTEGER
          },
        }
      );
  
      if (response.data.success) {
        return response.data.data.game.map((admin: GameData) => ({
          id: admin.id,
          gameName: Capitalize(admin.template?.game_name),
          playerName: Capitalize(admin.player_name),
          betId: admin?.game_id,
          betType: Capitalize(admin.game_type),
          gridType: admin?.grid_type,
          gameType: admin?.is_jackpot === false ? "Normal" : "Bonus",
          numberOfMines: admin?.mines_count,
          payoutMultiplayer: admin?.payout_multiplier.toFixed(2),
          dateTime: formatDateTime(admin.createdAt),
          betAmount: admin.transactions[0].betting_amount.toFixed(2),
          winAmount: admin.transactions[0].winning_amount.toFixed(2),
        }));
      }
      return [];
    } catch (error) {
      toast.error("Error exporting data!");
      return [];
    }
  };

  const betTypeOptions = useMemo(
    () => [
      { label: "Select Bet Type", value: "" },
      { label: "Auto", value: "auto" },
      { label: "Manual", value: "manual" },
    ],
    []
  );
  const transactionMinesOptions = useMemo(
    () => [
      { label: "Select Game Type", value: "" },
      { label: "Normal", value: "false" },
      { label: "Bonus", value: "true" },
    ],
    []
  );
  const transactionGridOptions = useMemo(
    () => [
      { label: "Select Grid Type", value: "" },

      { label: "5X5", value: "25" },
      { label: "7X7", value: "49" },
      { label: "9X9", value: "81" },
    ],
    []
  );

  return (
    <div>
      <h1 className="title">Game History</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Client Player Name",
              name: "playerName",
              type: "text",
              value: formData.playerName,
              onChange: handleInputChange,
              placeholder: "Enter Player Name",
            },
            {
              label: "Game Name",
              name: "gameName",
              type: "text",
              value: formData.gameName,
              onChange: handleInputChange,
              placeholder: "Enter Game Name",
            },
            {
              label: "Bet ID",
              name: "betId",
              type: "text",
              value: formData.betId,
              onChange: handleInputChange,
              placeholder: "Enter Bet Id",
            },
            {
              label: "Bet Type",
              name: "betType",
              type: "dropdown",
              value: formData.betType,
              onChange: handleInputChange,
              placeholder: "Select Bet Type",
              options: betTypeOptions,
            },
            {
              label: "Grid Type",
              name: "gridType",
              type: "dropdown",
              value: formData.gridType,
              onChange: handleInputChange,
              placeholder: "Enter Grid Type",
              options: transactionGridOptions,
            },
            {
              label: "Select No. of Mines",
              name: "numberOfMines",
              type: "number",
              value: formData.numberOfMines,
              onChange: handleInputChange,
              placeholder: "Enter No. of Mines",
            },

            {
              label: "Payout Multiplier",
              name: "payoutMultiplayer",
              type: "text",
              value: formData.payoutMultiplayer,
              onChange: handleInputChange,
              placeholder: "Enter Payout Multiplier",
            },

            {
              label: "Game Type",
              name: "gameType",
              type: "dropdown",
              value: formData.gameType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: transactionMinesOptions,
            },
            {
              label: "Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter Date Range",
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
              // disabled:isLoading
            },
          ]}
        />
      </div>
      <div className="mx-4 my-4">
      <div className="text-end mb-4">
          <CSVExport
            fetchData={fetchExport}
            columns={columns}
            buttonText="Export to CSV"
          />
        </div>
        <ReusableTable
          data={tableData}
          columns={columns}
          keyExtractor={(admin) => admin.id}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showExport={false}
        />
      </div>
    </div>
  );
};

export default GameHistory;
