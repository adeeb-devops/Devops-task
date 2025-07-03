import React, { useEffect, useState } from "react";
import {
  Switch,
  TextField,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import axios from "axios";
import { format, parseISO } from "date-fns";
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)",
}));

const StatusCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
}));

interface MaintenanceState {
  id: number;
  start_time: string;
  message: string;
  maintenance_key: boolean;
}

const WebsiteMaintenance: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceData, setMaintenanceData] =
    useState<MaintenanceState | null>({
      id: 0,
      maintenance_key: false,
      message: "",
      start_time: "",
    });
  const initializeMaintenance = async () => {
    if (!maintenanceData.message?.trim() || !maintenanceData.start_time) {
      toast.error("Please set both message and start time");
      return;
    }
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");
      const payload = {
        start_time: maintenanceData.start_time,
        message: maintenanceData.message,
        maintenance_key: true,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/maintenance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsInitialized(true);
        await fetchMaintenance();
        toast.success("Maintenance initialized successfully");
      }
    } catch (error) {
      console.error("Maintenance Initialization Error: ", error);
      toast.error("Failed to initialize maintenance");
    } finally {
      setIsLoading(false);
    }
  };
  const handleMaintenanceToggle = async () => {
    const willTurnOn = !maintenanceData.maintenance_key;
    // console.log(maintenanceData.start_time);
    // return;
    // Only validate message and time when turning maintenance ON
    if (
      willTurnOn &&
      (!maintenanceData.message?.trim() || !maintenanceData.start_time)
    ) {
      toast.error(
        "Please set both message and start time to enable maintenance mode"
      );
      return;
    }

    if (!isInitialized && willTurnOn) {
      await initializeMaintenance();
      return;
    }

    try {
      setIsLoading(true);
      const utcDate = maintenanceData.start_time
        ? format(
            parseISO(maintenanceData.start_time),
            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          )
        : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const token = sessionStorage.getItem("masterToken");

      const payload = {
        time: utcDate,
        message: maintenanceData.message,
        maintenance_key: !maintenanceData.maintenance_key,
      };
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BACKEND}/maintenance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Maintenance ", response);
      if (response.data.success) {
        await fetchMaintenance();
        toast.success(
          `Maintenance mode ${
            payload.maintenance_key ? "Activated" : "Deactivated"
          }`
        );
      }
    } catch (error) {
      console.error("Maintenance Error:  ", error);
      toast.error("Unable to fetch Status");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("masterToken");
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND}/maintenance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Maintenance ", response.data.data);
      if (response.data.success) {
        // const data= response.data.data.maintenanceEntries.map((entries) => ({
        //   id: entries?.id,
        //   start_time: entries?.start_time || "",
        //   message: entries?.message || "",
        //   maintenance_key: Boolean(entries?.maintenance_key),
        // }));
        // setMaintenanceData(data);
        const entry = response.data.data.maintenanceEntries[0];
        setMaintenanceData({
          id: entry?.id || 0,
          start_time: entry?.start_time || "",
          message: entry?.message || "",
          maintenance_key: Boolean(entry?.maintenance_key),
        });
        setIsInitialized(true);
      } else {
        setMaintenanceData({
          id: 0,
          maintenance_key: false,
          message: "",
          start_time: "",
        });
        setIsInitialized(false);
      }
    } catch (error) {
      console.error("Maintenance Error:  ", error);
      toast.error("Unable to fetch Status");
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maintenanceData) {
      setMaintenanceData({
        ...maintenanceData,
        message: e.target.value,
      });
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maintenanceData) {
      const localDateTime = e.target.value;
      // const utcDateTime = localDateTime
      //   ? new Date(localDateTime).toISOString()
      //   : "";
      const utcDateTime = localDateTime
        ? new Date(localDateTime).toISOString().slice(0, 19) + "Z"
        : "";
      setMaintenanceData({
        ...maintenanceData,
        start_time: utcDateTime,
      });
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);
  return (
    <>
      <h1 className="title flex items-center">
        Maintenance{" "}
        {isLoading && (
          <div className="animate-spin rounded-full mt-1.5 h-6 w-6 border-4 border-t-transparent border-gray-800 mx-4" />
        )}
      </h1>

      <Box sx={{ maxWidth: 1260, margin: "auto", padding: 2 }}>
        <StyledPaper>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h6">Website Maintenance</Typography>
            <Switch
              checked={Boolean(maintenanceData?.maintenance_key)}
              onChange={handleMaintenanceToggle}
              color="primary"
            />
          </Box>

          <TextField
            fullWidth
            type="datetime-local"
            label="Timer (Optional)"
            // value={formatDateTime(maintenanceData.start_time) || ""}
            value={
              maintenanceData.start_time
                ? new Date(maintenanceData.start_time)
                    .toLocaleString("sv", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(" ", "T")
                : ""
            }
            onChange={handleDateTimeChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Maintenance Message"
            value={maintenanceData.message || ""}
            onChange={handleMessageChange}
            sx={{ mb: 3 }}
            required
          />

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <StatusCard>
                {maintenanceData.maintenance_key ? (
                  <BuildIcon fontSize="large" color="warning" />
                ) : (
                  <CheckCircleIcon fontSize="large" color="success" />
                )}
                <Typography variant="h6" mt={2}>
                  {maintenanceData.maintenance_key
                    ? "Maintenance Mode"
                    : "All Systems Active"}
                </Typography>
              </StatusCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <StatusCard>
                <Typography variant="h6">Maintenance Message</Typography>
                <Typography variant="body2" mt={1}>
                  {maintenanceData.message || "No message set"}
                </Typography>
              </StatusCard>
            </Grid>
          </Grid>
        </StyledPaper>
      </Box>
    </>
  );
};

export default WebsiteMaintenance;
