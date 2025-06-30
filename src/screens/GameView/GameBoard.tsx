import React, { useEffect, useRef, useState } from "react";
import ChessBoardHeader from "../../components/ChessBoardHeader";
import ChessBoard from "../../components/ChessBoard";
import { squareMapping, reverseSquareMapping } from "../../utils/squareMapping";
import { useSocket } from "../../contexts/SocketContext";
import {
  BoardSquare,
  ColorEnum,
  GameStatus,
  PlayerRolesEnum,
  playersDetailsType,
} from "../../types/gameTypes";
import { getDestinationSquare } from "../../utils/getDestinationSquare";
import { Chess } from "chess.js";

interface GameBoardProp {
  playersDetails: playersDetailsType;
  colorRef: React.RefObject<string>;
  chessObj: React.RefObject<Chess>;
  board: BoardSquare[][];
  gameStatus: React.RefObject<GameStatus>;
  totalGameTime: number;
  playerTimeConsumedFromServer: { player1: number; player2: number };
  startTimer: boolean;
  timerRef: React.RefObject<number>;
  lastTimeTickRef: React.RefObject<number>;
}

const GameBoard = ({
  playersDetails,
  colorRef,
  chessObj,
  board,
  gameStatus,
  totalGameTime,
  playerTimeConsumedFromServer,
  startTimer,
  timerRef,
  lastTimeTickRef,
}: GameBoardProp) => {
  const socket = useSocket();

  const [legalMoves, setLegalMoves] = useState<number[][]>([]);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState<number>(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState<number>(0);

  const fromMove = useRef<string | null>(null);
  const makeMove = (from: string, to: string) => {
    if (!socket || playersDetails.myRole != PlayerRolesEnum.PLAYER) return;
    socket.emit(
      "make_move",
      JSON.stringify({ from: from, to: to, currentTimeStamp: Date.now() })
    );

    if (legalMoves.length > 0) setLegalMoves([]);
    fromMove.current = null;
  };

  const dragHandler = (
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ) => {
    if (gameStatus.current == GameStatus.GAME_COMPLETED) return;
    const squareMappingFrom = squareMapping(row1, col1, colorRef.current);
    const squareMappingTo = squareMapping(row2, col2, colorRef.current);
    makeMove(squareMappingFrom, squareMappingTo);
  };

  const onClickSquareHandler = (row: number, col: number) => {
    if (
      !socket ||
      gameStatus.current == GameStatus.GAME_COMPLETED ||
      playersDetails?.myRole != PlayerRolesEnum.PLAYER
    ) {
      return;
    }
    const squareClicked = squareMapping(row, col, colorRef.current);

    if (!fromMove.current) {
      const color = colorRef.current === ColorEnum.WHITE ? "w" : "b";
      if (color != chessObj.current.turn()) return;

      fromMove.current = squareClicked;
      const possible_moves = chessObj.current.moves({ square: squareClicked });

      const sanitizedLegalMoves: number[][] = possible_moves.map(
        (move: string) => {
          const destinationSquare = getDestinationSquare(move);
          return reverseSquareMapping(destinationSquare, colorRef.current);
        }
      );
      setLegalMoves(sanitizedLegalMoves);
    } else {
      makeMove(fromMove.current, squareClicked);
      fromMove.current = null;
      setLegalMoves([]);
    }
  };

  function msToMinSec(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);

    const showMillis = seconds < 20 && minutes == 0;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return showMillis ? `${timeStr}:${milliseconds}` : timeStr;
  }

  const { player1, player2 } = playerTimeConsumedFromServer;
  useEffect(() => {
    if (player1) {
      setPlayer1TimeConsumed(player1);
    }
  }, [player1]);

  useEffect(() => {
    if (player2) {
      setPlayer2TimeConsumed(player2);
    }
  }, [player2]);

  useEffect(() => {
    if (startTimer) {
      lastTimeTickRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        const elapsed = now - lastTimeTickRef.current;

        if (chessObj.current.turn() == "w") {
          setPlayer1TimeConsumed((prev) => {
            const updated = prev + elapsed;
            if (updated >= totalGameTime) {
              clearInterval(timerRef.current);
              return totalGameTime;
            }
            return updated;
          });
        } else {
          setPlayer2TimeConsumed((prev) => {
            const updated = prev + elapsed;
            if (updated >= totalGameTime) {
              clearInterval(timerRef.current);
              return totalGameTime;
            }
            return updated;
          });
        }

        lastTimeTickRef.current = now;
      };

      tick();
      timerRef.current = setInterval(tick, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  return (
    <div className="mt-20 md:mt-0">
      <ChessBoardHeader
        name={
          playersDetails?.opponentPlayerName
            ? playersDetails?.opponentPlayerName
            : "Opponent"
        }
        time={msToMinSec(
          totalGameTime -
            (colorRef.current === ColorEnum.WHITE
              ? player2TimeConsumed
              : player1TimeConsumed)
        )}
        imageURL={playersDetails?.opponentPlayerPhotoURL || ""}
      />
      <ChessBoard
        chessObj={chessObj.current}
        dragHandler={dragHandler}
        legalMoves={legalMoves}
        selectedSquare={reverseSquareMapping(
          fromMove.current,
          colorRef.current
        )}
        board={board}
        onClickSquare={onClickSquareHandler}
      />
      <ChessBoardHeader
        name={
          playersDetails?.myPlayerName ? playersDetails?.myPlayerName : "Me"
        }
        time={msToMinSec(
          totalGameTime -
            (colorRef.current === ColorEnum.WHITE
              ? player1TimeConsumed
              : player2TimeConsumed)
        )}
        imageURL={playersDetails?.myPlayerPhotoURL || ""}
      />
    </div>
  );
};

export default React.memo(GameBoard);
