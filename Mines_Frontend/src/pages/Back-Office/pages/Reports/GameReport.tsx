import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import CSVExport from "../../../Master-Office/Components/CSVExport";

type GameData = {
  id: number;
  player_name: string;
  status: string;
  phone_number: null | string;
  balance: number;
  created_at: string;
  player_type: string;
  last_login: string;
  pl: number;
  commission_amount: number;
  payout_percentage: null | number;
  net_pl: number;
  "playerSuperDistributor.name": string;
  "playerSuperDistributor.sharing_type": string;
  "playerSuperDistributor.self": string;
  "playerSuperDistributor.client": string;
  "playerSubDistributor.name": null | string;
  "playerSubDistributor.role": null | string;
  "transactions.total_buy_in": number;
  "transactions.total_buy_out": number;
  "transactions.gameTransaction.id": number;
  "transactions.gameTransaction.game_id": string;
  "transactions.gameTransaction.tiles_count": number;
  "transactions.gameTransaction.template.id": number;
  "transactions.gameTransaction.template.game_name": string;
  "transactions.gameTransaction.template.is_jackpot": boolean;
};

interface Report {
  srNo: number;
  id: number;
  playerName: string;
  mobileNumber: number;
  playerType: string;
  totalBuyIn: number;
  totalBuyOut: number;
  totalCommission: number;
  totalNetPL: number;
  payout: number;
  gamesType: "Jackpot Game" | "Normal Game";
  gridType: string;
  date: string;
}

const GameReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [tableData, settableData] = useState<Report[]>([]);
  const [formData, setFormData] = useState({
    playerName: "",
    mobileNumber: "",
    playerType: "",
    gameType: "",
    gridType: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });

  const columns: TableColumn<Report>[] = [
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Mobile No.", accessor: "mobileNumber" },

    { header: "Player Type", accessor: "playerType" },

    { header: "Total Buy In", accessor: "totalBuyIn" },
    { header: "Total Buy Out", accessor: "totalBuyOut" },
    { header: "Total Commission", accessor: "totalCommission" },
    { header: "Total Net P&L", accessor: "totalNetPL" },
    { header: "Payout %", accessor: "payout" },
    { header: "Game Type", accessor: "gamesType" },
    { header: "Grid Type", accessor: "gridType" },
    { header: "Date Range", accessor: "date" },
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
  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("clientToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/report/game-report`,
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
        const rows = response.data.data.rows || [];
        const data: Report[] = rows.map((admin: GameData, index) => {
          return {
            gamesType:
              admin["transactions.gameTransaction.template.is_jackpot"] === true
                ? "Jackpot Game"
                : "Normal Game",
            srNo: index + 1,
            id: index + 1,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]
              ? admin["transactions.total_buy_in"].toFixed(2)
              : "0.00",
            totalBuyOut: admin["transactions.total_buy_out"]
              ? admin["transactions.total_buy_out"].toFixed(2)
              : "0.00",
            totalCommission: admin.commission_amount
              ? admin.commission_amount.toFixed(2)
              : "0.00",
            totalNetPL: admin.net_pl ? Number(admin.net_pl).toFixed(2) : "0.00",
            payout: admin.payout_percentage
              ? admin.payout_percentage.toFixed(2)
              : "0.00",

            gridType: admin["transactions.gameTransaction.tiles_count"]
              ? `${Math.sqrt(
                  admin["transactions.gameTransaction.tiles_count"]
                )}X${Math.sqrt(
                  admin["transactions.gameTransaction.tiles_count"]
                )}`
              : "N/A",
            clientName: admin["playerSuperDistributor.client"] || "Unknown",
            date: formatDateTime(admin.created_at),
          };
        });

        settableData(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.count || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error fetching!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };
  const player_typeOptions = useMemo(
    () => [
      { label: "Select Player Type", value: "" },
      { label: "RP", value: "real" },
      { label: "CP", value: "cash" },
    ],
    []
  );

  const grid_typeOptions = useMemo(
    () => [
      { label: "Select Grid Type", value: "" },

      { label: "5X5", value: "25" },
      { label: "7X7", value: "49" },
      { label: "9X9", value: "81" },
    ],
    []
  );

  const game_typeOptions = useMemo(
    () => [
      { label: "Select Game Type", value: "" },
      { label: "Normal Game", value: "false" },
      { label: "Jackpot Game", value: "true" },
    ],
    []
  );

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPagination((prev) => ({
      ...prev,
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };

  const handleSubmit = () => {
    // console.log("Form Data:", formData);
    // Validate phone number
    if (formData.mobileNumber) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.mobileNumber)) {
        toast.error("Invalid phone number! Please enter a valid number.");
        return;
      }
    }
    const params = {
      playerName: formData.playerName || undefined,
      playerType: formData.playerType || undefined,
      phoneNumber: formData.mobileNumber || undefined,
      gameType: formData.gameType || undefined,
      gridType: formData.gridType || undefined,
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
  const handleClear = () => {
    setFormData({
      mobileNumber: "",
      playerType: "",
      playerName: "",
      gameType: "",
      gridType: "",
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

  useEffect(() => {
    fetchReport();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);
  async function fetchGameData(): Promise<Report[]> {
    try {
      const token = sessionStorage.getItem("clientToken");
      // const params = SearchParams();

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/report/game-report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...searchParams,
            limit: Number.MAX_SAFE_INTEGER,
          },
        }
      );

      if (response.data.success) {
        const rows = response.data.data.rows || [];
        const data: Report[] = rows.map((admin: GameData) => {
          // console.log("Mapping admin object:", admin);
          const gametype =
            admin["transactions.gameTransaction.template.is_jackpot"] === true
              ? "Jackpot Game"
              : "Normal Game";
          console.log("gameTypes", gametype);

          return {
            gamesType:
              admin["transactions.gameTransaction.template.is_jackpot"] === true
                ? "Jackpot Game"
                : "Normal Game",
            id: admin.id,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]
              ? admin["transactions.total_buy_in"].toFixed(2)
              : "0.00",
            totalBuyOut: admin["transactions.total_buy_out"]
              ? admin["transactions.total_buy_out"].toFixed(2)
              : "0.00",
            totalCommission: admin.commission_amount
              ? admin.commission_amount.toFixed(2)
              : "0.00",
            totalNetPL: admin.net_pl ? Number(admin.net_pl).toFixed(2) : "0.00",
            payout: admin.payout_percentage
              ? admin.payout_percentage.toFixed(2)
              : "0.00",

            gridType: admin["transactions.gameTransaction.tiles_count"]
              ? `${Math.sqrt(
                  admin["transactions.gameTransaction.tiles_count"]
                )}X${Math.sqrt(
                  admin["transactions.gameTransaction.tiles_count"]
                )}`
              : "N/A",
            clientName: admin["playerSuperDistributor.client"] || "Unknown",
            date: formatDateTime(admin.created_at),
          };
        });
        return data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching game data for CSV export:", error);
      toast.error("Something went wrong!");
      return [];
    }
  }
  return (
    <div>
      <h1 className="title">Game Reports</h1>
      <div className="">        <InputWithButtons
          fields={[
            {
              label: "Player Name",
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
              label: "Player Type",
              name: "playerType",
              type: "dropdown",
              value: formData.playerType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: player_typeOptions,
            },

            {
              label: "Grid Type",
              name: "gridType",
              type: "dropdown",
              value: formData.gridType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: grid_typeOptions,
            },

            {
              label: "Game Type",
              name: "gameType",
              type: "dropdown",
              value: formData.gameType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: game_typeOptions,
            },
            {
              label: "Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter",
              // aligned: true,
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
        <div className="text-end mb-4">
          <CSVExport
            fetchData={fetchGameData}
            columns={columns}
            buttonText="Export to CSV"
          />
        </div>
        <ReusableTable
          data={tableData}
          columns={columns}
          keyExtractor={(player) => player.srNo}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          showExport={false}
        />
      </div>
    </div>
  );
};

export default GameReport;
