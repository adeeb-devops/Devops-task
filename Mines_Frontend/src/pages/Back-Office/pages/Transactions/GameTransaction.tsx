/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";

import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";

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
interface Player {
  id: number;
  playerId: string;
  playerName: string;
  betType: string;
  betId: string;
  numberOfMines: number;
  gridType: string;
  transactionType: string;
  gameType: string;
  openingBalance: number;
  amount: number;
  closingBalance: number;
  dateTime: string;
  betAmount: number;
  winAmount: number;
}
const GameTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const [searchParams, setSearchParams] = useState({});

  const [formData, setFormData] = useState({
    playerId: "",
    playerName: "",
    betId: "",
    betType: "",
    numberOfMines: "",
    gridType: "",
    gameType: "",
    transactionType: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

  const columns: TableColumn<Player>[] = [
    { header: "Player ID", accessor: "playerId", width: 100 },
    { header: "Client Player Name", accessor: "playerName", width: 100 },
    { header: "Bet ID", accessor: "betId" },
    { header: "Bet Type", accessor: "betType", width: 100 },
    { header: "No. of Mines", accessor: "numberOfMines", width: 100 },
    { header: "Grid Type", accessor: "gridType", width: 100 },
    { header: "Transaction Type", accessor: "transactionType", width: 150 },
    { header: "Game Type", accessor: "gameType", width: 100 },
    { header: "Betting Amount", accessor: "betAmount" },
    { header: "Winning Amount", accessor: "winAmount" },
    { header: "Opening Balance", accessor: "openingBalance", width: 150 },
    { header: "Closing Balance", accessor: "closingBalance", width: 150 },
    { header: "Date and Time", accessor: "dateTime", width: 150 },
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
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("clientToken");

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

      console.log("get game transaction", response.data.data.game);

      if (response.data.success) {
        const data: Player[] = response.data.data.game.map(
          (admin: GameData, index) => ({
            id: index + 1,
            playerId: admin.player.id,
            playerName: admin.player.player_name,
            playerType: Capitalize(admin.player.player_type),
            client: admin.player.client_name,
            numberOfMines: admin.mines_count,
            gridType: admin.grid_type,
            gameType: admin.is_jackpot === false ? "Normal" : "Bonus",
            payoutMultiplayer: admin.payout_multiplier.toFixed(2),
            betType: admin.game_type,
            betId: admin.game_id,
            transactionType: admin.transactions[0]?.transaction_type,
            openingBalance: admin.transactions[0].opening_balance.toFixed(),
            amount: 0,
            betAmount: admin.transactions[0].betting_amount.toFixed(),
            winAmount: admin.transactions[0].winning_amount.toFixed(),
            closingBalance: admin.transactions[0].closing_balance.toFixed(),
            dateTime: formatDateTime(admin.createdAt),
          })
        );
        setPlayers(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.count || 0,
        }));
        console.log("players", players);
      }
    } catch (error) {
      toast.error("Something went wrong!");
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
  const handleSubmit = async () => {
    const params = {
      playerId: formData.playerId || undefined,
      playerName: formData.playerName || undefined,
      betId: formData.betId || undefined,
      betType: formData.betType || undefined,
      noOfMines: formData.numberOfMines || undefined,
      gridType: formData.gridType || undefined,
      isJackpot: formData.gameType || undefined,
      transactionType: formData.transactionType || undefined,
      startDate: formData.dateRange[0] || undefined,
      endDate: formData.dateRange[1] || undefined,
    };

    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    if (Object.keys(params).length === 0) {
      toast.info(
        "No search criteria specified. Please enter at least one search parameter."
      );
      return;
    }
    setPagination((prev) => ({ ...prev, page: 0 }));
    setSearchParams(params);
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
      playerId: "",
      playerName: "",

      transactionType: "",
      betId: "",
      betType: "",

      gridType: "",
      gameType: "",

      numberOfMines: "",
      dateRange: ["", ""] as [string, string],
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const betTypeOptions = useMemo(
    () => [
      { label: "Select Bet Type", value: "" },
      { label: "Auto", value: "auto" },
      { label: "Manual", value: "manual" },
    ],
    []
  );

  const transactionTypeOptions = useMemo(
    () => [
      { label: "Select Transaction Type", value: "" },
      { label: "Bet / Win", value: "bet-win" },
      { label: "Refund", value: "refund" },
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

  const handleDateChange = (range: [string, string]) => {
    setFormData((prevData) => ({
      ...prevData,
      dateRange: range,
    }));
  };

  useEffect(() => {
    fetchPlayers();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  return (
    <div>
      <h1 className="title">Game Transactions</h1>
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
              label: "Bet ID",
              name: "betId",
              type: "text",
              value: formData.betId,
              onChange: handleInputChange,
              placeholder: "Enter Bet ID",
            },

            {
              label: "Bet Type",
              name: "betType",
              type: "dropdown",
              value: formData.betType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: betTypeOptions,
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
              label: "Select Grid Type",
              name: "gridType",
              type: "dropdown",
              value: formData.gridType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: transactionGridOptions,
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
              label: "Select Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter",
              aligned: true,
            },
            {
              label: "Transaction Type",
              name: "transactionType",
              type: "dropdown",
              value: formData.transactionType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: transactionTypeOptions,
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

      <div className="mx-4 my-4 rounded-md">
        <ReusableTable
          data={players}
          columns={columns}
          keyExtractor={(player) => player?.id}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showExport={false}
        />
      </div>
    </div>
  );
};

export default GameTransaction;
