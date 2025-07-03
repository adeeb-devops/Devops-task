import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import ReusableTable, {
  TableColumn,
} from "../../../Master-Office/Components/ReusableTable";
import InputWithButtons from "../../../Master-Office/Components/InputWithButtons";
import CSVExport from "../../../Master-Office/Components/CSVExport";

type PlayerData = {
  id: number;
  player_name: string;
  status: string;
  phone_number: string | null;
  balance: number;
  created_at: string;
  player_type: string;
  last_login: string;
  pl: number;
  commission: number;
  netPl: number;
  "playerSuperDistributor.name": string;
  "playerSuperDistributor.sharing_type": string;
  "playerSuperDistributor.self": string;
  "playerSuperDistributor.client": string;
  "transactions.total_buy_in": number;
  "transactions.total_buy_out": number;
};

interface Report {
  id: number;
  srNo: number;
  playerName: string;
  mobileNumber: number;
  balance: number;
  playerType: string;
  totalBuyIn: number;
  totalBuyOut: number;
  totalNetPL: number;
  totalCommission: number;
  lastActive: string;
  regDate: string;
}

const PlayerReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [tableData, settableData] = useState<Report[]>([]);
  const [formData, setFormData] = useState({
    playerType: "",
    mobileNumber: "",
    playerName: "",
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
    { header: "Balance", accessor: "balance" },
    { header: "Player Type", accessor: "playerType" },
    { header: "Total Buy In", accessor: "totalBuyIn" },
    { header: "Total Buy Out", accessor: "totalBuyOut" },
    { header: "Total Net P&L", accessor: "totalNetPL" },
    { header: "Total Commission", accessor: "totalCommission" },
    { header: "Last Active", accessor: "lastActive" },
    { header: "Reg. Date", accessor: "regDate" },
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
        `${import.meta.env.VITE_APP_BACKEND}/report/player-report`,
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
      console.log("response settlement reports ", response.data.data.rows);
      if (response.data.success) {
        const data: Report[] = response.data.data.rows.map(
          (admin: PlayerData, index) => ({
            id: admin.id,
            srNo: index + 1,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            balance: admin.balance?.toFixed(2),
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]?.toFixed(2),
            totalBuyOut: admin["transactions.total_buy_out"]?.toFixed(2),
            totalNetPL: admin.netPl?.toFixed(2),
            totalCommission: admin.commission?.toFixed(2),
            lastActive: formatDateTime(admin.last_login),
            regDate: formatDateTime(admin.created_at),
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
        `${import.meta.env.VITE_APP_BACKEND}/report/player-report`,
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
            id: admin.id,
            playerName: admin.player_name,
            mobileNumber: admin.phone_number || "NA",
            balance: admin.balance?.toFixed(2),
            playerType: admin.player_type,
            totalBuyIn: admin["transactions.total_buy_in"]?.toFixed(2),
            totalBuyOut: admin["transactions.total_buy_out"]?.toFixed(2),
            totalNetPL: admin.netPl?.toFixed(2),
            totalCommission: admin.commission?.toFixed(2),
            lastActive: formatDateTime(admin.last_login),
            regDate: formatDateTime(admin.created_at),
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
      <h1 className="title">Player Reports</h1>
      <div className="pt-5 ml-6 relative">
        <InputWithButtons
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

export default PlayerReports;
