import { useState, useEffect } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { RiCloseLine, RiMenu3Line } from "react-icons/ri";
import axios from "axios";
const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(moment());
  const username = sessionStorage.getItem("clientName");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // const handleLogout = () => {
  //   sessionStorage.removeItem('clientToken');
  //   sessionStorage.removeItem("clientName");
  //   navigate("/back-office");
  // };
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("clientToken");
      await axios.post(
        `${import.meta.env.VITE_APP_BACKEND}/distributor/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      sessionStorage.removeItem("clientToken");
      sessionStorage.removeItem("clientName");
      navigate("/back-office");
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
        <div className="text-lg font-semibold flex flex-col items-end bg-opacity-50  rounded-lg">
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

// import React, { useState, useEffect } from "react";
// import { FaUserAstronaut } from "react-icons/fa";
// import { FiLogOut } from "react-icons/fi";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [currentDateTime, setCurrentDateTime] = useState(moment());
//   const username = sessionStorage.getItem("clientName");

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentDateTime(moment());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const handleLogout = () => {
//     sessionStorage.removeItem("clientToken");
//     sessionStorage.removeItem("clientName");
//     navigate("/back-office");
//     toast("Logout Successful");
//   };

//   return (
//     <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white p-4 flex justify-between items-center h-20 fixed top-0 left-0 right-0 z-50 shadow-lg">
//       <div className="flex items-center space-x-4">
//         <div className="bg-blue-500 p-2 rounded-full">
//           <FaUserAstronaut size={32} className="text-white" />
//         </div>
//         <h1 className="text-2xl font-bold hidden md:block">
//           Welcome,{" "}
//           <span className="font-extrabold capitalize bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-200">
//             {username}!
//           </span>
//         </h1>
//       </div>

// <div className="flex items-center space-x-6">
//   <div className="text-lg font-semibold flex flex-col items-end bg-opacity-50  rounded-lg">
//     <div className="text-2xl text-cyan-300">{currentDateTime.format("HH:mm:ss")}</div>
//     <div className="text-sm text-pink-300">{currentDateTime.format("DD MMM YYYY")}</div>
//   </div>
//   <button
//     onClick={handleLogout}
//     className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out flex items-center space-x-2 shadow-lg"
//   >
//     <span>Logout</span>
//     <FiLogOut size={20} />
//   </button>
// </div>
//     </div>
//   );
// };

// export default Navbar;
