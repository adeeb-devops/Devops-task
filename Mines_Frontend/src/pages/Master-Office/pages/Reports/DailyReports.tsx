import React, { useEffect, useMemo, useState } from "react";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import InputWithButtons from "../../Components/InputWithButtons";
import axios from "axios";
import { toast } from "react-toastify";
import useGetClients from "../../../hooks/useGetClients";
import CSVExport from "../../Components/CSVExport";

type PlayerData = {
  srNo: number;
  userId: number;
  playerName: string;
  phoneNumber: string | null;
  status: string;
  balance: string;
  playerType: string;
  registration_date: string;
  lastActive: string;
  superDistributorName: string;
  totalBuyIn: string;
  totalBuyOut: string;
  totalCommission: string;
  netPl: string;
  downlineName: string;
  reportDate: string;
};

interface Report {
  id: number;
  srNo: number;
  playerName: string;
  mobileNumber: number;
  playerType: string;
  totalBuyIn: number;
  totalBuyOut: number;
  totalCommission: number;
  repDate: string;
  clientName: string;
}

const DailyReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [tableData, settableData] = useState<Report[]>([]);
  const [formData, setFormData] = useState({
    playerType: "",
    mobileNumber: "",
    playerName: "",
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
    { header: "Report Date", accessor: "repDate" },
    { header: "Client Name", accessor: "clientName" },
  ];

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");

      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/report/daily-report`,
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
            id: admin.srNo,
            srNo: index + 1,
            playerName: admin.playerName,
            playerType: admin.playerType,
            mobileNumber: Number(admin.phoneNumber),
            totalBuyIn: Number(admin.totalBuyIn)?.toFixed(2),
            totalBuyOut: Number(admin.totalBuyOut)?.toFixed(2),
            totalCommission: Number(admin.totalCommission)?.toFixed(2),
            repDate: formatDateTime(admin.reportDate),
            clientName: admin.superDistributorName,
          })
        );
        console.log("data", data);

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
      playerName: formData.playerName,
      playerType: formData.playerType,
      superName: formData.clientName,
      phoneNumber: formData.mobileNumber,
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
        `${import.meta.env.VITE_APP_BACKEND}/report/daily-report`,
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
            playerType: admin.playerType,
            mobileNumber: Number(admin.phoneNumber),
            totalBuyIn: Number(admin.totalBuyIn)?.toFixed(2),
            totalBuyOut: Number(admin.totalBuyOut)?.toFixed(2),
            totalCommission: Number(admin.totalCommission)?.toFixed(2),
            repDate: formatDateTime(admin.reportDate),
            clientName: admin.superDistributorName,
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
      <h1 className="title">Daily Reports</h1>
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
              label: "Select Client",
              name: "clientName",
              type: "dropdown",
              value: formData.clientName,
              onChange: handleInputChange,
              placeholder: "Enter",
              options: player_clientOptions,
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

export default DailyReports;
