import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../main-app/pages/Home.jsx";
import { Login } from "../main-app/login";
import MinesGame from "../main-app/MinesGame.js";

function UserAppRoute() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game" element={<MinesGame />} />
        <Route path="/mines" element={<MinesGame />} />
      </Routes>
    </>
  );
}

export default UserAppRoute;
