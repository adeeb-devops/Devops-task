import React, { useState, useEffect } from "react";
import { Container, Box, Tabs, Tab } from "@mui/material";

import InputWithButtons from "../../Components/InputWithButtons";
import ReusableTable, { TableColumn } from "../../Components/ReusableTable";
import { MdDelete } from "react-icons/md";
import { RiEditCircleLine } from "react-icons/ri";
import { useDistributors } from "../../Components/fetchDistributors";
import PopupsWithInput from "../../Components/Popups/PopupsWithInput";
import { toast } from "react-toastify";
import axios from "axios";

const gameOptions = [
  { value: "", label: "Select Game Type" },
  { value: "roulette", label: "Roulette" },
  { value: "manual_roulette", label: "Manual Roulette" },
  { value: "lottery", label: "Lottery Spin Wheel" },
  { value: "andar-bahar", label: "Andar Bahar" },
  { value: "raashi", label: "Rashi Spin Wheel" },
  { value: "triplechance", label: "Triple Chance" },
];

// Interface for table data based on API responses
interface TableData {
  srNo: number;
  id: number;
  cycle_count?: number;
  gameType?: string;
  status?: string;
  clientName?: string;
  agentRole?: string;
  playerName?: string;
  manipulation: number;
  manipulationType: string;
}

