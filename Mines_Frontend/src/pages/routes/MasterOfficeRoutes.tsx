import { Route, Routes, Navigate } from "react-router-dom";

import CreateMessage from "../Master-Office/pages/MasterCMS/CreateMessage";
import Winnings from "../Master-Office/pages/Game Settings/Winnings";
import HowtoPlay from "../Master-Office/pages/MasterCMS/HowtoPlay";
import Rules from "../Master-Office/pages/MasterCMS/Rules";
import Terms from "../Master-Office/pages/MasterCMS/Terms";
import ClientSettings from "../Master-Office/pages/Client settings/ClientSettings";
import Layout from "../Master-Office/Components/Layout";
import Dashboard from "../Master-Office/pages/Dashboard/Dashboard";
import PlayerSearch from "../Master-Office/pages/players/PlayerSearch";
import BlockPlayer from "../Master-Office/pages/players/BlockPlayer";
import GameTransaction from "../Master-Office/pages/transactions/GameTransaction";
import GameHistory from "../Master-Office/pages/Game History/GameHistory";
import CreateClient from "../Master-Office/pages/Client settings/CreateClient";
import CreateMaster from "../Master-Office/pages/mboSetting/CreateMaster";
import MboUserSettings from "../Master-Office/pages/mboSetting/MboUserSettings";
import PlayerDeviceInformation from "../Master-Office/pages/players/PlayerDeviceInformation";
import CreateGame from "../Master-Office/pages/Games Creation/CreateGame";
import ManageGame from "../Master-Office/pages/Games Creation/ManageGame";
import ClientAdminLogs from "../Master-Office/pages/mboSetting/ClientAdminLogs";
import WebsiteMaintainance from "../Master-Office/pages/Client settings/WebsiteMaintainance";
import LivePlayerPL from "../Master-Office/pages/LivePlayerPL/LivePlayerPL";
import Faq from "../Master-Office/pages/MasterCMS/Faq";
import Settlement from "../Master-Office/pages/Reports/Settlement";
import PlayerReports from "../Master-Office/pages/Reports/PlayerReports";
import DailyReports from "../Master-Office/pages/Reports/DailyReports";
import GameReport from "../Master-Office/pages/Reports/GameReport";

const MasterOfficeRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="dashboard" element={<Dashboard />} />
      {/* Players */}
      <Route path="players/search" element={<PlayerSearch />} />
      <Route path="players/block" element={<BlockPlayer />} />
      <Route path="players/device-info" element={<PlayerDeviceInformation />} />
      {/* Transactions */}
      <Route path="transactions/game" element={<GameTransaction />} />
      {/* Games Hisotry */}
      <Route path="game-history" element={<GameHistory />} />
      {/* Games Creation */}
      <Route path="game-creation/create" element={<CreateGame />} />
      <Route path="game-creation/manage" element={<ManageGame />} />
      {/* Games Settings */}
      <Route path="game-settings/winning-percentage" element={<Winnings />} />
      {/* MBO Settings */}
      <Route path="mbo-settings/create-user" element={<CreateMaster />} />
      <Route path="mbo-settings/user-settings" element={<MboUserSettings />} />
      <Route path="mbo-settings/admin-logs" element={<ClientAdminLogs />} />
      {/* Client Settings */}

      <Route
        path="client-settings/maintenance"
        element={<WebsiteMaintainance />}
      />
      <Route path="client-settings/create-client" element={<CreateClient />} />
      <Route path="client-settings/manage" element={<ClientSettings />} />
      {/* Master CMS */}
      <Route path="master-cms/how-to-play" element={<HowtoPlay />} />
      <Route path="master-cms/rules" element={<Rules />} />
      <Route path="master-cms/faq" element={<Faq />} />
      <Route path="master-cms/terms" element={<Terms />} />
      <Route path="master-cms/create-message" element={<CreateMessage />} />

      {/* Reports*/}
      <Route path="reports/player" element={<PlayerReports />} />
      <Route path="reports/daily" element={<DailyReports />} />
      <Route path="reports/game" element={<GameReport />} />
      <Route path="reports/settlement" element={<Settlement />} />

      {/* Live Player P&L */}
      <Route path="live-player-pl" element={<LivePlayerPL />} />

      {/* ... other routes */}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default MasterOfficeRoutes;
