import { lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PlayerSearch from "../Back-Office/pages/Players/PlayerSearch";
import GameTransaction from "../Back-Office/pages/Transactions/GameTransaction";
import GameHistory from "../Back-Office/pages/Game History/GameHistory";
import CreateBoUser from "../Back-Office/pages/boSetting/CreateBoUser";
import BoUserSettings from "../Back-Office/pages/boSetting/BoUserSettings";
import PlayerReports from "../Back-Office/pages/Reports/PlayerReports";
import DailyReports from "../Back-Office/pages/Reports/DailyReports";
import GameReport from "../Back-Office/pages/Reports/GameReport";
import Settlement from "../Back-Office/pages/Reports/Settlement";

const Layout = lazy(() => import("../Back-Office/Components/Layout"));
const Dashboard = lazy(
  () => import("../Back-Office/pages/Dashboard/Dashboard")
);

const BackOfficeRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Players */}
        <Route path="players/search" element={<PlayerSearch />} />

        {/* Transactions */}
        <Route path="transaction/game" element={<GameTransaction />} />

        {/* Games Hisotry */}
        <Route path="gamehistory" element={<GameHistory />} />

        {/* MBO Settings */}
        <Route path="bo-settings/create-user" element={<CreateBoUser />} />
        <Route path="bo-settings" element={<BoUserSettings />} />

        {/* Reports*/}
        <Route path="report/player" element={<PlayerReports />} />
        <Route path="report/daily" element={<DailyReports />} />
        <Route path="report/game" element={<GameReport />} />
        <Route path="report/downline-settlement" element={<Settlement />} />

        {/* Logs */}
      </Route>
    </Routes>
  );
};

export default BackOfficeRoutes;
