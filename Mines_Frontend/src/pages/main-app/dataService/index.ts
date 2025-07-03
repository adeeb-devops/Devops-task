// socketManager.ts
import io from "socket.io-client";
import eventEmitter from "../eventEmitter";
import { payoutData } from "../utils/payouts";
import { popupParams } from "../popups/popupParams";

interface SocketInstance {
  socket: any;
  roomId: any;
}

let Id: any;
let socketInstances: SocketInstance[] = [];
let isGameStarted: boolean = false;
let playerName: string = "";
let contestId: any;
let isJackpot: any = false;
let gameId: any;
let distributorId: any;
let userName: any;
const createSocket = ({ roomId, player_name, is_jackpot }) => {
  const existingSocket = socketInstances.find(
    (instance) => instance.roomId === roomId
  );
  Id = roomId;
  playerName = player_name;
  isJackpot = is_jackpot;
  if (existingSocket || playerName == undefined) {
    console.log(`Socket for room ${roomId}${playerName} already exists.`);
    return;
  }

  const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
    query: {
      token: localStorage.getItem("minesToken"),
      playerName: player_name,
      is_jackpot: is_jackpot,
    },
    reconnectionAttempts: 5, // Number of reconnection attempts before giving up
    reconnectionDelay: 5000, // Delay in ms between reconnection attempts
    reconnectionDelayMax: 10000, // Maximum delay in ms between reconnection attempts
    timeout: 20000, // Timeout after which the connection is considered lost
  });

  socketInstances.push({ socket: newSocket, roomId });

  newSocket.on("connect", () => {
    joinContest(roomId);
    console.log("dcuwuciwucniwe data service---->");
    const user = JSON.parse(localStorage.getItem("user"));
    distributorId = user.organization_id;
    userName = user.username;

    eventEmitter.emit("mines-show-popup", {
      show: false,
      data: {
        ...popupParams["unavailable"],
      },
    });
    console.log(`Connected to room ${roomId}`);
  });

  newSocket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      eventEmitter.emit("mines-show-popup", {
        show: true,
        data: {
          ...popupParams["disconnect"],
        },
      });
    } else {
      console.log("Attempting to reconnect...", reason);
      eventEmitter.emit("mines-show-popup", {
        show: true,
        data: {
          ...popupParams["disconnect"],
        },
      });
    }
  });

  newSocket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
  });

  newSocket.on("reconnect", (attemptNumber) => {
    eventEmitter.emit("mines-show-popup", {
      show: false,
      data: {
        ...popupParams["unavailable"],
      },
    });
    console.log(`Reconnected successfully after ${attemptNumber} attempts`);
  });

  newSocket.on("connect_error", (error) => {
    console.log("Connection error:", error.message);
  });

  newSocket.on("looser", (_data: any) => {
    eventEmitter.emit("showWin");
  });

  newSocket.on("update-balance", (data: any) => {
    eventEmitter.emit("update-balance", data);
  });

  newSocket.on("response", (data: any) => {
    console.log(`Response from room ${roomId}:`, data);
  });

  newSocket.on("session-expired", (data: any) => {
    console.log(`Response from room ${roomId}:`, data);
    eventEmitter.emit("mines-show-popup", {
      show: true,
      data: {
        ...popupParams["unavailable"],
      },
    });
    disconnectSocket();
  });

  newSocket.on("re-bet", (data: any) => {
    console.log(`payouts from room ${roomId}:`, data);
  });

  newSocket.on("reset-contest", (_data: any) => {
    contestId = "";
    isGameStarted = false;
    eventEmitter.emit("reset");
  });

  newSocket.on("alert", (data: any) => {
    console.log(`alert from room ${roomId}:`, data);
  });

  newSocket.on("stat-data", (data: any) => {
    eventEmitter.emit("stats", data);
  });

  newSocket.on("response", (data: any) => {
    console.log(`Response from room ${roomId}:`, data);
  });

  newSocket.on("re-bet", (data: any) => {
    console.log(`payouts from room ${roomId}:`, data);
  });

  newSocket.on("reset-contest", (_data: any) => {
    contestId = "";
    isGameStarted = false;
    eventEmitter.emit("lottery-reset");
  });

  newSocket.on("alert", (data: any) => {
    console.log(`alert from room ${roomId}:`, data);
  });

  newSocket.on("bet-data", (data: any) => {
    eventEmitter.emit(`lottery-bet-data`, data);
  });

  newSocket.on("error", (data: any) => {
    console.log("kcbwkwewfwfw", data);
    if (data === "Under maintenance") {
      eventEmitter.emit("mines-show-popup", {
        show: true,
        data: {
          type: "maintenance",
        },
      });
    } else if (
      data ===
      "An error occurred while processing your request. Please try again. --Player is blocked"
    ) {
      eventEmitter.emit("mines-show-popup", {
        show: true,
        data: {
          type: "restrict",
        },
      });
    } else if (data === "Bet amount is out of allowed range.") {
      eventEmitter.emit("low-balance", "Limit Reached");
    }
  });
  newSocket.on("low-balance", (data: any) => {
    eventEmitter.emit("mines-show-popup", {
      show: true,
      data: {
        ...popupParams["lowBalance"],
      },
    });
  });
  newSocket.on("payout-data", (data: any) => {
    console.log("error", data);
    payoutData.data = data;
    eventEmitter.emit("payout-received");
  });
  newSocket.on("bet-placed", (data: any) => {
    eventEmitter.emit("bet-placed", data);
  });
  newSocket.on("newContest", (_data: any) => {
    joinContest(Id);
  });
  newSocket.on("tile-opened", (data: any) => {
    eventEmitter.emit("tile-opened", data);
  });
  newSocket.on("game-over", (data: any) => {
    eventEmitter.emit("game-over", data);
    joinContest(Id);
  });

  newSocket.on("response", (data: any) => {
    console.log(`Response from room ${roomId}:`, data);
  });

  newSocket.on("auto-bet-progress", (data: any) => {
    contestId = data.id;
    eventEmitter.emit("auto-bet-progress", data);
  });

  newSocket.on("auto-bet-complete", (data: any) => {
    eventEmitter.emit("auto-bet-complete", data);
    joinContest(Id);
  });
  newSocket.on("auto-bet-stopped", (data: any) => {
    eventEmitter.emit("auto-bet-stopped", data);
    joinContest(Id);

    // console.log(`Response from room ${roomId}:`, data);
  });

  newSocket.on("alert", (data: any) => {
    console.log(`alert from room ${roomId}:`, data);
  });
  newSocket.on("sound-updated", (data: any) => {
    // console.log(`alert from room ${roomId}:`, data);
    eventEmitter.emit("sound-updated", data);
  });
  newSocket.on("init-game", (data: any) => {
    console.log("init game ", data);
    contestId = data.id;
    gameId = data.gameId;
    eventEmitter.emit("update-id", data.id);
    eventEmitter.emit("init-data", data);
    payouts();
  });

  newSocket.on("payouts", (data: any) => {
    eventEmitter.emit("payouts", data);
  });

  newSocket.on("rule", (data: any) => {
    eventEmitter.emit("rule", data);
  });
  newSocket.on("player-history-data", (data: any) => {
    eventEmitter.emit("playerHistory", data);
  });
  newSocket.on("how-to-play-data", (data: any) => {
    eventEmitter.emit("how-to-play-data", data);
  });

  newSocket.on("cashout-balance", (data: any) => {
    eventEmitter.emit("cashout-balance", data);
    joinContest(Id);
  });
};

