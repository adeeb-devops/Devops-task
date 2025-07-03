import React, { useState, useEffect, useMemo } from "react";
import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import axios from "axios";
import { toast } from "react-toastify";
import useGetClients from "../../../hooks/useGetClients";
type PlayerStatistics = {
  id: number;
  player_name: string;
  status: string;
  created_at: string;
  player_type: string;
  "playerSuperDistributor.name": string;
  "playerSuperDistributor.client": string;
  "transactions.lifetimePl": number;
  "transactions.todayPl": number;
  "transactions.last7DaysPl": number;
  "transactions.weekPl": number;
  "transactions.monthPl": number;
  "transactions.lastMonthPl": number;
  "transactions.threeMonthPl": number;
  "transactions.lifetimePlPercentage": string;
  "transactions.totalBettingAmount": number;
};

interface Report {
  id: number;
  playerName: string;
  username: string;
  playerType: string;
  clientName: string;
  playerStatus: string;
  todayPL: string;
  thisWeekPL: string;
  last7DaysPL: string;
  thisMonthPL: string;
  lastMonthPL: string;
  last3MonthsPL: string;
  lifeTimePL: string;
  lifeTimePLPercentage: string;
  regDate: string;
}

const LivePlayerPL = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [formData, setFormData] = useState({
    playerName: "",
    playerId: "",
    username: "",
    clientName: "",
    playerStatus: "",
    playerType: "",
  });

  const [tableData, setTableData] = useState<Report[]>([]);
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
    { header: "Username", accessor: "username" },
    { header: "Player Type", accessor: "playerType" },
    { header: "Client Name", accessor: "clientName" },
    { header: "Player Status", accessor: "playerStatus" },
    { header: "Today P&L", accessor: "todayPL" },
    { header: "This Week P&L", accessor: "thisWeekPL" },
    { header: "Last 7 Days P&L", accessor: "last7DaysPL" },
    { header: "This Month P&L", accessor: "thisMonthPL" },
    { header: "Last Month P&L", accessor: "lastMonthPL" },
    { header: "Last 3 Months P&L", accessor: "last3MonthsPL" },
    { header: "Lifetime P&L", accessor: "lifeTimePL" },
    { header: "Lifetime P&L %", accessor: "lifeTimePLPercentage" },
    { header: "Reg. Date", accessor: "regDate" },
  ];
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

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/player/livepl`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            ...searchParams,
            offset: pagination.page * pagination.rowsPerPage,
            limit: pagination.rowsPerPage,
          },
        }
      );

      if (response.data.success) {
        const data: Report[] = response.data.data.rows.map(
          (player: PlayerStatistics) => ({
            id: player.id,
            playerName: player.player_name,
            username: player.player_name,
            playerType: player.player_type,
            clientName: player["playerSuperDistributor.name"],
            playerStatus: player.status,
            todayPL: player["transactions.todayPl"].toFixed(2),
            thisWeekPL: player["transactions.weekPl"].toFixed(2),
            last7DaysPL: player["transactions.last7DaysPl"].toFixed(2),
            thisMonthPL: player["transactions.monthPl"].toFixed(2),
            lastMonthPL: player["transactions.lastMonthPl"].toFixed(2),
            last3MonthsPL: player["transactions.threeMonthPl"].toFixed(2),
            lifeTimePL: player["transactions.lifetimePl"].toFixed(2),
            lifeTimePLPercentage: player["transactions.lifetimePlPercentage"],
            regDate: formatDateTime(player.created_at),
          })
        );
        setTableData(data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.data.count,
        }));
      }
    } catch (error) {
      console.error("Error fetching report", error);
      toast.error("Error fetching report!");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      playerName: "",
      playerId: "",
      username: "",
      clientName: "",
      playerStatus: "",
      playerType: "",
    });
    setSearchParams({});
  };

  const handleSubmit = () => {
    const searchParams = {
      playerName: formData.playerName || undefined,
      playerId: formData.playerId || undefined,
      username: formData.username || undefined,
      name: formData.clientName || undefined,
      status: formData.playerStatus || undefined,
      playerType: formData.playerType || undefined,
    };
    const hasSearchParams = Object.values(searchParams).some(
      (value) => value !== undefined
    );

    if (hasSearchParams) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      setSearchParams(searchParams);
    } else {
      toast.info("Enter at least one search parameter.");
    }
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
    fetchReport();
  }, [pagination.page, pagination.rowsPerPage, searchParams]);

  return (
    <div>
      <h1 className="title">Live Player P&L</h1>
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
              label: "Username",
              name: "username",
              type: "text",
              value: formData.username,
              onChange: handleInputChange,
              placeholder: "Enter Username",
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
              label: "Client",
              name: "clientName",
              type: "dropdown",
              value: formData.clientName,
              onChange: handleInputChange,
              placeholder: "Select Client",
              options: player_clientOptions,
            },
            {
              label: "Player Status",
              name: "playerStatus",
              type: "dropdown",
              value: formData.playerStatus,
              onChange: handleInputChange,
              placeholder: "Select Status",
              options: player_statusOptions,
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
          data={tableData}
          columns={columns}
          keyExtractor={(player) => player.id}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default LivePlayerPL;
