import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import { Chess } from "chess.js";
import { BoardSquare, ColorEnum } from "../types/gameTypes";
import axios from "axios";
import { GET_GAME_WITH_MOVE_HISTORY } from "../config";
import Button from "../components/Button";
import { useUser } from "../contexts/userContext";
import { playersDetailsType, resultInfoType } from "../types/gameTypes";
import MovesView from "../components/MovesView";
import ChessBoardHeader from "../components/ChessBoardHeader";
import { STATUS } from "../types/gameTypes";
import Error404 from "./Error404";
import ChessLoader from "../components/ChessLoader";
import ResultModalContent from "../components/ResultModalContent";
import Modal from "../components/Modal";

const GameWithMoveHistory = () => {
  const { gameId } = useParams();
  const chessObj = useRef<Chess>(new Chess());
  const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
  const boardStates = useRef<
    {
      boardStatus: string;
      toMove: string;
      player1Time: number;
      player2Time: number;
    }[]
  >([]);
  const [movesList, setMovesList] = useState<string[]>([]);
  const [playersTime, setPlayersTime] = useState({
    player1Time: "00:00",
    player2Time: "00:00",
  });
  const [status, setStatus] = useState(STATUS.LOADING);
  const [result, setResult] = useState<resultInfoType | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);
  const { user } = useUser();
  const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({
    opponentPlayerName: "Opponent",
    myPlayerName: user?.userName || "Me",
  });
  const currentMove = useRef<number>(0);

  useEffect(() => {
    const fetchGameDataWithMoves = async () => {
      try {
        const response = await axios.get(GET_GAME_WITH_MOVE_HISTORY + gameId, {
          withCredentials: true,
        });
        boardStates.current = response.data.movesData;

        const { player1Id, player2Id, winner, gameResultReason, gameType, gameResult } = response.data.gameData;
        const amIPlayer1 = player1Id.userName === user;
        const myPlayerName = amIPlayer1 ? player1Id.userName : player2Id.userName;
        const opponentPlayerName = amIPlayer1 ? player2Id.userName : player1Id.userName;
        const myColor = amIPlayer1 ? ColorEnum.WHITE : ColorEnum.BLACK;
        const opponentColor = amIPlayer1 ? ColorEnum.BLACK : ColorEnum.WHITE;

        setPlayersDetails({
          myPlayerName,
          opponentPlayerName,
          myColor,
          opponentColor,
        });
        setResult({
          winner: winner === player2Id._id ? ColorEnum.BLACK : ColorEnum.WHITE,
          gameResultReason,
          gameResult,
        });

        const totalGameTime = Number(gameType?.split("|")[0]) * 60 * 1000;
        const timeInMinSec = msToMinSec(totalGameTime);
        setPlayersTime({
          player1Time: timeInMinSec,
          player2Time: timeInMinSec,
        });
        setStatus(STATUS.SUCCESS);
      } catch (err) {
        // @ts-expect-error err
        if (err?.response?.status === 404) {
          setStatus(STATUS.NOT_FOUND);
        } else {
          setStatus(STATUS.ERROR);
        }
      }
    };
    fetchGameDataWithMoves();
  }, []);

  const ButtonHandler = (type: string) => {
    if (type === "prev") {
      if (currentMove.current <= 0) return;
      currentMove.current -= 1;
      setMoveIndex(currentMove.current);
      setMovesList((prev) => prev.slice(0, -1));
    } else if (type === "next") {
      if (currentMove.current + 1 >= boardStates.current.length) {
        if (!showResultModal) setShowResultModal(true);
        return;
      }
      currentMove.current += 1;
      setMoveIndex(currentMove.current);
      setMovesList((prev) => [...prev, boardStates.current[currentMove.current].toMove]);
    }

    setPlayersTime({
      player1Time: msToMinSec(boardStates.current[currentMove.current].player1Time),
      player2Time: msToMinSec(boardStates.current[currentMove.current].player2Time),
    });

    chessObj.current.load(boardStates.current[currentMove.current].boardStatus);
    setBoard(chessObj.current.board());
  };

  function msToMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds.toString().padStart(2, "0")}:${milliseconds}`;
  }

  if (status === STATUS.LOADING) {
    return (
      <div className="w-[100vw] h-[100vh] flex justify-center items-center bg-black">
        <ChessLoader />
      </div>
    );
  }

  if (status === STATUS.NOT_FOUND) return <Error404 />;

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col md:flex-row justify-around items-center bg-black mt-15  overflow-hidden">
        <div className="mt-5">
          <ChessBoardHeader imageURL="" name={playersDetails.opponentPlayerName} time={playersTime.player2Time} />
          <ChessBoard chessObj={chessObj.current} board={board} />
          <ChessBoardHeader imageURL="" name={playersDetails.myPlayerName} time={playersTime.player1Time} />
        </div>

        <div className="mt-10 w-3/4 md:w-1/4 flex flex-col gap-10 h-[70vh] md:justify-center">
          <div className="flex gap-5 justify-center py-5 rounded-2xl">
            <Button color="#0CB07B" onClick={() => ButtonHandler("prev")}>
              Previous
            </Button>
            <Button color="#0CB07B" onClick={() => ButtonHandler("next")}>
              Next
            </Button>
          </div>
          <MovesView moves={movesList} />
        </div>
      </div>

      <Modal isOpen={showResultModal && moveIndex + 1 >= boardStates.current.length} onClose={() => setShowResultModal(false)}>
        <ResultModalContent result={result} />
      </Modal>
    </div>
  );
};

export default GameWithMoveHistory;
