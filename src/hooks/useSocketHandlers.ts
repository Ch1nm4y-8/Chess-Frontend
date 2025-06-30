import React, { useEffect } from "react";
import { Socket } from "socket.io-client";
import {
  BoardSquare,
  ColorEnum,
  gameResult,
  gameResultEnum,
  gameResultReasonEnum,
  GameStatus,
  MessagesType,
  PlayerRolesEnum,
  playersDetailsType,
  ResponseStatus,
  resultInfoType,
} from "../types/gameTypes";
import { handleOpenOrCloseModal } from "../utils/handleOpenOrCloseModal";
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface useSocketHandlersProp {
  socket: Socket;
  setJoinedGame: (value: boolean) => void;
  setInviteGameIdToSend: SetState<string>;
  setTotalGameTime: SetState<number>;
  setStartTimer: SetState<boolean>;
  setPlayersDetails: SetState<playersDetailsType>;
  setBoard: SetState<BoardSquare[][]>;
  setResultInfo: SetState<resultInfoType | null>;
  setMessages: SetState<MessagesType[]>;
  setPlayerTimeConsumedFromServer: SetState<{
    player1: number;
    player2: number;
  }>;
  setMoves: SetState<string[]>;

  chessObj: React.RefObject<Chess>;
  colorRef: React.RefObject<string>;
  timerRef: React.RefObject<number>;
  lastTimeTickRef: React.RefObject<number>;
  playersDetailsRef: React.RefObject<playersDetailsType>;
  gameStatus: React.RefObject<GameStatus>;
}

