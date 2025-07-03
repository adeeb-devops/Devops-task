import { useState, useEffect } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import axios from "axios";

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const [currentDateTime, setCurrentDateTime] = useState(moment());
  const username = sessionStorage.getItem("adminName");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // const handleLogout = () => {
  //   sessionStorage.removeItem('masterToken');
  //   sessionStorage.removeItem("adminName");
  //   navigate("/master-office");
  //   toast.success("Logout Successfull");
  // };
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("masterToken");
      await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/admin/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      sessionStorage.removeItem("masterToken");
      sessionStorage.removeItem("adminName");
      navigate("/master-office");
      toast.success("Logout Successfull");
    } catch (error) {
      console.error("Error", error);
    }
  };
  return (
    <div className="bg-white p-4 flex border-2 justify-between bg-grey-200 h-15 items-center md:h-20 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <button className="mr-4 lg:hidden" onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <RiCloseLine size={24} />
          ) : (
            <RiMenu3Line size={24} />
          )}
        </button>
        <div className="bg-color p-2 rounded-full">
          <FaUserAstronaut size={32} className="text-white" />
        </div>
        <h1 className="text-2xl ml-4 my-auto font-mono hidden md:block">
          Welcome,{" "}
          <span className="font-semibold my-auto capitalize text-color">
            {username}!
          </span>
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-lg font-semibold flex-col items-end bg-opacity-50  rounded-lg md:block hidden">
          <div className="text-2xl text-cyan-700">
            {currentDateTime.format("HH:mm:ss")}
          </div>
          <div className="text-sm text-pink-500">
            {currentDateTime.format("DD MMM YYYY")}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-black text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out flex items-center space-x-2 shadow-lg"
        >
          <span>Logout</span>
          <FiLogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
