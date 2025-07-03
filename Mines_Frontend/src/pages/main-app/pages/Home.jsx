import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Components/Header";
import ApiClient from "../api";
import Lobby from "../Components/lobby";

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("minesToken");
  const [gameData, setGameData] = useState([]);
  useEffect(() => {
    if (!token || token == null) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    async function getGamesByName() {
      // Determine the correct API client based on the game name

      try {
        const token = localStorage.getItem("minesToken");
        console.log("token", token);
        if (token) {
          const data = await ApiClient.get("/template", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (data.data.success) {
            setGameData(data.data.data);
            const message = { key: "loader", data: "Your data here" };
            if (
              window.ReactNativeWebView &&
              window.ReactNativeWebView.postMessage
            ) {
              window.ReactNativeWebView.postMessage("loader");
            } else {
              console.warn("window.ReactNativeWebView is not available.");
            }
            window.parent.postMessage(message, "*");
          }
        }

        // Return the filtered games based on the game name
      } catch (error) {
        // handleLogout()
      } finally {
        //   setLoader(false);
      }
    }
    getGamesByName();
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "absolute" }}>
      <Lobby />
      
    </div>
  );
}

export default Home;
