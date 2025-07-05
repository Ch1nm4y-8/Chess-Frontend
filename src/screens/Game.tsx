import GameType from "./GameType";
import GameView from "./GameView/GameView";
import { GameModeEnum, GameTypesEnum } from "../types/gameTypes";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

const Game = () => {
  const [gameMode, setGameMode] = useState<GameModeEnum>(GameModeEnum.ONLINE);
  const [gameType, setGameType] = useState<GameTypesEnum>(GameTypesEnum["60|0"]);
  const [joinedGame, setJoinedGame] = useState(false);

  const { gameId } = useParams();

  return (
    <div>
      {joinedGame || gameId ? (
        // (joinedGame)?

        <GameView setJoinedGame={setJoinedGame} gameMode={gameMode} gameType={gameType} gameId={gameId} />
      ) : (
        <GameType setJoinedGame={setJoinedGame} setGameMode={setGameMode} gameType={gameType} setGameType={setGameType} />
      )}
    </div>
  );
};

export default Game;
