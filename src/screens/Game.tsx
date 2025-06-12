import { useSocket } from "../contexts/SocketContext";
import GameType from "./GameType";
import GameBoard from "./GameBoard";
import { GameModeEnum, GameTypesEnum } from "../types/gameTypes";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Game = () => {
    const [gameMode, setGameMode] = useState<GameModeEnum>(GameModeEnum.ONLINE)
    const [gameType, setGameType] = useState<GameTypesEnum>(GameTypesEnum["60|0"])
    const [joinedGame, setJoinedGame] = useState(false);


    const socket = useSocket();
    const {gameId} = useParams();

  return (
    <div>
        {
          (joinedGame||gameId)?
          // (joinedGame)?
            
            <GameBoard socket={socket} setJoinedGame={setJoinedGame} gameMode={gameMode} gameType={gameType} gameId={gameId}/>
            :
            <GameType setJoinedGame={setJoinedGame} setGameMode={setGameMode} gameType={gameType} setGameType={setGameType}/>
        }
    </div>
  )
}

export default Game
