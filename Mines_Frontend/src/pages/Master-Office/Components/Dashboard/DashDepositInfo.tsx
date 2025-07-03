// import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { IoGameController } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
const DashDepositInfo = () => {
  // const [dashInfo,setDashInfo]=useState(0);
  // setDashInfo(0)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 mx-2 mt-1 gap-y-2 mb-2 border-2 shadow-md p-1">
      <div className="flex justify-center">
        <FaArrowUp className="m-2" size={40} />
        <div className="">
          <h1 className="text-2xl font-semibold">₹ 10</h1>
          <span className="text-lg ">Total Deposits</span>
        </div>
      </div>
      <div className="flex justify-center">
        <FaArrowDown className="m-2" size={40} />
        <div className="">
          <h1 className="text-2xl font-semibold">₹ 10</h1>
          <span className="text-lg ">Total Withdrawal</span>
        </div>
      </div>
      <div className="flex justify-center">
        <IoGameController className="m-2" size={40} />
        <div className="">
          <h1 className="text-2xl font-semibold">4</h1>
          <span className="text-lg ">Total Games</span>
        </div>
      </div>
      <div className="flex justify-center">
        <FaUserFriends className="m-2" size={40} />
        <div className="">
          <h1 className="text-2xl font-semibold">30</h1>
          <span className="text-lg ">Total Users</span>
        </div>
      </div>
    </div>
  );
};

export default DashDepositInfo;
