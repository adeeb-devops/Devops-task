import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdHistoryEdu } from "react-icons/md";
import { Outlet } from "react-router-dom";
import {
  RiUserLine,
  RiExchangeDollarLine,
  RiGamepadLine,
  RiSettings4Line,
  RiFileListLine,
  RiPieChartLine,
  RiAdminLine,
  RiTeamLine,
} from "react-icons/ri";
import Navbar from "./Navbar";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaCaretRight } from "react-icons/fa";
interface Permissions {
  [key: string]: string;
}
const Layout = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({});

  const toggleSubtabs = (tabName: string) => {
    setActiveTab((prevTab) => (prevTab === tabName ? null : tabName));
  };

  useEffect(() => {
    const token = sessionStorage.getItem("masterToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setPermissions(payload.permissions);
        // console.log("Token Decoded: ", payload);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);
  // console.log("Permissions", permissions);

  const hasPermission = (requiredPermission: string) => {
    return Object.values(permissions).includes(requiredPermission);
  };

  const canAccessMenuItem = (item: any) => {
    if (item.alwaysVisible) {
      return true;
    }
    return hasPermission(item.permission);
  };

  const mainTabClasses = "layout-main-tabs";
  const subTabClasses = "layout-sub-tabs";

  const menuItems = [
    {
      name: "Dashboard",
      icon: LuLayoutDashboard,
      link: "/master-office/dashboard",
      alwaysVisible: true,
    },
    {
      name: "Players",
      icon: RiUserLine,
      permission: "Players",
      subtabs: [
        {
          name: "Player Search",
          link: "/master-office/players/search",
          permission: "Player Search",
        },
        {
          name: "Block Players",
          link: "/master-office/players/block",
          permission: "Block Players",
        },
        // {
        //   name: "Player Device Info",
        //   link: "/master-office/players/device-info",
        //   permission: "Player Device Info",
        // },
      ],
    },
    {
      name: "Transactions",
      icon: RiExchangeDollarLine,
      permission: "Transactions",
      subtabs: [
        {
          name: "Game Transactions",
          link: "/master-office/transactions/game",
          permission: "Game Transactions",
        },
      ],
    },
    {
      name: "Game History",
      icon: MdHistoryEdu,
      link: "/master-office/game-history",
      permission: "Game History",
    },
    {
      name: "Game Creation",
      icon: RiGamepadLine,
      permission: "Game Creation",
      subtabs: [
        {
          name: "Create Game",
          link: "/master-office/game-creation/create",
          permission: "Create Game",
        },
        {
          name: "Manage Game",
          link: "/master-office/game-creation/manage",
          permission: "Manage Game",
        },
      ],
    },
    {
      name: "Game Settings",
      icon: RiSettings4Line,
      permission: "Game Settings",
      subtabs: [
        {
          name: "Winnings % Settings",
          link: "/master-office/game-settings/winning-percentage",
          permission: "Winnings % Settings",
        },
      ],
    },
    {
      name: "MBO Settings",
      icon: RiAdminLine,
      permission: "MBO Settings",
      subtabs: [
        {
          name: "Create MBO User",
          link: "/master-office/mbo-settings/create-user",
          permission: "Create Mbo user",
        },
        {
          name: "User MBO Settings",
          link: "/master-office/mbo-settings/user-settings",
          permission: "User Mbo Settings",
        },
        {
          name: "Admin Logs",
          link: "/master-office/mbo-settings/admin-logs",
          permission: "Admin Logs",
        },
      ],
    },
    {
      name: "Client Settings",
      icon: RiTeamLine,
      permission: "Client Settings",
      subtabs: [
        {
          name: "Create Client",
          link: "/master-office/client-settings/create-client",
          permission: "Create Client",
        },
        {
          name: "Client Management",
          link: "/master-office/client-settings/manage",
          permission: "Client Management",
        },

        {
          name: "Website Maintenance",
          link: "/master-office/client-settings/maintenance",
          permission: "Website Maintainance",
        },
      ],
    },
    {
      name: "Master CMS",
      icon: RiFileListLine,
      permission: "Master CMS",
      subtabs: [
        {
          name: "How to Play",
          link: "/master-office/master-cms/how-to-play",
          permission: "How to Play",
        },
        {
          name: "Rules",
          link: "/master-office/master-cms/rules",
          permission: "Rules",
        },
        {
          name: "FAQ",
          link: "/master-office/master-cms/faq",
          permission: "Faq",
        },
        {
          name: "Terms & Conditions",
          link: "/master-office/master-cms/terms",
          permission: "Terms & Condition",
        },
        {
          name: "Create Message",
          link: "/master-office/master-cms/create-message",
          permission: "Create Message",
        },
      ],
    },
    {
      name: "Reports",
      icon: RiPieChartLine,
      permission: "Reports",
      subtabs: [
        {
          name: "Player Report",
          link: "/master-office/reports/player",
          permission: "Player Report",
        },
        {
          name: "Daily Report",
          link: "/master-office/reports/daily",
          permission: "Daily Report",
        },
        {
          name: "Game Reports",
          link: "/master-office/reports/game",
          permission: "Game Reports",
        },
        {
          name: "Downline Settlement Report",
          link: "/master-office/reports/settlement",
          permission: "Downline Settlement Report",
        },
      ],
    },
    {
      name: "Live Player P&L",
      icon: RiUserLine,
      link: "/master-office/live-player-pl",
      permission: "Live Player P&L",
    },
  ];

  return (
    // <div className="flex min-h-screen ">
    <div className="flex flex-col overflow-hidden">
      {/* <Navbar /> */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      {/* <div className="fixed top-[80px] left-0 bottom-0 border-2 border-neutral-500 border-opacity-10 w-[242px] overflow-y-auto scrollbar-hide"> */}
      {/* <div className="flex flex-wrap items-center justify-between py-3 ml-3"> */}

      <div className="flex flex-1 mt-[80px]">
        <div
          className={`fixed top-[80px] left-0 bottom-0 w-[242px] bg-white overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out 
                      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                      lg:translate-x-0 z-40 border-r-2 border-neutral-500 border-opacity-10`}
        >
          <div className="py-3 ml-3">
            <ul>
              {/* {menuItems.map((item, index) => ( */}
              {menuItems.filter(canAccessMenuItem).map((item, index) => (
                <li key={index}>
                  {item.link ? (
                    <Link to={item.link} className={`${mainTabClasses}`}>
                      <div className="flex items-center gap-x-4">
                        <item.icon size={30} />
                        {item.name}
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`${mainTabClasses}`}
                      onClick={() => toggleSubtabs(item.name)}
                    >
                      <div className="flex items-center gap-x-4">
                        <item.icon size={30} />
                        {item.name}
                      </div>
                      <FaCaretRight
                        size={20}
                        className={`${
                          activeTab === item.name && "rotate-[92deg]"
                        } mt-1`}
                      />
                    </div>
                  )}
                  {activeTab === item.name && item.subtabs && (
                    <ul>
                      {item.subtabs
                        .filter(canAccessMenuItem)
                        .map((subtab, subIndex) => (
                          <li key={subIndex} className={`${subTabClasses}`}>
                            <Link to={subtab.link}>{subtab.name}</Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:ml-[242px] flex-1 h-[calc(100vh-80px)] bg-white overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-hide">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
