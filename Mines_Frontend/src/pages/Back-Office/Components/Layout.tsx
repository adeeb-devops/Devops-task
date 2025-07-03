import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCaretRight } from "react-icons/fa";

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

import { LuLayoutDashboard } from "react-icons/lu";
import {
  RiAdminLine,
  RiExchangeDollarLine,
  RiPieChartLine,
  RiUserLine,
} from "react-icons/ri";
import { MdHistoryEdu } from "react-icons/md";
interface Permissions {
  [key: string]: string;
}
const Layout = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const backToken = sessionStorage.getItem("clientToken");
    if (backToken) {
      try {
        const payload = JSON.parse(atob(backToken.split(".")[1]));
        setPermissions(payload.permissions);
        setRole(payload.role);
        // console.log("Token Decoded: ", payload.permissions);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const toggleSubtabs = (tabName: string) => {
    setActiveTab((prevTab) => (prevTab === tabName ? null : tabName));
  };

  const mainTabClasses = "layout-main-tabs";
  const subTabClasses = "layout-sub-tabs";

  const menuItems = [
    {
      name: "Dashboard",
      icon: LuLayoutDashboard,
      link: "/back-office/dashboard",
      alwaysVisible: true,
    },
    {
      name: "Players",
      icon: RiUserLine,
      permission: "Player Search",
      subtabs: [
        {
          name: "Player Search",
          link: "/back-office/players/search",
          permission: "Player Search",
        },
      ],
    },
    {
      name: "Transaction",
      icon: RiExchangeDollarLine,
      permission: "Game Transactions",

      subtabs: [
        {
          name: "Game Transactions",
          link: "/back-office/transaction/game",
          permission: "Game Transactions",
        },
      ],
    },
    {
      name: "Game History",
      icon: MdHistoryEdu,
      link: "/back-office/gamehistory",
      permission: "Game History",
    },
    {
      name: "BO Settings",
      icon: RiAdminLine,
      permission: "BO Settings",

      subtabs: [
        {
          name: "User Settings",
          link: "/back-office/bo-settings",
          permission: "BO User Settings",
        },
        {
          name: "Create User",
          link: "/back-office/bo-settings/create-user",
          permission: "Create BO User",
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
          link: "/back-office/report/player",
          permission: "Player Report",
        },
        {
          name: "Daily Report",
          link: "/back-office/report/daily",
          permission: "Daily Report",
        },
        {
          name: "Game Report",
          link: "/back-office/report/game",
          permission: "Game Report",
        },
        {
          name: "Settlement Report",
          link: "/back-office/report/downline-settlement",
          permission: "Upline Settlement Report",
        },
      ],
    },
  ];
  const hasPermission = (requiredPermission: string) => {
    return Object.values(permissions).includes(requiredPermission);
  };

  const canAccessMenuItem = (item: any) => {
    if (item.alwaysVisible) {
      return true;
    }
    if (
      item.roleRestriction &&
      item.roleRestriction.includes(role.toLowerCase())
    ) {
      return false;
    }
    return hasPermission(item.permission);
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 mt-[80px]">
        <div
          className={`fixed top-[80px] left-0 bottom-0 w-[242px] bg-white overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out 
                      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                      lg:translate-x-0 z-40 border-r-2 border-neutral-500 border-opacity-10`}
        >
          <div className="py-3 ml-3">
            <ul>
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