// Interface for form data
interface FormData {
  gameType?: string;
  clientName?: string;
  superDistributor?: string;
  distributor?: string;
  subDistributor?: string;
  retailer?: string;
  player?: string;
  manipulation: string;
}
const Winnings: React.FC = () => {
  // Basic states
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>([]);

  // Edit popup states
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [manipulationEdit, setManipulationEdit] = useState({
    manipulation: 0,
    cycle_count: 0,
  });

  // Form data states for each tab
  const [overallData, setOverallData] = useState<FormData>({
    gameType: "",
    manipulation: "",
  });

  const [agentData, setAgentData] = useState<FormData>({
    superDistributor: "",
    distributor: "",
    subDistributor: "",
    retailer: "",
    manipulation: "",
  });
  const [playerData, setPlayerData] = useState<FormData>({
    // superDistributor: "",
    // distributor: "",
    // subDistributor: "",
    clientName: "",
    player: "",
    manipulation: "",
  });

  const [playerOptions, setPlayerOptions] = useState([
    { value: "", label: "Select Player" },
  ]);
  const [clientOptions, setClientOptions] = useState([
    { value: "", label: "Select Client" },
  ]);
  useEffect(() => {
    const fetchPlayerOptions = async () => {
      if (!playerData.superDistributor) {
        setPlayerOptions([{ value: "", label: "Select Player" }]);
        return;
      }
      try {
        const token = sessionStorage.getItem("masterToken");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND}/player`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              super_distributor: playerData.superDistributor,
              distributor: playerData.distributor || undefined,
              sub_distributor: playerData.subDistributor || undefined,
              retailer: playerData.retailer || undefined,
            },
          }
        );

        if (response.data.success) {
          // console.log("Fetched Players:", response.data.data);
          const fetchedPlayerOptions = [
            { value: "", label: "Select Player" },
            ...response.data.data.map((player) => ({
              value: player.id,
              label: player.player_name,
            })),
          ];
          setPlayerOptions(fetchedPlayerOptions);
        }
      } catch (error) {
        toast.error("Failed to fetch player options. Please try again.");
      }
    };

    fetchPlayerOptions();
  }, [
    playerData.superDistributor,
    playerData.distributor,
    playerData.subDistributor,
    playerData.retailer,
  ]);

  const superDistributors = useDistributors("super_distributor", undefined);
  const currentData = tabValue === 1 ? agentData : playerData;
  const selectedSuperDistributor = superDistributors.find(
    (d) => d.value === currentData.superDistributor
  );
  const distributors = useDistributors(
    "distributor",
    currentData.superDistributor,
    selectedSuperDistributor?.organization_id,
    selectedSuperDistributor?.parent_id
  );

  const selectedDistributor = distributors.find(
    (d) => d.value === currentData.distributor
  );

  const subDistributors = useDistributors(
    "sub_distributor",
    currentData.distributor,
    selectedSuperDistributor?.organization_id,
    selectedDistributor?.parent_id
  );

  const selectedSubDistributor = subDistributors.find(
    (d) => d.value === currentData.subDistributor
  );

  const retailers = useDistributors(
    "retailer",
    currentData.subDistributor,
    selectedSuperDistributor?.organization_id,
    selectedSubDistributor?.parent_id
  );
  useEffect(() => {
    const resetFields = (level: string) => {
      const setter = tabValue === 1 ? setAgentData : setPlayerData;
      const updates: { [key: string]: string } = {};

      const resetOrder = [
        "superDistributor",
        "distributor",
        "subDistributor",
        "retailer",
        "player",
      ];
      const startIndex = resetOrder.indexOf(level) + 1;

      resetOrder.slice(startIndex).forEach((field) => {
        updates[field] = "";
      });

      if (Object.keys(updates).length > 0) {
        setter((prev) => ({
          ...prev,
          ...updates,
          manipulation: prev.manipulation, // Preserve manipulation
        }));
      }
    };

    if (currentData.superDistributor) resetFields("superDistributor");
    if (currentData.distributor) resetFields("distributor");
    if (currentData.subDistributor) resetFields("subDistributor");
    if (currentData.retailer) resetFields("retailer");
  }, [
    currentData.superDistributor,
    currentData.distributor,
    currentData.subDistributor,
    currentData.retailer,
    tabValue,
  ]);

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 50,
    totalItems: 0,
  });
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

  // Helper function to get API endpoints based on current tab
  const getApiConfig = () => {
    const baseUrl = `${import.meta.env.VITE_APP_BACKEND}`;
    switch (tabValue) {
      case 0:
        return {
          fetchUrl: `${baseUrl}/contest/game/manipulation`,
          submitUrl: `${baseUrl}/contest/game/manipulation`,
        };
      case 1:
        return {
          fetchUrl: `${baseUrl}/distributor`,
          submitUrl: `${baseUrl}/distributor`,
        };
      case 2:
        return {
          fetchUrl: `${baseUrl}/player`,
          submitUrl: `${baseUrl}/player`,
        };
      default:
        return {
          fetchUrl: "",
          submitUrl: "",
        };
    }
  };

  // Table columns configuration based on current tab
  const getColumns = (): TableColumn<TableData>[] => {
    const baseColumns: TableColumn<TableData>[] = [
      { header: "Sr No.", accessor: "srNo" },
      { header: "Manipulation Type", accessor: "manipulationType" },
      { header: "Client Name", accessor: "clientName" },
      { header: "Player Name", accessor: "playerName" },
      { header: "Manipulation %", accessor: "manipulation" },
      { header: "Status", accessor: "status" },
    ];

    const actionColumn: TableColumn<TableData> = {
      header: "Actions",
      accessor: (row: TableData) => (
        <div className="flex gap-4">
          <RiEditCircleLine
            size={25}
            className="cursor-pointer hover:scale-125"
            onClick={() => handleEdit(row)}
          />
          <MdDelete
            size={25}
            className="cursor-pointer hover:scale-125 text-red-700"
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    };

    switch (tabValue) {
      case 0:
        return [
          ...baseColumns,
          // { header: "Game Type", accessor: "gameType" },
          // { header: "Cycle Count", accessor: "cycle_count" },
          actionColumn,
        ];
      case 1:
        return [
          ...baseColumns,
          // { header: "Agent Name", accessor: "clientName" },
          // { header: "Agent Role", accessor: "agentRole" },
          actionColumn,
        ];
      case 2:
        return [
          ...baseColumns,
          // { header: "Player Name", accessor: "playerName" },
          actionColumn,
        ];
      default:
        return baseColumns;
    }
  };

  // Function to get input fields based on current tab
  const getFields = () => {
    const currentFormData =
      tabValue === 0 ? overallData : tabValue === 1 ? agentData : playerData;
    const setFormData =
      tabValue === 0
        ? setOverallData
        : tabValue === 1
        ? setAgentData
        : setPlayerData;

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const fields = [];

    // Game Type field only for Overall tab
    // if (tabValue === 0) {
    //   fields.push({
    //     label: "Game Type",
    //     name: "gameType",
    //     type: "dropdown",
    //     value: currentFormData.gameType || "",
    //     onChange: handleChange,
    //     options: gameOptions,
    //   });
    // }

    // Agent/Player selection fields
    if (tabValue === 1 || tabValue === 2) {
      fields.push(
        // {
        //   label: "Super Distributor",
        //   name: "superDistributor",
        //   type: "dropdown",
        //   value: currentFormData.superDistributor || "",
        //   onChange: handleChange,
        //   options: superDistributors,
        // },
        // {
        //   label: "Distributor",
        //   name: "distributor",
        //   type: "dropdown",
        //   value: currentFormData.distributor || "",
        //   onChange: handleChange,
        //   options: distributors,
        // },
        // {
        //   label: "Sub Distributor",
        //   name: "subDistributor",
        //   type: "dropdown",
        //   value: currentFormData.subDistributor || "",
        //   onChange: handleChange,
        //   options: subDistributors,
        // },
        // {
        //   label: "Retailer",
        //   name: "retailer",
        //   type: "dropdown",
        //   value: currentFormData.retailer || "",
        //   onChange: handleChange,
        //   options: retailers,
        // }

        {
          label: "Client",
          name: "clientName",
          type: "dropdown",
          value: currentFormData.clientName || "",
          onChange: handleChange,
          options: clientOptions,
        }
      );
    }

    // Player field for Player tab
    if (tabValue === 2) {
      // fields.push({
      //   label: "Client",
      //   name: "clientName",
      //   type: "dropdown",
      //   value: currentFormData.clientName || "",
      //   onChange: handleChange,
      //   options: clientOptions,
      // });
      fields.push({
        label: "Player",
        name: "player",
        type: "dropdown",
        value: currentFormData.player || "",
        onChange: handleChange,
        options: playerOptions,
      });
    }

    // Manipulation field for all tabs
    fields.push({
      label: "Manipulation %",
      name: "manipulation",
      type: "number",
      value: currentFormData.manipulation,
      onChange: handleChange,
      placeholder: "Enter manipulation percentage",
    });

    return fields;
  };
  function Capitalize(str) {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  }
  // API Calls
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("masterToken");
      const { fetchUrl } = getApiConfig();

      const response = await axios.get(fetchUrl, {
        // headers: { Authorization: `Bearer ${token}` },
        // params: {
        //   offset: pagination.page * pagination.rowsPerPage,
        //   limit: pagination.rowsPerPage,
        // },
      });

      if (response.data.success) {
        // console.log("data ",response.data.data)
        let transformedData;
        // Handle different response structures based on tab
        switch (tabValue) {
          case 0: // Game Wise
            transformedData = response.data.data.gameWeightage.map((item) => ({
              srNo: Number(item.id),
              id: Number(item.id),
              gameType: Capitalize(item?.game_type),
              cycle_count: item.cycle_count,
              manipulation: Number(item.weightage),
            }));
            break;

          case 1: // Distributor
            transformedData = response.data.data.distributor.map((item) => ({
              srNo: Number(item.id),
              id: Number(item?.id),
              clientName: item?.distributor_id,
              agentRole: Capitalize(item?.role),
              manipulation: Number(item.waitage),
            }));
            break;

          case 2: // Player
            transformedData = response.data.data.map((item) => ({
              srNo: Number(item.id),
              id: Number(item.id),
              playerName: item.player_name,
              manipulation: Number(item.waitage),
            }));
            break;
        }
        setTableData(transformedData);
        console.log("Transformed table data:", transformedData);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.count || 0,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("masterToken");
      const { submitUrl } = getApiConfig();
      const submitData = getSubmitData();

      // Different handling based on tab
      if (tabValue === 0) {
        // Original POST request for overall game-wise
        const response = await axios.post(submitUrl, submitData, {
          // headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          toast.success("Successfully submitted!");
          fetchData();
          handleClear();
        }
      } else {
        // PUT request for agent-wise and player-wise
        let id: number | undefined;

        if (tabValue === 1) {
          const selectedDistributor = (() => {
            if (agentData.retailer) {
              return retailers.find((d) => d.value === agentData.retailer);
            }
            if (agentData.subDistributor) {
              return subDistributors.find(
                (d) => d.value === agentData.subDistributor
              );
            }
            if (agentData.distributor) {
              return distributors.find(
                (d) => d.value === agentData.distributor
              );
            }
            if (agentData.superDistributor) {
              return superDistributors.find(
                (d) => d.value === agentData.superDistributor
              );
            }
            return undefined;
          })();

          id = selectedDistributor?.parent_id;

          if (!id) {
            toast.error("Could not determine agent ID");
            setIsLoading(false);
            return;
          }
        } else {
          // For player-wise,
          id = Number(playerData.player);
        }

        const response = await axios.put(`${submitUrl}/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success("Successfully updated!");
          fetchData();
          handleClear();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const currentData =
      tabValue === 0 ? overallData : tabValue === 1 ? agentData : playerData;

    if (!currentData.manipulation) {
      toast.error("Please enter a manipulation percentage");
      return false;
    }

    // Different validation ranges for overall vs agent/player
    const manipulationValue = Number(currentData.manipulation);
    if (tabValue === 0) {
      if (manipulationValue < 0 || manipulationValue > 1) {
        toast.error("Please enter a valid manipulation percentage (0-1)");
        return false;
      }
    } else {
      if (manipulationValue < 1 || manipulationValue > 100) {
        toast.error("Please enter a valid manipulation percentage (1-100)");
        return false;
      }
    }

    if (tabValue === 0 && !currentData.gameType) {
      toast.error("Please select a game type");
      return false;
    }

    if (tabValue === 1 && !getSelectedAgent()) {
      toast.error("Please select an agent");
      return false;
    }

    if (tabValue === 2 && !currentData.player) {
      toast.error("Please select a player");
      return false;
    }
    return true;
  };

  // Helper functions
  const getSelectedAgent = () => {
    return (
      agentData.retailer ||
      agentData.subDistributor ||
      agentData.distributor ||
      agentData.superDistributor
    );
  };

  const getSubmitData = () => {
    switch (tabValue) {
      case 0:
        return {
          gameType: overallData.gameType,
          weightage: Number(overallData.manipulation),
        };
      case 1:
        return {
          clientName: getSelectedAgent(),
          agentRole: getAgentRole(),
          waitage: Number(agentData.manipulation),
        };
      case 2:
        return {
          playerName: playerData.player,
          waitage: Number(playerData.manipulation),
        };
    }
  };

  const getAgentRole = () => {
    if (agentData.retailer) return "retailer";
    if (agentData.subDistributor) return "sub_distributor";
    if (agentData.distributor) return "distributor";
    if (agentData.superDistributor) return "super_distributor";
    return "";
  };

  // Event handlers
  const handleEdit = (data: TableData) => {
    // console.log("Edit data:", data);
    if (!data.id) {
      toast.error("Invalid record ID");
      return;
    }
    setEditingId(data.id);
    setManipulationEdit({
      manipulation: data.manipulation,
      cycle_count: data.cycle_count,
    });
    setOpenEditInfo(true);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    setIsLoading(true);
    const updateData =
      tabValue === 0
        ? {
            weightage: Number(manipulationEdit.manipulation),
            cycle_count: Number(manipulationEdit.cycle_count),
          } // Game wise uses 'weightage'
        : { waitage: Number(manipulationEdit.manipulation) };
    try {
      const token = sessionStorage.getItem("masterToken");
      const { submitUrl } = getApiConfig();

      const response = await axios.put(
        `${submitUrl}/${editingId}`,
        { ...updateData }
        // {
        //   headers: { Authorization: `Bearer ${token}` },
        // }
      );

      if (response.data.success) {
        toast.success("Successfully updated!");
        fetchData();
        setEditingId(null);
        setOpenEditInfo(false);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("masterToken");
      const { submitUrl } = getApiConfig();

      const response = await axios.delete(`${submitUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Successfully deleted!");
        fetchData();
        setEditingId(null);
      }
    } catch (error) {
      toast.error("Deletion failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    switch (tabValue) {
      case 0:
        setOverallData({ gameType: "", manipulation: "" });
        break;
      case 1:
        setAgentData({
          superDistributor: "",
          distributor: "",
          subDistributor: "",
          retailer: "",
          manipulation: "",
        });
        break;
      case 2:
        setPlayerData({
          superDistributor: "",
          distributor: "",
          subDistributor: "",
          retailer: "",
          player: "",
          manipulation: "",
        });
        break;
    }
  };
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setManipulationEdit((prev) => ({ ...prev, [name]: value }));
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [tabValue, pagination.page, pagination.rowsPerPage]);

  // Reset form when changing tabs
  useEffect(() => {
    handleClear();
  }, [tabValue]);

  return (
    <Container maxWidth="xl">
      <h1 className="m-4 -ml-2 text-3xl font-medium">Winnings % Settings</h1>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Overall Game Wise" />
          <Tab label="Client Wise" />
          <Tab label="Player Wise" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        <InputWithButtons
          fields={getFields()}
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
              disabled: isLoading,
            },
          ]}
        />
      </Box>
      <Box sx={{ my: 4 }}>
        <ReusableTable
          columns={getColumns()}
          data={tableData}
          keyExtractor={(bets) => bets.srNo}
          pagination={pagination}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>

      {openEditInfo && (
        <PopupsWithInput
          // open={openEditInfo}
          onClose={() => {
            setOpenEditInfo(false);
            setEditingId(null);
          }}
          fields={[
            {
              label: "Manipulation %",
              name: "manipulation",
              type: "number",
              value: manipulationEdit.manipulation,
              onChange: handleEditChange,
            },
            tabValue === 0 && {
              label: "Cycle Count",
              name: "cycle_count",
              type: "number",
              value: manipulationEdit.cycle_count,
              onChange: handleEditChange,
            },
          ].filter(Boolean)}
          dialogTitle="Edit Manipulation %"
          buttons={[
            {
              name: "Update",
              onClick: handleUpdate,
              className: "SubmitButton",
              // disabled: isLoading,
            },
            {
              name: "Cancel",
              onClick: () => setOpenEditInfo(false),
              className: "ClearButton",
            },
          ]}
        />
      )}
    </Container>
  );
};

export default Winnings;
