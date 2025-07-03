import React, { useState, useEffect } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { toast } from "react-toastify";
import axios from "axios";

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
  gameName: string;
  gameType: string;
  gameId: string;
  minBet: string;
  maxBet: string;
  amount?:number;
  numberOfmines: string;
  betType: string;
  gridType: number;
  commision: string;
  grid_options: GridOption[];
}

const CreateGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState({});
  // const [gridTypes, setGridTypes] = useState<GridOption[]>([]);
  const [formData, setFormData] = useState({
    gameType: "",
    gameName: "",
    minBet: "",
    maxBet: "",
    amount:"",
    // numberOfmines: "",
    // betType: "",
    commision: "",
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

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
            offset: pagination.page * pagination.rowsPerPage,
            limit: pagination.rowsPerPage,
          },
        }
      );

      if (response.data.success) {
        const data: Game[] = response.data.data.map((game: GameDetails) => ({
          gameId: game.id,
          gameName: game.game_name,
          gameType: game.is_jackpot === false ? "Normal" : "Jackpot",
          minBet: game.min_bet,
          maxBet: game.max_bet,
          amount:game.jackpot_bonus,
          numberOfmines: "",
          betType: "",
          commision: game.rake_percentage,
          grid_options: game.grid_options,
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
    { header: "Game Name", accessor: "gameName" },
    { header: "Game Type", accessor: "gameType" },
    { header: "Game ID", accessor: "gameId" },
    { header: "Minimum Bet", accessor: "minBet" },
    { header: "Maximum Bet", accessor: "maxBet" },
    { header: "Jackpot Amount", accessor: "amount" },
    // { header: "Number Of Mines", accessor: "numberOfmines" },
    // { header: "Select Bet Type", accessor: "betType" },
    {
      header: "Grid Type",
      accessor: (game: Game) =>
        game?.grid_options?.map((g) => g.grid_type).join(", ") || "N/A",
    },
    { header: "Commision", accessor: "commision" },
  ];

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("masterToken");

    // Compute grid options
    const computedGridTypes = selectedNames.map((g) => {
      const mins = g.split("X").reduce((f, s) => Number(f) * Number(s), 1);
      return {
        grid_type: g,
        number_of_tiles: mins,
      };
    });

    const isJackpot = formData.gameType === "Jackpot";
    const params = {
      is_jackpot: isJackpot,
      game_name: formData.gameName,
      min_bet: formData.minBet,
      max_bet: formData.maxBet,
      rake_percentage: formData.commision || 0,
      grid_options: computedGridTypes,
      ...(isJackpot ? { jackpot_bonus: Number(formData.amount) } : {})
    };

    const hasEmptyField = Object.entries(params).some(([key, value]) => {
      const isEmpty = 
        value === undefined || 
        value === null || 
        value === '' || 
        (Array.isArray(value) && value.length === 0);
  
      if (isEmpty) {
        toast.error(`Invalid or missing field: ${key}`);
        return true;
      }
      return false;
    });
  
    if (hasEmptyField) return;

    try {
      // Make API request
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/template`,
        {
          templates: [params],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle success
      if (response.data.success) {
        toast.success("Game Created Successfully");
        handleClear();
      }
    } catch (error) {
      // Handle error
      toast.error("Please try again later!");
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
      gameType: "",
      gameName: "",
      minBet: "",
      maxBet: "",
      amount:"",
      // numberOfmines: "",
      // betType: "",
      commision: "",
    });
    // setGridTypes([]);
    setSelectedNames([]);
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 0 }));
    // console.log(gridTypes);
  };

  const gameTypeOptions = [
    { label: "Select Game Type", value: "" },
    { label: "Normal", value: "normal" },
    { label: "Jackpot", value: "Jackpot" },
  ];
  // const betTypeOptions = [
  //   { label: "Auto & Manual", value: "auto&manual" },
  //   { label: "Auto", value: "auto" },
  //   { label: "Manual", value: "manual" },
  // ];
  const gridTypeOptions = ["5X5", "7X7", "9X9"];
  useEffect(() => {
    fetchGames();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  const [amountDisabled, setAmountDisabled] = useState(true);
  useEffect(()=>{
if(formData.gameType==="Jackpot"){
  setAmountDisabled(false)
}
else {
  setAmountDisabled(true);
}
  },[formData.gameType])

  return (
    <div>
      <h1 className="title">Create Game</h1>
      <div className="">
        <InputWithButtons
          fields={[
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
              label: "Min Bet",
              name: "minBet",
              type: "number",
              value: formData.minBet,
              onChange: handleInputChange,
              placeholder: "Enter Min Bet",
            },
            {
              label: "Max Bet",
              name: "maxBet",
              type: "number",
              value: formData.maxBet,
              onChange: handleInputChange,
              placeholder: "Enter Max Bet",
            },
            // {
            //   label: "No. of Mines",
            //   name: "numberOfmines",
            //   type: "number",
            //   value: formData.numberOfmines,
            //   onChange: handleInputChange,
            //   placeholder: "Enter No. of Mines",
            // },

            // {
            //   label: "Bet Type",
            //   name: "betType",
            //   type: "dropdown",
            //   value: formData.betType,
            //   onChange: handleInputChange,
            //   options: betTypeOptions,
            // },

            {
              label: "Jackpot Amount",
              name: "amount",
              type: "number",
              value: formData.amount,
              onChange: handleInputChange,
              disabled:amountDisabled
              // placeholder: "Enter Commision",
            },
            {
              label: "Enter Commision",
              name: "commision",
              type: "number",
              value: formData.commision,
              onChange: handleInputChange,
              placeholder: "Enter Commision",
            },
            {
              label: "Grid Type",
              name: "gridType",
              type: "multiselect",
              multiSelectedValues: selectedNames,
              multiOptions: gridTypeOptions,
              onMultiSelectChange: (selected) => setSelectedNames(selected),
            },
          ]}
          buttons={[
            {
              text: "Create",
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
      </div>
    </div>
  );
};

export default CreateGame;
