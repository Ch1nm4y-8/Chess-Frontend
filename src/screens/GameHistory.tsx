import React, { useEffect, useState } from "react";
import axios from "axios";
import { GET_GAMES_HISTORY } from "../config";
import { useNavigate } from "react-router-dom";
import { gameResultEnum } from "../types/gameTypes";

interface gamesDataType {
  GameId: string;
  gameStatus: string;
  gameResult: string;
  player1Id: { _id: string; userName: string };
  player2Id: { _id: string; userName: string };
  winner?: { _id: string; userName: string };
  createdAt: string;
  _id: string;
}

const GameHistory = () => {
  const [gamesData, setGamesData] = useState<gamesDataType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(GET_GAMES_HISTORY, { withCredentials: true });
      console.log(response.data.gamesData);
      setGamesData(response.data.gamesData);
    }
    fetchData();
  }, []);

  const clickHandler = (gameId: string) => {
    console.log(gameId);
    navigate(`/history/game/${gameId}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-24">
      <h1 className="text-5xl text-[#0BA0E2] text-center uppercase mb-5 font-bold shadow-lg border-b-4 border-[#0BA0E2] pb-2">Match History</h1>

      {gamesData.length == 0 ? (
        <div className=" text-[#0BA0E2] uppercase w-full text-2xl h-[70vmin] flex justify-center items-center ">No Game Data Available</div>
      ) : (
        <div className="h-[70vh] w-[80vw] m-auto pt-5  overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
          {gamesData.map((game, index) => (
            <div
              key={game.GameId}
              onClick={() => clickHandler(game.GameId)}
              className="bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a]  hover:border-[#0BA0E2] text-white p-6 rounded-2xl cursor-pointer shadow-lg transition-all duration-300 border border-white/10 hover:scale-[1.02]"
            >
              <div className="flex  justify-between items-center mb-3">
                <h2 className="text-lg font-semibold tracking-wide text-cyan-400">Game #{index + 1}</h2>
                <p className="text-xs text-gray-400">ID: {game.GameId}</p>
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">Player 1:</span>
                      <span>{game.player1Id.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">Player 2:</span>
                      <span>{game.player2Id.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">Date :</span>
                      <span>{formatDate(new Date(game.createdAt))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xl">
                  <span className="text-red-400 ">RESULT :</span>
                  <span>{game.gameResult === gameResultEnum.WIN ? (game?.winner?.userName + " WINS").toUpperCase() : game.gameResult}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameHistory;
