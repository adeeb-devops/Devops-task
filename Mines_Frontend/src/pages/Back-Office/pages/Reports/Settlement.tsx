import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import CSVExport from "../../../Master-Office/Components/CSVExport";

type PlayerData = {
  srNo: number;
  playerName: string;
  phoneNumber: string | null;
  playerType: "real" | "cash" | string;
  gameType: string;
  sharingType: string;
  uplineName: string;
  totalBuyIn: string;
  totalBuyOut: string;
  totalCommission: string;
  netPl: string;
  selfPercentage: number;
  uplinePercentage: number;
  toGive: string;
  toTake: string;
  created_at: string;
};

interface Report {
  id: number;
  playerName: string;
  mobileNumber: number;
  playerType: string;
  gameType: string;
  totalBuyIn: number;
  totalBuyOut: number;
  totalCommission: number;
  totalNetPL: number;
  shareType: string;
  self: number;
  upline: number;
  goGive: number;
  toTake: number;
  srNo: number;
  uplineName: string;
  date: string;
}

const Settlement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [tableData, settableData] = useState<Report[]>([]);
  const [formData, setFormData] = useState({
    playerType: "",
    mobileNumber: "",
    playerName: "",
    sharingType: "",
    gameType: "",
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
    { header: "Game Type", accessor: "gameType" },
    { header: "Total Buy In", accessor: "totalBuyIn" },
    { header: "Total Buy Out", accessor: "totalBuyOut" },
    { header: "Total Commission", accessor: "totalCommission" },
    { header: "Total Net P&L", accessor: "totalNetPL" },
    { header: "Sharing Type", accessor: "shareType" },
    { header: "Self", accessor: "self" },
    { header: "Upline", accessor: "upline" },
    { header: "To Give", accessor: "goGive" },
    { header: "To Take", accessor: "toTake" },
    { header: "Upline Name", accessor: "uplineName" },
    { header: "Date", accessor: "date" },
  ];

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("clientToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/report/upline-settlement-report`,
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
      // console.log("response settlement reports ", response.data.data.rows);
      if (response.data.success) {
        const data: Report[] = response.data.data.rows.map(
          (admin: PlayerData, index) => ({
            id: admin.srNo,
            srNo: index + 1,
            playerName: admin.playerName,
            mobileNumber: admin.phoneNumber || "NA",
            playerType: admin.playerType,
            gameType: admin.gameType,
            totalBuyIn: admin.totalBuyIn,
            totalBuyOut: admin.totalBuyOut,
            totalCommission: Number(admin.totalCommission)?.toFixed(2),
            totalNetPL: Number(admin.netPl)?.toFixed(2),
            shareType: admin.sharingType,
            self: admin.selfPercentage.toFixed(2),
            upline: admin.uplinePercentage.toFixed(2),
            goGive: admin.toGive,
            toTake: "NA",
            uplineName: admin.uplineName,
            date: formatDateTime(admin.created_at),
          })
        );
        // console.log("data", data);

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

  const sharing_typeOptions = useMemo(
    () => [
      { label: "Select sharing Type", value: "" },
      { label: "Turnover (On Bets)", value: "turnover" },
      { label: "Commission Sharing", value: "commission" },
      { label: "P&L Sharing", value: "plsharing" },
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
    const params = {
      playerName: formData.playerName || undefined,
      playerType: formData.playerType || undefined,
      phoneNumber: formData.mobileNumber || undefined,
      sharingType: formData.sharingType || undefined,
      gameType: formData.gameType || undefined,
      // superDistributorName: formData.,
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
      sharingType: "",
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

  // const commissionsOptions = [
  //   { label: "Select Sharing Type", value: "" },
  //   { label: "Turnover (On Bets)", value: "turnover" },
  //   { label: "Revenue (On Commission)", value: "revenue" },
  //   { label: "P&L Sharing", value: "plsharing" },
  // ];
  async function fetchGameData(): Promise<Report[]> {
    try {
      const token = sessionStorage.getItem("clientToken");
      // const params = SearchParams();

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/report/upline-settlement-report`,
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
          (admin: PlayerData) => ({
            id: admin.srNo,
            playerName: admin.playerName,
            mobileNumber: admin.phoneNumber || "NA",
            playerType: admin.playerType,
            gameType: admin.gameType,
            totalBuyIn: admin.totalBuyIn,
            totalBuyOut: admin.totalBuyOut,
            totalCommission: Number(admin.totalCommission)?.toFixed(2),
            totalNetPL: Number(admin.netPl)?.toFixed(2),
            shareType: admin.sharingType,
            self: admin.selfPercentage.toFixed(2),
            upline: admin.uplinePercentage.toFixed(2),
            goGive: admin.toGive,
            toTake: "NA",
            uplineName: admin.uplineName,
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
      <h1 className="title">Settlement Reports</h1>
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
              label: "Date Range",
              name: "dateRange",
              type: "date",
              dateRange: formData.dateRange,
              handleDateChange: handleDateChange,
              placeholder: "Enter",
              aligned: true,
            },
            {
              label: "Sharing Type",
              name: "sharingType",
              type: "dropdown",
              value: formData.sharingType,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: sharing_typeOptions,
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

export default Settlement;
