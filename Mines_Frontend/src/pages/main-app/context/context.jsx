import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

export const MyContext = createContext({
  socketData: { is_jackpot: false },
  setSocketData: () => {},
  socket: null,
  setSocket: () => {},
});

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const MyContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [socketData, setSocketData] = useState({ is_jackpot: false });
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState("Arbaz");
  const [error, setError] = useState("");
  const [mineLocations, setMineLocations] = useState([]);
  const [latestPayout, setLatestPayout] = useState(0);
  const socketRef = useRef(null);
  const [isSocketConnect, setIsSocketConnect] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const token = localStorage.getItem("minesToken");

  useEffect(() => {
    const connectSocket = () => {
      if (socketRef.current) {
        console.log("Socket is already connected");
        return;
      }

      const query = {
        token,
        playerName,
      };

      const socket = io(SOCKET_URL, { query });

      socket.on("connect", () => {
        console.log("Connected to the socket server");
        try {
          socket.emit("join-socket-room", {
            player_name: playerName,
            is_jackpot: socketData?.is_jackpot || false,
            template_id: socketData?.template_id || null,
          });
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Error joining socket room:", error);
          setConnectionStatus("disconnected");
        }
      });

      socket.on("init-game", (data) => {
        console.log("init game :: ", data);
        setGameId(data.gameId);
        setGameState(data.gameState);
      });

      socket.on("bet-placed", (data) => {
        setGameState(data);
        setGameId(data.gameId);
      });

      socket.on("tile-opened", (data) => {
        const lastRound =
          data.data.gameState.state.rounds[
            data.data.gameState.state.rounds.length - 1
          ];
        const jackpotIndex = data.data.gameState.state.jackpot[0];
        setLatestPayout(data.data.gameState.payout);
        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          const tile = levelScene.tiles[lastRound.field];

          if (levelScene && tile) {
            levelScene.oTweenManager.moveOrScaleTo(
              tile,
              {
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 300,
                yoyo: true,
              },
              (callback) => {
                levelScene.game.events.emit("tileCorrect");
                if (lastRound.field === jackpotIndex) {
                  levelScene.showJackpotTileEffect(
                    tile,
                    levelScene.gridSize,
                    false
                  );
                } else {
                  levelScene.showCorrectTileEffect(
                    tile,
                    levelScene.gridSize,
                    false
                  );
                }
                levelScene.tiles.forEach((t) => {
                  if (!t.revealed) {
                    t.setInteractive();
                  }
                });
              }
            );
          }
        }
        setGameState(data.data.gameState);
      });

      socket.on("game-over", (data) => {
        setError(data.message);
        const mines = data.gameState.state.mines;
        const clickedTileIndex = data.gameState.state.mines[0];
        const jackpotIndex = data.gameState.state.jackpot[0];
        setMineLocations(mines);

        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          const tile = levelScene.tiles[clickedTileIndex];
          levelScene.tiles.forEach((tile, index) => {
            tile.isMine = mines.includes(index);
          });
          if (levelScene) {
            levelScene.oTweenManager.moveOrScaleTo(
              tile,
              {
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 300,
                yoyo: true,
              },
              (callback) => {
                levelScene.minePositions = mines;
                levelScene.game.events.emit("tileWrong");
                const clickedTile = levelScene.tiles[clickedTileIndex];
                if (clickedTile) {
                  levelScene.showBombEffect(clickedTile, levelScene.gridSize);
                }

                mines.forEach((mineIndex) => {
                  if (mineIndex !== clickedTileIndex) {
                    const tile = levelScene.tiles[mineIndex];
                    if (tile && !tile.revealed) {
                      levelScene.showBombFade(tile, levelScene.gridSize);
                    }
                  }
                });

                levelScene.tiles.forEach((tile, index) => {
                  if (!tile.isMine && !tile.revealed) {
                    if (index === jackpotIndex) {
                      levelScene.showJackpotDiamondFade(
                        tile,
                        levelScene.gridSize
                      );
                    } else {
                      levelScene.showDiamondFade(tile, levelScene.gridSize);
                    }
                  }
                });

                levelScene.gameOver(levelScene.gridSize);
              }
            );
            levelScene.tiles.forEach((t) => {
              if (!t.revealed) {
                t.setInteractive();
              }
            });
          }
        }
        try {
          socket.emit("join-socket-room", {
            player_name: playerName,
            is_jackpot: socketData?.is_jackpot || false,
            template_id: socketData?.template_id || null,
          });
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Error joining socket room:", error);
          setConnectionStatus("disconnected");
        }
      });

      socket.on("update-balance", (data) => {
        // console.log("update balance :: ", data);
      });

      socket.on("cashout-balance", (data) => {
        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          if (levelScene) {
            levelScene.tiles.forEach((tile, index) => {
              tile.disableInteractive();
              if (!tile.revealed) {
                if (data.gameState.state.mines.includes(index)) {
                  levelScene.showBombEffect(tile, levelScene.gridSize);
                } else if (data.gameState.state.jackpot.includes(index)) {
                  levelScene.showJackpotDiamondFade(tile, levelScene.gridSize);
                } else {
                  levelScene.showDiamondFade(tile, levelScene.gridSize);
                }
                tile.revealed = true;
              }
            });
            levelScene.gameOver(levelScene.gridSize);
          }
        }
        try {
          socket.emit("join-socket-room", {
            player_name: playerName,
            is_jackpot: socketData?.is_jackpot || false,
            template_id: socketData?.template_id || null,
          });
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Error joining socket room:", error);
          setConnectionStatus("disconnected");
        }
      });

      socket.on("auto-bet-progress", (data) => {
        const mines = data.state.mines;
        const jackpotIndex = data.state.jackpot;
        setLatestPayout(data.payout);

        const phaserGame = window.game;
        const selectedTiles = data.state.selectedTiles;

        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          if (levelScene) {
            let hasMineInSelected = false;
            levelScene.tiles.forEach((tile, index) => {
              tile.disableInteractive();

              if (!tile.revealed) {
                if (mines.includes(index)) {
                  const isSelected = selectedTiles.includes(index);
                  if (isSelected) {
                    hasMineInSelected = true;
                    levelScene.showBombEffect(
                      tile,
                      levelScene.gridSize,
                      isSelected
                    );
                  } else {
                    levelScene.showBombFade(tile, levelScene.gridSize);
                  }
                } else if (jackpotIndex.includes(index)) {
                  if (selectedTiles.includes(index)) {
                    levelScene.showJackpotTileEffect(
                      tile,
                      levelScene.gridSize,
                      true
                    );
                  } else {
                    levelScene.showJackpotDiamondFade(
                      tile,
                      levelScene.gridSize
                    );
                  }
                } else if (selectedTiles.includes(index)) {
                  levelScene.showCorrectTileEffect(
                    tile,
                    levelScene.gridSize,
                    true
                  );
                } else {
                  levelScene.showDiamondFade(tile, levelScene.gridSize);
                }

                tile.revealed = true;
              }
            });

            if (hasMineInSelected) {
              levelScene.game.events.emit("autoBetLoss", data);
            } else {
              levelScene.game.events.emit("autoBetWin", data);
            }

            setTimeout(() => {
              levelScene.initializeGrid();
            }, 1000);
          }
        }
      });

      socket.on("auto-bet-stopped", () => {
        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          if (levelScene) {
            levelScene.game.events.emit("autoBetComplete");
          }
        }
        try {
          socket.emit("join-socket-room", {
            player_name: playerName,
            is_jackpot: socketData?.is_jackpot || false,
            template_id: socketData?.template_id || null,
          });
          setConnectionStatus("connected");
        } catch (error) {
          console.error("Error joining socket room:", error);
          setConnectionStatus("disconnected");
        }
      });

      socket.on("auto-bet-complete", () => {
        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          if (levelScene) {
            levelScene.game.events.emit("autoBetComplete");
          }
        }
      });

      socket.on("stop-auto-bet-confirmation", (data) => {
        const phaserGame = window.game;
        if (phaserGame) {
          const levelScene = phaserGame.scene.getScene("Level");
          if (levelScene) {
            levelScene.game.events.emit("autoBetComplete");
          }
        }
      });

      socket.on("disconnect", () => {
        setConnectionStatus("disconnected");
      });

      socket.on("error", (errMsg) => {
        console.error("Error--------:", errMsg);
        setError(errMsg.message || errMsg);
        if (errMsg === "Invalid JWT token") {
          localStorage.removeItem("minesToken");
          navigate("/login");
        }
      });

      socketRef.current = socket;
      setSocket(socket);
    };

    if (isSocketConnect) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [socketData, isSocketConnect]);

  return (
    <MyContext.Provider
      value={{
        socketData,
        setSocketData,
        socket,
        setSocket,
        gameId,
        setGameId,
        connectionStatus,
        setConnectionStatus,
        playerName,
        latestPayout,
        setIsSocketConnect,
        userBalance,
        setUserBalance,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