const useSocketHandlers = ({
  socket,
  setJoinedGame,
  setInviteGameIdToSend,
  setTotalGameTime,
  setStartTimer,
  setPlayersDetails,
  setBoard,
  setResultInfo,
  setMessages,
  setPlayerTimeConsumedFromServer,
  setMoves,

  chessObj,
  colorRef,
  timerRef,
  lastTimeTickRef,
  playersDetailsRef,
  gameStatus,
}: useSocketHandlersProp) => {
  const navigate = useNavigate();

  const reverseBoard = (board: BoardSquare[][]) => {
    board.reverse().forEach((row) => row.reverse());
  };

  const triggerConfetti = () => {
    const end = Date.now() + 2 * 1000;
    const confettiInterval = setInterval(() => {
      if (Date.now() > end) clearInterval(confettiInterval);
      confetti({
        angle: 60,
        particleCount: 100,
        spread: 70,
        origin: { x: 0, y: 0.5 },
      });
      confetti({
        angle: 120,
        particleCount: 100,
        spread: 70,
        origin: { x: 1, y: 0.5 },
      });
    }, 300);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("state", (msg) => {
      if (msg == "waiting") setJoinedGame(true);
    });

    socket.on("invite_code", (invite_code) => {
      setInviteGameIdToSend(invite_code);
    });

    socket.on("cancel_join_game", (status) => {
      if (status == ResponseStatus.SUCCESS) {
        // navigate('/game');
        console.log("afd");
      }
    });

    socket.on("offer_draw:request_to_opponent", () => {
      handleOpenOrCloseModal("draw_offer_modal", true);
    });

    socket.on("invalid", (msg) => {
      alert(msg);
    });

    socket.off("join_game").on("join_game", (data) => {
      const parsedData = JSON.parse(data);
      const {
        message,
        color,
        gameId,
        opponentPlayerName,
        myPlayerName,
        opponentPlayerId,
        myPlayerId,
        playerRole,
        TotalGametime,
        opponentPlayerPhotoURL,
        myPlayerPhotoURL,
      } = parsedData;
      if (message == "Connected") {
        const chessObject = new Chess();
        chessObj.current = chessObject;
        const newBoard = chessObject.board();
        colorRef.current = parsedData.color;
        if (color == ColorEnum.BLACK) {
          reverseBoard(newBoard);
        }
        setBoard(newBoard);
        setPlayersDetails({
          opponentPlayerName: opponentPlayerName,
          myPlayerName: myPlayerName,
          myPlayerId: myPlayerId,
          opponentPlayerId: opponentPlayerId,
          myRole: playerRole,
          opponentPlayerPhotoURL,
          myPlayerPhotoURL,
        });
        //setPlayerRole(playerRole)
        navigate(`/game/${gameId}`);
        setStartTimer(true);
        setTotalGameTime(TotalGametime);

        setJoinedGame(true);
      }
    });

    socket.off("rejoin_game").on("rejoin_game", (data) => {
      const parsedData = JSON.parse(data);
      const {
        playerRole,
        TotalGametime,
        myPlayerId,
        myPlayerName,
        opponentPlayerName,
        opponentPlayerId,
        restored_chat_messages,
        myPlayerPhotoURL,
        opponentPlayerPhotoURL,
      } = parsedData;

      const chessObject = new Chess(parsedData.board_status);
      const restoredOldMoves = parsedData.restoredOldMoves;

      chessObj.current = chessObject;
      const newBoard = chessObject.board();

      colorRef.current = parsedData.color;
      if (parsedData.color == ColorEnum.BLACK) {
        reverseBoard(newBoard);
      }
      setBoard(newBoard);
      setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : []);

      setPlayerTimeConsumedFromServer((prev) => ({
        ...prev,
        player1: parsedData.player1TimeSpent,
        player2: parsedData.player2TimeSpent,
      }));
      setStartTimer(true);
      setTotalGameTime(TotalGametime);
      setPlayersDetails({
        myPlayerName: myPlayerName,
        myPlayerId,
        opponentPlayerName: opponentPlayerName,
        opponentPlayerId,
        myRole: playerRole,
        myPlayerPhotoURL,
        opponentPlayerPhotoURL,
      });

      setMessages(restored_chat_messages);
      setJoinedGame(true);
    });

    socket.off("spectate_game").on("spectate_game", (data) => {
      const parsedData = JSON.parse(data);
      const {
        playerRole,
        TotalGametime,
        player1Name,
        player2Name,
        myPlayerPhotoURL,
        opponentPlayerPhotoURL,
      } = parsedData;

      const chessObject = new Chess(parsedData.board_status);
      const restoredOldMoves = parsedData.restoredOldMoves;

      chessObj.current = chessObject;
      const newBoard = chessObject.board();

      colorRef.current = parsedData.color;
      if (parsedData.color == ColorEnum.BLACK) {
        reverseBoard(newBoard);
      }
      setBoard(newBoard);
      setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : []);
      setPlayerTimeConsumedFromServer((prev) => ({
        ...prev,
        player1: parsedData.player1TimeSpent,
        player2: parsedData.player2TimeSpent,
      }));
      setPlayersDetails({
        myPlayerName: player1Name,
        opponentPlayerName: player2Name,
        myRole: playerRole,
        myPlayerPhotoURL,
        opponentPlayerPhotoURL,
      });
      setStartTimer(true);
      setTotalGameTime(TotalGametime);

      setJoinedGame(true);
    });

    socket.off("game_result").on("game_result", (result: string) => {
      const parsedResult: gameResult = JSON.parse(result);

      let winner = "";
      if (parsedResult.winner) {
        winner = parsedResult.message;
      }

      gameStatus.current = GameStatus.GAME_COMPLETED;
      setResultInfo({
        gameResult: parsedResult.gameResult,
        gameResultReason: parsedResult.gameResultReason,
        winner,
      });

      if (parsedResult.gameResult == gameResultEnum.WIN) {
        if (
          parsedResult.winner == playersDetailsRef.current.myPlayerId &&
          playersDetailsRef.current?.myRole != PlayerRolesEnum.SPECTATOR
        )
          triggerConfetti();
        if (
          parsedResult.gameResultReason == gameResultReasonEnum.TIMEOUT &&
          parsedResult.player1TimeSpent &&
          parsedResult.player2TimeSpent
        ) {
          setPlayerTimeConsumedFromServer((prev) => ({
            ...prev,
            ...(parsedResult.player1TimeSpent
              ? { player1: parsedResult.player1TimeSpent }
              : {}),
            ...(parsedResult.player2TimeSpent
              ? { player2: parsedResult.player2TimeSpent }
              : {}),
          }));
        }
      }

      clearInterval(timerRef.current);

      handleOpenOrCloseModal("result_modal", true);
    });

    socket.off("message").on("message", (data) => {
      console.log("message recieved from server: " + data);
    });

    socket
      .off("receive_chat")
      .on("receive_chat", (chatMessageObject: string) => {
        const parsedChatMessageObject = JSON.parse(chatMessageObject);

        setMessages((prev) => [...prev, parsedChatMessageObject]);
      });

    socket.off("make_move").on("make_move", (move) => {
      if (!chessObj) return;
      try {
        const parsedMove = JSON.parse(move);

        try {
          chessObj.current.move(parsedMove);
        } catch (err) {
          console.log("frontend move validation error : " + err);
        }

        setPlayerTimeConsumedFromServer((prev) => ({
          ...prev,
          player1: parsedMove.player1TimeSpent,
          player2: parsedMove.player2TimeSpent,
        }));

        lastTimeTickRef.current = Date.now();
        const newBoard = chessObj.current.board();
        if (colorRef.current == ColorEnum.BLACK) {
          reverseBoard(newBoard);
        }

        setBoard(newBoard);
        setMoves((prev) => [...prev, parsedMove.to]);
      } catch (err) {
        console.error("ERRROR CAUGHT : " + err);
      }
    });

    socket.on("redirect:history", (redirectToGameId) => {
      const parsedRedirectToGameId = JSON.parse(redirectToGameId);
      navigate("/history/game/" + parsedRedirectToGameId.gameId);
    });

    socket.on("redirect:game", (redirectToGameId) => {
      const parsedRedirectToGameId = JSON.parse(redirectToGameId);
      navigate("/game/" + parsedRedirectToGameId.gameId);
    });

    socket.on("block_session", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      handleOpenOrCloseModal("block_session_modal", true);
    });
  }, [socket]);
};

export default useSocketHandlers;
