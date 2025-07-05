import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { PRIMARY_COLOR } from "../../config/constants";

import ChatView from "../../components/ChatView";
import MovesView from "../../components/MovesView";
import VideoCallView from "../../components/VideoCallView";
import GameBoard from "./GameBoard";
import ChessLoader from "../../components/ChessLoader";

import { useNavigate } from "react-router-dom";
import useSocketHandlers from "../../hooks/useSocketHandlers";

import { BoardSquare, PlayerRolesEnum, MessagesType, playersDetailsType, GameModeEnum, resultInfoType, GameStatus, GameTypesEnum } from "../../types/gameTypes";
import { Chess } from "chess.js";
import { ToastContainer } from "react-toastify";
import Modal from "../../components/Modal";
import InviteGameId from "../../components/InviteGameId";
import ResultModalContent from "../../components/ResultModalContent";
import { useSocket } from "../../contexts/SocketContext";

interface GameBoardProp {
  setJoinedGame: (value: boolean) => void;
  gameMode: GameModeEnum;
  gameType: GameTypesEnum;
  gameId: string | undefined;
}

const GameView = ({ setJoinedGame, gameMode, gameType, gameId }: GameBoardProp) => {
  const socket = useSocket();
  const chessObj = useRef<Chess>(new Chess());
  const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
  const [moves, setMoves] = useState<string[]>([]);
  const [messages, setMessages] = useState<MessagesType[]>([]);
  const [inviteGameIdToSend, setInviteGameIdToSend] = useState<string>("");
  const [totalGameTime, setTotalGameTime] = useState<number>(Number(gameType.split("|")[0]) * 60 * 1000);
  const [resultInfo, setResultInfo] = useState<resultInfoType | null>(null);

  const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS);
  const colorRef = useRef("");

  const [activeModal, setActiveModal] = useState<null | "abort" | "block" | "draw" | "result">(null);

  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1090;

  const [playersDetails, setPlayersDetails] = useState<playersDetailsType>({
    opponentPlayerName: "Opponent",
    myPlayerName: "",
  });
  const playersDetailsRef = useRef<playersDetailsType>(playersDetails);
  useEffect(() => {
    playersDetailsRef.current = playersDetails;
  }, [playersDetails]);

  // TIMER
  const [playerTimeConsumedFromServer, setPlayerTimeConsumedFromServer] = useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 });
  const lastTimeTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number>(0);
  const [startTimer, setStartTimer] = useState(false);

  useSocketHandlers({
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
    setActiveModal,
    chessObj,
    colorRef,
    timerRef,
    lastTimeTickRef,
    playersDetailsRef,
    gameStatus,
  });

  useEffect(() => {
    if (!gameId) return;
    socketEmit("join_room", JSON.stringify({ gameId: gameId }));
  }, [gameId, socket]);

  const socketEmit = (event: string, data: unknown) => {
    if (!socket) return console.warn("Socket missing");
    socket.emit(event, data);
  };

  const cancelJoinGameHandler = () => {
    socketEmit(
      "cancel_join_game",
      JSON.stringify({
        gameMode,
        gameType,
        gameId: inviteGameIdToSend,
      })
    );
    setJoinedGame(false);
  };

  const sendChatHandler = (message: string) => {
    socketEmit(
      "send_chat",
      JSON.stringify({
        userName: playersDetails.myPlayerName,
        message: message,
      })
    );
  };

  const abortGameHandler = (response: boolean) => {
    if (response) {
      if (gameStatus.current != GameStatus.GAME_COMPLETED) socketEmit("abort_game", "abort_game");
    }

    // handleOpenOrCloseModal("abort_game_modal", false);
    setActiveModal(null);
  };

  const offerDrawHandler = () => {
    if (gameStatus.current != GameStatus.GAME_COMPLETED) socketEmit("offer_draw:request_from_client", "offer_draw:request_from_client");
  };

  const offerDrawClickHandler = (response: boolean) => {
    socketEmit("offer_draw:response_from_opponent", response);
    setActiveModal(null);
  };

  return (
    <div>
      <ToastContainer position="top-center" />

      <div className="flex flex-wrap h-[100vh] justify-around items-center lg:flex-row">
        <div className="order-2 lg:order-1 w-[90%] md:w-1/3 lg:w-1/5 flex flex-col gap-10">
          <VideoCallView />
          {moves.length > 0 && <MovesView moves={moves} />}
        </div>

        <div className="order-1 pt-5 lg:order-2 w-full md:w-2/3 lg:w-3/6 flex flex-col justify-center items-center md:h-[100vh] ">
          <GameBoard
            playersDetails={playersDetails}
            colorRef={colorRef}
            chessObj={chessObj}
            board={board}
            gameStatus={gameStatus}
            totalGameTime={totalGameTime}
            playerTimeConsumedFromServer={playerTimeConsumedFromServer}
            startTimer={startTimer}
            lastTimeTickRef={lastTimeTickRef}
            timerRef={timerRef}
          />

          {isMobile && colorRef?.current && (
            <div className="flex m-auto gap-5 my-30 md:my-10">
              {!resultInfo?.gameResult && playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                <Button
                  color={PRIMARY_COLOR}
                  onClick={() => {
                    // handleOpenOrCloseModal("abort_game_modal", true);
                    setActiveModal("abort");
                  }}
                >
                  ABORT GAME
                </Button>
              )}
              {!resultInfo?.gameResult && playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                <Button
                  color={PRIMARY_COLOR}
                  onClick={() => {
                    offerDrawHandler();
                  }}
                >
                  OFFER DRAW
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="order-3 w-[90%] lg:w-2/8 pt-20 flex flex-col h-[60vh] lg:h-[100vh]">
          {inviteGameIdToSend && !startTimer && gameMode == GameModeEnum.INVITE && <InviteGameId inviteGameIdToSend={inviteGameIdToSend} />}

          {resultInfo?.gameResult && <h1 className="text-white text-4xl text-center">{resultInfo.gameResult + " BY " + resultInfo.gameResultReason}</h1>}
          {resultInfo?.gameResult && (
            <Button
              color={PRIMARY_COLOR}
              onClick={() => {
                setJoinedGame(false);
                navigate("/game");
              }}
            >
              NEW GAME
            </Button>
          )}

          {playersDetails?.myRole != PlayerRolesEnum.SPECTATOR && (
            <div className="flex flex-col gap-3">
              {!isMobile && (
                <div className="flex m-auto gap-5">
                  {!resultInfo?.gameResult && playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                    <Button
                      color={PRIMARY_COLOR}
                      onClick={() => {
                        // handleOpenOrCloseModal("abort_game_modal", true);
                        setActiveModal("abort");
                      }}
                    >
                      ABORT GAME
                    </Button>
                  )}
                  {!resultInfo?.gameResult && playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                    <Button
                      color={PRIMARY_COLOR}
                      onClick={() => {
                        offerDrawHandler();
                      }}
                    >
                      OFFER DRAW
                    </Button>
                  )}
                </div>
              )}
              {colorRef.current ? (
                <ChatView sendChatHandler={sendChatHandler} messages={messages} playerDetails={playersDetails} />
              ) : (
                <div className=" h-[80vh] flex flex-col">
                  <ChessLoader />
                  <h1 className="text-2xl my-5">Waiting for a player to connect....</h1>
                  <Button color="#0CB07B" onClick={cancelJoinGameHandler}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Make sure this modal renders only when required */}
      {/* <Modal modalName="abort_game_modal">
        <div>
          <h1 className="text-3xl pb-4">Are you sure you want to abort</h1>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                abortGameHandler(true);
              }}
            >
              Yes
            </Button>
            <Button
              color="#0CB07B"
              onClick={() => {
                abortGameHandler(false);
              }}
            >
              No
            </Button>
          </div>
        </div>
      </Modal>

      <Modal modalName="block_session_modal">
        <div>
          <h1 className="text-2xl pb-4">
            Looks like you’re active in another tab.
          </h1>
          <h2 className="text-xl pb-4">
            You can continue playing there or click below to switch to this
            session.
          </h2>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                window.location.reload();
              }}
            >
              Play Here
            </Button>
          </div>
        </div>
      </Modal>

      <Modal modalName="draw_offer_modal">
        <div>
          <h1 className="text-3xl pb-4">Opponent Offered Draw</h1>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                offerDrawClickHandler(true);
              }}
            >
              Accept
            </Button>
            <Button
              color="#0CB07B"
              onClick={() => {
                offerDrawClickHandler(false);
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal> */}

      <Modal isOpen={activeModal == "abort"} onClose={() => setActiveModal(null)}>
        <div>
          <h1 className="text-3xl pb-4">Are you sure you want to abort</h1>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                abortGameHandler(true);
              }}
            >
              Yes
            </Button>
            <Button
              color="#0CB07B"
              onClick={() => {
                abortGameHandler(false);
              }}
            >
              No
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal == "block"} onClose={() => setActiveModal(null)}>
        <div>
          <h1 className="text-2xl pb-4">Looks like you’re active in another tab.</h1>
          <h2 className="text-xl pb-4">You can continue playing there or click below to switch to this session.</h2>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                window.location.reload();
              }}
            >
              Play Here
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal == "draw"} onClose={() => setActiveModal(null)}>
        <div>
          <h1 className="text-3xl pb-4">Opponent Offered Draw</h1>
          <div className="flex justify-around">
            <Button
              color="#0BA0E2"
              onClick={() => {
                offerDrawClickHandler(true);
              }}
            >
              Accept
            </Button>
            <Button
              color="#0CB07B"
              onClick={() => {
                offerDrawClickHandler(false);
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal == "result"} onClose={() => setActiveModal(null)}>
        <ResultModalContent result={resultInfo} />
      </Modal>
    </div>
  );
};

export default GameView;
