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

  const handleState = (msg: string) => {
    if (msg === "waiting") setJoinedGame(true);
  };

  const handleInviteCode = (invite_code: string) => {
    setInviteGameIdToSend(invite_code);
  };

  const handleCancelJoin = (status: ResponseStatus) => {
    if (status === ResponseStatus.SUCCESS) {
      console.log("afd");
    }
  };

  const handleDrawOffer = () => {
    handleOpenOrCloseModal("draw_offer_modal", true);
  };

  const handleInvalid = (msg: string) => {
    alert(msg);
  };

  const handleJoinGame = (data: string) => {
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

    if (message === "Connected") {
      const chessObject = new Chess();
      chessObj.current = chessObject;
      const newBoard = chessObject.board();

      colorRef.current = color;
      if (color === ColorEnum.BLACK) reverseBoard(newBoard);

      setBoard(newBoard);
      setPlayersDetails({
        opponentPlayerName,
        myPlayerName,
        myPlayerId,
        opponentPlayerId,
        myRole: playerRole,
        opponentPlayerPhotoURL,
        myPlayerPhotoURL,
      });
      navigate(`/game/${gameId}`);
      setStartTimer(true);
      setTotalGameTime(TotalGametime);
      setJoinedGame(true);
    }
  };

  const handleRejoinGame = (data: string) => {
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
      board_status,
      restoredOldMoves,
      color,
      player1TimeSpent,
      player2TimeSpent,
    } = parsedData;

    const chessObject = new Chess(board_status);
    chessObj.current = chessObject;
    const newBoard = chessObject.board();

    colorRef.current = color;
    if (color === ColorEnum.BLACK) reverseBoard(newBoard);

    setBoard(newBoard);
    setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : []);
    setPlayerTimeConsumedFromServer({
      player1: player1TimeSpent,
      player2: player2TimeSpent,
    });
    setStartTimer(true);
    setTotalGameTime(TotalGametime);
    setPlayersDetails({
      myPlayerName,
      myPlayerId,
      opponentPlayerName,
      opponentPlayerId,
      myRole: playerRole,
      myPlayerPhotoURL,
      opponentPlayerPhotoURL,
    });
    setMessages(restored_chat_messages);
    setJoinedGame(true);
  };

  const handleSpectateGame = (data: string) => {
    const parsedData = JSON.parse(data);
    const {
      playerRole,
      TotalGametime,
      player1Name,
      player2Name,
      myPlayerPhotoURL,
      opponentPlayerPhotoURL,
      board_status,
      restoredOldMoves,
      color,
      player1TimeSpent,
      player2TimeSpent,
    } = parsedData;

    const chessObject = new Chess(board_status);
    chessObj.current = chessObject;
    const newBoard = chessObject.board();

    colorRef.current = color;
    if (color === ColorEnum.BLACK) reverseBoard(newBoard);

    setBoard(newBoard);
    setMoves(Array.isArray(restoredOldMoves) ? restoredOldMoves : []);
    setPlayerTimeConsumedFromServer({
      player1: player1TimeSpent,
      player2: player2TimeSpent,
    });
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
  };

  const handleGameResult = (result: string) => {
    const parsedResult: gameResult = JSON.parse(result);
    const winner = parsedResult.winner ? parsedResult.message : "";

    gameStatus.current = GameStatus.GAME_COMPLETED;

    setResultInfo({
      gameResult: parsedResult.gameResult,
      gameResultReason: parsedResult.gameResultReason,
      winner,
    });

    if (parsedResult.gameResult === gameResultEnum.WIN) {
      if (
        parsedResult.winner === playersDetailsRef.current.myPlayerId &&
        playersDetailsRef.current?.myRole !== PlayerRolesEnum.SPECTATOR
      ) {
        triggerConfetti();
      }

      if (
        parsedResult.gameResultReason === gameResultReasonEnum.TIMEOUT &&
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
  };

  const handleMessage = (data: string) => {
    console.log("message received from server: " + data);
  };

  const handleReceiveChat = (chatMessageObject: string) => {
    const parsed = JSON.parse(chatMessageObject);
    setMessages((prev) => [...prev, parsed]);
  };

  const handleMakeMove = (move: string) => {
    if (!chessObj?.current) return;

    try {
      const parsedMove = JSON.parse(move);
      try {
        chessObj.current.move(parsedMove);
      } catch (err) {
        console.log("frontend move validation error: " + err);
      }

      setPlayerTimeConsumedFromServer({
        player1: parsedMove.player1TimeSpent,
        player2: parsedMove.player2TimeSpent,
      });

      lastTimeTickRef.current = Date.now();

      const newBoard = chessObj.current.board();
      if (colorRef.current === ColorEnum.BLACK) reverseBoard(newBoard);
      setBoard(newBoard);
      setMoves((prev) => [...prev, parsedMove.to]);
    } catch (err) {
      console.error("ERROR CAUGHT: " + err);
    }
  };

  const handleRedirectHistory = (redirectToGameId: string) => {
    const parsed = JSON.parse(redirectToGameId);
    navigate("/history/game/" + parsed.gameId);
  };

  const handleRedirectGame = (redirectToGameId: string) => {
    const parsed = JSON.parse(redirectToGameId);
    navigate("/game/" + parsed.gameId);
  };

  const handleBlockSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleOpenOrCloseModal("block_session_modal", true);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("state", handleState);
    socket.on("invite_code", handleInviteCode);
    socket.on("cancel_join_game", handleCancelJoin);
    socket.on("offer_draw:request_to_opponent", handleDrawOffer);
    socket.on("invalid", handleInvalid);
    socket.on("join_game", handleJoinGame);
    socket.on("rejoin_game", handleRejoinGame);
    socket.on("spectate_game", handleSpectateGame);
    socket.on("game_result", handleGameResult);
    socket.on("message", handleMessage);
    socket.on("receive_chat", handleReceiveChat);
    socket.on("make_move", handleMakeMove);
    socket.on("redirect:history", handleRedirectHistory);
    socket.on("redirect:game", handleRedirectGame);
    socket.on("block_session", handleBlockSession);

    return () => {
      socket.off("state", handleState);
      socket.off("invite_code", handleInviteCode);
      socket.off("cancel_join_game", handleCancelJoin);
      socket.off("offer_draw:request_to_opponent", handleDrawOffer);
      socket.off("invalid", handleInvalid);
      socket.off("join_game", handleJoinGame);
      socket.off("rejoin_game", handleRejoinGame);
      socket.off("spectate_game", handleSpectateGame);
      socket.off("game_result", handleGameResult);
      socket.off("message", handleMessage);
      socket.off("receive_chat", handleReceiveChat);
      socket.off("make_move", handleMakeMove);
      socket.off("redirect:history", handleRedirectHistory);
      socket.off("redirect:game", handleRedirectGame);
      socket.off("block_session", handleBlockSession);
    };
  }, [socket]);
};

export default useSocketHandlers;