const sendMessage = (roomId: string, message: string): void => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === roomId
  );
  if (socketInstance) {
    socketInstance.socket.emit("message", { content: message });
  } else {
    console.error(`Socket not found for room ${roomId}`);
  }
};

const onSounsUpdate = (data: any): void => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("player-sound", {
      player_name: playerName,
      sound: data.sound,
      vibration: data.vibration,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const setGameVariable = (_data: boolean) => {
  isGameStarted = false;
};

const placeBet = (
  roomId: any,
  minesCount,
  betAmount,
  tile_count,
  game_id,
  is_jackpot
) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === roomId
  );
  if (socketInstance) {
    socketInstance.socket.emit("placeBet", {
      player_name: playerName,
      mines: minesCount,
      bet_amount: Number(betAmount),
      tile_count: tile_count * tile_count,
      game_id: gameId,
      is_jackpot: isJackpot,
      template_id: Id,
      id: contestId,
      user_name: userName,
      distributor_id: distributorId,
    });
  } else {
    console.error(`Socket not found for room ${roomId}`);
  }
};

const openTile = (index, game_id) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("open-single-tile", {
      player_name: playerName,
      field: index,
      game_id: game_id,
      is_jackpot: isJackpot,
      template_id: Id,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const stopAutoBet = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("stop-auto-bet", {
      player_name: playerName,
      game_id: gameId,
      id: contestId,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const onAutoClicked = (data: any) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  console.log("contestID", contestId);
  if (socketInstance) {
    socketInstance.socket.emit("auto-bet", {
      ...data,
      player_name: playerName,
      user_name: userName,
      distributor_id: distributorId,
      template_id: Id,
      game_id: gameId,
      is_jackpot: isJackpot,
      id: contestId,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const payouts = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("payouts", {
      is_jackpot: isJackpot,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const cashOut = (game_id) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("cashout", {
      player_name: playerName,
      game_id: game_id,
      is_jackpot: isJackpot,
      template_id: Id,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const clearSocket = () => {
  socketInstances = [];
  contestId = "";
  isGameStarted = false;
};

const joinContest = (roomId: any) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === roomId
  );
  if (socketInstance) {
    console.log("flnvldfld fd", roomId);
    socketInstance.socket.emit("join-socket-room", {
      player_name: playerName,
      template_id: roomId,
      is_jackpot: isJackpot,
    });
  } else {
    console.error(`Socket not found for room ${roomId}`);
  }
};

const Rebet = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("re-bet", {
      player_name: playerName,
      contest_id: contestId,
      template_id: Id,
      //   token:retrieveEncryptedData('token'),
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

// const getPayouts = () => {
// 	const socketInstance = socketInstances.find(
// 		(instance) => instance.roomId === Id
// 	);
// 	if (socketInstance) {
// 		socketInstance.socket.emit("payouts", {
// 			token: retrieveEncryptedData("token"),
// 			template_id: Id,
// 		});
// 	} else {
// 		console.error(`Socket not found for room ${Id}`);
// 	}
// };

const getHowToPlay = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("how-to-play");
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const getPlayerHistory = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("player-history", {
      template_id: Id,
      player_name: playerName,
      is_jackpot: isJackpot,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const undoBet = (data: any) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("undo-bet", {
      template_id: Id,
      player_name: playerName,
      contest_id: contestId,
      transaction_id: data,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};
const clearBet = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("clear-bet", {
      template_id: Id,
      player_name: playerName,
      contest_id: contestId,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

const doubleBet = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("double-bet", {
      player_name: playerName,
      contest_id: contestId,
      template_id: Id,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

// const getGameRule = () => {
// 	const socketInstance = socketInstances.find(
// 		(instance) => instance.roomId === Id
// 	);
// 	if (socketInstance) {
// 		socketInstance.socket.emit("rule", {
// 			token: retrieveEncryptedData("token"),
// 			template_id: Id,
// 		});
// 	} else {
// 		console.error(`Socket not found for room ${Id}`);
// 	}
// };

const betSelection = (data: any) => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("bet", {
      contest_id: contestId,
      template_id: Id,
      player_name: playerName,
      ...data,
    });
  } else {
    console.error(`Socket not found for room ${"error"}`);
  }
};
const clearSessions = () => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("lastPlayerSession", {
      playerName: playerName,
    });
  } else {
    console.error(`Socket not found for room ${"error"}`);
  }
};

const sendRequest = (roomId: string, message: string): void => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === roomId
  );

  if (socketInstance) {
    socketInstance.socket.emit("message", { content: message });
  } else {
    console.error(`Socket not found for room ${roomId}`);
  }
};

const disconnectSocket = (): void => {
  const index = socketInstances.findIndex((instance) => instance.roomId === Id);
  if (index !== -1) {
    // clearSessions()
    setTimeout(() => {
      socketInstances[index].socket.disconnect();
      clearSocket();
      socketInstances.splice(index, 1);
      console.log(`Disconnected and removed socket for room ${Id}`);
    }, 1000);
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};
const statRequest = (limit: any): void => {
  const socketInstance = socketInstances.find(
    (instance) => instance.roomId === Id
  );
  if (socketInstance) {
    socketInstance.socket.emit("stat", {
      player_name: playerName,
      template_id: Id,
      // game_type: manual //auto
      is_jackpot: isJackpot,
    });
  } else {
    console.error(`Socket not found for room ${Id}`);
  }
};

export {
  Rebet,
  createSocket,
  sendMessage,
  disconnectSocket,
  sendRequest,
  betSelection,
  isGameStarted,
  setGameVariable,
  placeBet,
  clearBet,
  joinContest,
  openTile,
  onAutoClicked,
  cashOut,
  stopAutoBet,
  // getPayouts,
  getPlayerHistory,
  getHowToPlay,
  // getGameRule,
  clearSocket,
  undoBet,
  doubleBet,
  clearSessions,
  statRequest,
  onSounsUpdate,
};
