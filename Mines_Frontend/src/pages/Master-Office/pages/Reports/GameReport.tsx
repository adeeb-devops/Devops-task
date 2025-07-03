import React, { useEffect, useMemo, useState } from "react";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import InputWithButtons from "../../Components/InputWithButtons";
import axios from "axios";
import { toast } from "react-toastify";
import useGetClients from "../../../hooks/useGetClients";
import CSVExport from "../../Components/CSVExport";

type GameData = {
  srNo: number;
  id: number;
  player_name: string;
  status: string;
  phone_number: string | null;
  balance: number;
  created_at: string;
  player_type: string;
  last_login: string;
  pl: number;
  commission_amount: number;
  payout_percentage: number | null;
  net_pl: number;
  "playerSuperDistributor.name": string;
  "playerSuperDistributor.sharing_type": string;
  "playerSuperDistributor.self": string;
  "playerSuperDistributor.client": string;
  "transactions.total_buy_in": number;
  "transactions.total_buy_out": number;
  "transactions.gameTransaction.id": number;
  "transactions.gameTransaction.game_id": string;
  "transactions.gameTransaction.template.id": number;
  "transactions.gameTransaction.template.game_name": boolean;
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
  gameType: string;
  gridType: string;
  clientName: string;
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
    clientName: "",
    dateRange: ["", ""] as [string, string],
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
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
  const columns: TableColumn<Report>[] = [
    { header: "Client Player Name", accessor: "playerName" },
    { header: "Mobile No.", accessor: "mobileNumber" },
    { header: "Player Type", accessor: "playerType" },
    { header: "Total Buy In", accessor: "totalBuyIn" },
    { header: "Total Buy Out", accessor: "totalBuyOut" },
    { header: "Total Commission", accessor: "totalCommission" },
    { header: "Total Net P&L", accessor: "totalNetPL" },
    { header: "Payout %", accessor: "payout" },
    { header: "Game Type", accessor: "gameType" },
    { header: "Grid Type", accessor: "gridType" },
    { header: "Client Name", accessor: "clientName" },
    { header: "Date Range", accessor: "date" },
  ];

  const fetchReport = async () => {
    try {
      settableData([]);
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

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
      //   console.log("response settlement reports ", response.data.data.rows);
      if (response.data.success) {
        const data: Report[] = response.data.data.rows.map((admin, index) => {
          return {
            srNo: index + 1,
            id: index + 1,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]?.toFixed(2),
            totalBuyOut: admin["transactions.total_buy_out"]?.toFixed(2),
            totalCommission: admin.commission_amount.toFixed(2),
            totalNetPL: admin.net_pl?.toFixed(2),
            payout: admin.payout_percentage?.toFixed(2),
            gameType:
              String(
                admin["transactions.gameTransaction.template.is_jackpot"]
              ).toLowerCase() === "true"
                ? "Jackpot Game"
                : "Normal Game",
            gridType: `${Math.sqrt(
              admin["transactions.gameTransaction.tiles_count"]
            )}X${Math.sqrt(admin["transactions.gameTransaction.tiles_count"])}`,
            clientName: admin["playerSuperDistributor.client"],
            date: formatDateTime(admin.created_at),
          };
        });
        settableData(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.count,
        }));
      }
    } catch (error) {
      console.error("error", error);
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
    () => [{ label: "Select Grid Type", value: "" }],
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
  const { clients } = useGetClients({
    role: "super_distributor",
  });
  const client_typeOptions = useMemo(() => {
    if (!clients) return [{ label: "Select Client", value: "" }];

    return [
      { label: "Select Client", value: "" },
      ...clients.map((client) => ({
        label: client.name,
        value: client.distributor_id,
      })),
    ];
  }, [clients]);
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
      superName: formData.clientName || undefined,
      gameType: formData.gameType || undefined,
      gridType: formData.gridType || undefined,
      phoneNumber: formData.mobileNumber || undefined,
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
      clientName: "",
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
      const token = sessionStorage.getItem("masterToken");
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
        const data: Report[] = response.data.data.rows.map(
          (admin: GameData, index) => ({
            id: index + 1,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]?.toFixed(2),
            totalBuyOut: admin["transactions.total_buy_out"]?.toFixed(2),
            totalCommission: admin.commission_amount.toFixed(2),
            totalNetPL: admin.net_pl?.toFixed(2),
            payout: admin.payout_percentage?.toFixed(2),
            gameType:
              admin["transactions.gameTransaction.template.is_jackpot"] === true
                ? "Jackpot Game"
                : "Normal Game",
            gridType: `${Math.sqrt(
              admin["transactions.gameTransaction.tiles_count"]
            )}X${Math.sqrt(admin["transactions.gameTransaction.tiles_count"])}`,
            clientName: admin["playerSuperDistributor.client"],
            date: formatDateTime(admin.created_at),
          })
        );
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
              label: "Select Client",
              name: "clientName",
              type: "dropdown",
              value: formData.clientName,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: client_typeOptions,
            },

            {
              label: "Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter",
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
