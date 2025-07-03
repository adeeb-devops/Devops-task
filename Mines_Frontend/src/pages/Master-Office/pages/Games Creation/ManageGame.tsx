import React, { useMemo, useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";

import { toast } from "react-toastify";
import axios from "axios";
import { BsInfoCircle } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import { LiaUserEditSolid } from "react-icons/lia";
import ConfirmationPopup from "../../Components/Popups/ConfirmationPopup";

interface GridOption {
  grid_type: string;
  number_of_tiles: number;
}
type GameDetails = {
  id: number;
  game_name: string;
  grid_options: GridOption[];
  active: boolean;
  is_jackpot: boolean;
  jackpot_bonus: number;
  rake_percentage: number;
  min_bet: number;
  max_bet: number;
  is_disabled: boolean;
  createdAt: string;
  updatedAt: string;
};
interface Game {
  gameId: number;
  gameName: string;
  gameType: string;
  gameStatus: string;
  gridType: string;

  // game info
  game_name: string;
  grid_options: GridOption[];
  active: boolean;
  is_jackpot: boolean;
  jackpot_bonus: number;
  rake_percentage: number;
  min_bet: number;
  max_bet: number;
  is_disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const ManageGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    gameId: "",
    gameName: "",
    gameType: "",
    gameStatus: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onSubmit: () => void;
  } | null>(null);
  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/template`,
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
        const data: Game[] = response.data.data.map((game: GameDetails) => ({
          gameId: game.id,
          gameName: game.game_name,
          gameType: game?.is_jackpot === false ? "Normal" : "Bonus",
          minBet: game.min_bet,
          maxBet: game.max_bet,

          gridType: game.grid_options[0]?.grid_type,
          commision: game.jackpot_bonus,
          gameStatus: game.is_disabled === true ? "Hide" : "Unhide",
          is_disabled: game.is_disabled,
        }));

        setGames(data);

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
  const handleStatusClick = (admin: Game) => {
    const newStatus = admin.is_disabled === true ? "Unhide" : "Hide";
    setConfirmPopup({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of game "${
        admin.gameName
      }" from ${
        admin.is_disabled === true ? "Hide" : "Unhide"
      } to ${newStatus}?`,
      onSubmit: () => {
        handleStatusUpdate(admin.gameId, !admin.is_disabled);
        setConfirmPopup(null);
      },
    });
  };
  const handleStatusUpdate = async (gameId: number, newStatus: boolean) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BACKEND}/template/${gameId}`,
        { is_disabled: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchGames(); // Refresh the admin data
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
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

  const columns: TableColumn<Game>[] = [
    { header: "Game ID", accessor: "gameId" },
    { header: "Game Name", accessor: "gameName" },
    { header: "Game Type", accessor: "gameType" },
    { header: "Grid Type", accessor: "gridType" },

    {
      header: "Game Status",
      accessor: (admin: Game) => (
        <div className="flex items-center">
          <span
            className={
              admin.gameStatus === "Hide" ? "text-red-600" : "text-green-600"
            }
          >
            {admin.gameStatus}
          </span>
          <LiaUserEditSolid
            size={25}
            className="ml-3 cursor-pointer hover:scale-125"
            onClick={() => handleStatusClick(admin)}
          />
        </div>
      ),
    },
    // {
    //   header: "Game Info",
    //   accessor: (games: Game) => (
    //     <BsInfoCircle
    //       size={25}
    //       className="cursor-pointer hover:scale-125"
    //       onClick={() => OpenPlayerInfo(games)}
    //     />
    //   ),
    // },
    {
      header: "Delete Game",
      accessor: (games: Game) => (
        <div className="flex">
          <MdDelete
            size={25}
            className="cursor-pointer ml-4 hover:scale-125 text-red-700"
            onClick={() => handleDelete(games)}
          />
        </div>
      ),
    },
  ];
  const handleDelete = async (game: Game) => {
    const token = sessionStorage.getItem("masterToken");
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BACKEND}/template/${game.gameId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Game Deleted Successfully !");
        fetchGames();
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };
  const OpenPlayerInfo = (game: Game) => {
    setSelectedGame(game);
    setOpenInfo(true);
  };

  const handleSubmit = () => {
    const searchParams = {
      id: formData.gameId ?? undefined,
      is_jackpot:
        formData.gameType === "bonus"
          ? true
          : formData.gameType === "normal"
          ? false
          : undefined,
      game_name: formData.gameName ?? undefined,
      is_disabled:
        formData.gameStatus === "hide"
          ? true
          : formData.gameStatus === "unhide"
          ? false
          : undefined,
      startDate: Array.isArray(formData.dateRange)
        ? formData.dateRange[0]
        : undefined,
      endDate: Array.isArray(formData.dateRange)
        ? formData.dateRange[1]
        : undefined,
    };

    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      setSearchParams(searchParams);
      // fetchGames();
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
      gameId: "",
      gameType: "",
      gameName: "",
      gameStatus: "",
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
  const ClosePlayerEdit = () => {
    setOpenInfo(false);
    setSelectedGame(null);
  };
  const gameTypeOptions = [
    { label: "Select Game Type", value: "" },
    { label: "Normal", value: "normal" },
    { label: "Bonus", value: "bonus" },
  ];
  const gameStatusTypeOptions = [
    { label: "Select Game Status", value: "" },
    { label: "Hide", value: "hide" },
    { label: "Unhide", value: "unhide" },
  ];

  useEffect(() => {
    fetchGames();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  return (
    <div>
      <h1 className="title">Manage Game</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Game Id",
              name: "gameId",
              type: "text",
              value: formData.gameId,
              onChange: handleInputChange,
              placeholder: "Enter Game Id",
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
              label: "Game Type",
              name: "gameType",
              type: "dropdown",
              value: formData.gameType,
              onChange: handleInputChange,
              options: gameTypeOptions,
            },

            {
              label: "Select Game Status",
              name: "gameStatus",
              type: "dropdown",
              value: formData.gameStatus,
              onChange: handleInputChange,
              options: gameStatusTypeOptions,
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
          data={games}
          columns={columns}
          keyExtractor={(games) => games.gameId}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        {openInfo && selectedGame && (
          <PopupsWithInput
            onClose={ClosePlayerEdit}
            // fields={[
            //   {
            //     id: "username",
            //     label: "Username",
            //     type: "text",
            //     value: playerEditInfo.username,
            //     onChange: ChangePlayerEdit,
            //   },
            //   {
            //     id: "mobilenumber",
            //     label: "Mobile Number",
            //     type: "text",
            //     value: playerEditInfo.mobilenumber,
            //     onChange: ChangePlayerEdit,
            //   },
            //   // {
            //   //   id: "password",
            //   //   label: "Player Password",
            //   //   type: "text",
            //   //   value: playerEditInfo.password,
            //   //   onChange: ChangePlayerEdit,
            //   // },
            // ]}
            dialogTitle="Game Info."
            buttons={[
              {
                name: "Close",
                onClick: ClosePlayerEdit,
                className: "ClearButton",
              },
            ]}
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

export default ManageGame;
