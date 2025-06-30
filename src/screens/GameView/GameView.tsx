import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import { SECONDARY_COLOR, PRIMARY_COLOR } from "../../config/constants";
import ChatView from "../../components/ChatView";
import MovesView from "../../components/MovesView";
import ChessLoader from "../../components/ChessLoader";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import GameBoard from "./GameBoard";

import {
  ColorEnum,
  BoardSquare,
  PlayerRolesEnum,
  MessagesType,
  playersDetailsType,
  GameModeEnum,
  gameResultEnum,
  gameResultReasonEnum,
  resultInfoType,
  GameStatus,
  gameResult,
  GameTypesEnum,
  ResponseStatus,
} from "../../types/gameTypes";
import { Chess } from "chess.js";
import { handleOpenOrCloseModal } from "../../utils/handleOpenOrCloseModal";
import { toast, ToastContainer } from "react-toastify";
import ResultModal from "../../components/ResultModal";
import Modal from "../../components/Modal";

interface GameBoardProp {
  socket: Socket;
  setJoinedGame: (value: boolean) => void;
  gameMode: GameModeEnum;
  gameType: GameTypesEnum;
  gameId: string | undefined;
}

const GameView = ({
  socket,
  setJoinedGame,
  gameMode,
  gameType,
  gameId,
}: GameBoardProp) => {
  const chessObj = useRef<Chess>(new Chess());
  const [board, setBoard] = useState<BoardSquare[][]>(chessObj.current.board());
  const [moves, setMoves] = useState<string[]>([]);
  const [messages, setMessages] = useState<MessagesType[]>([]);
  const [inviteGameIdToSend, setInviteGameIdToSend] = useState<string>("");
  const [totalGameTime, setTotalGameTime] = useState<number>(
    Number(gameType.split("|")[0]) * 60 * 1000
  );
  const [resultInfo, setResultInfo] = useState<resultInfoType | null>(null);

  const gameStatus = useRef<GameStatus>(GameStatus.IN_PROGRESS);
  const colorRef = useRef("");

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
  const [playerTimeConsumedFromServer, setPlayerTimeConsumedFromServer] =
    useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 });
  const lastTimeTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number>(0);
  const [startTimer, setStartTimer] = useState(false);

  // WEBRTC
  const rtcConnection = useRef<RTCPeerConnection>(null);
  const [myStream, setMyStream] = useState<MediaStream>();
  const myStreamRef = useRef<MediaStream>(null);
  const [opponentStream, setOpponentStream] = useState<MediaStream>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const opponentVideoRef = useRef<HTMLVideoElement>(null);

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
    if (!socket) {
      console.log("no socket");
      return;
    }

    if (gameId) {
      socket.emit("join_room", JSON.stringify({ gameId: gameId }));
    }
  }, [gameId, socket]);

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
      // const dialog = document.getElementById('draw_offer_modal');
      // if (dialog instanceof HTMLDialogElement) {
      //     dialog.showModal();
      // }
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

      // const dialog = document.getElementById('result_modal');
      // if (dialog instanceof HTMLDialogElement) {
      //     dialog.showModal();
      // }
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

    socket.on("opponent:disconnected", () => {
      toast("Opponent Disconnected", {
        theme: "colored",
        type: "error",
      });

      rtcConnection.current = null;
      const videoTrack = myStreamRef.current?.getVideoTracks()[0];
      videoTrack?.stop();
      setMyStream(undefined);
      myStreamRef.current = null;
      setOpponentStream(undefined);
    });
  }, [socket]);

  const cancelJoinGameHandler = () => {
    if (socket) {
      socket.emit(
        "cancel_join_game",
        JSON.stringify({
          gameMode,
          gameType,
          gameId: inviteGameIdToSend,
        })
      );
    }
  };

  const sendChatHandler = (message: string) => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    socket.emit(
      "send_chat",
      JSON.stringify({
        userName: playersDetails.myPlayerName,
        message: message,
      })
    );
  };

  const abortGameHandler = (response: boolean) => {
    // navigate('/')
    if (!socket) {
      console.log("no socket");
      return;
    }

    if (response) {
      if (gameStatus.current != GameStatus.GAME_COMPLETED)
        socket.emit("abort_game", "abort_game");
    }

    handleOpenOrCloseModal("abort_game_modal", false);
  };

  const offerDrawHandler = () => {
    if (socket && gameStatus.current != GameStatus.GAME_COMPLETED)
      socket.emit(
        "offer_draw:request_from_client",
        "offer_draw:request_from_client"
      );
    // navigate('/')
  };

  const offerDrawClickHandler = (response: boolean) => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    socket.emit("offer_draw:response_from_opponent", response);

    handleOpenOrCloseModal("draw_offer_modal", false);
  };

  async function requestCallHandler() {
    if (!socket) return;

    rtcConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    rtcConnection.current.ontrack = (event) => {
      setOpponentStream(event.streams[0]);
    };

    rtcConnection.current.onnegotiationneeded = async () => {
      console.log("creating offer , then sending offer");
      await createWebRtcOffer(socket);
    };

    rtcConnection.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", e.candidate);
      }
    };

    await sendStream();
  }

  const sendStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setMyStream(stream);
    myStreamRef.current = stream;

    rtcConnection.current?.addTrack(stream.getVideoTracks()[0], stream);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("create:offer", async (response) => {
      console.log("recived offer");
      if (!rtcConnection.current) {
        rtcConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
      }
      receiveStream();
      await rtcConnection.current.setRemoteDescription(response.offer);
      const answer = await rtcConnection.current.createAnswer();
      await rtcConnection.current.setLocalDescription(answer);
      socket.emit("create:answer", { answer: answer });

      rtcConnection.current.onnegotiationneeded = async () => {
        const offer = await rtcConnection.current?.createOffer();
        await rtcConnection.current?.setLocalDescription(offer);
        socket.emit("create:offer", { offer: offer });
      };

      rtcConnection.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice_candidate", e.candidate);
        }
      };
    });

    socket.on("create:answer", (response) => {
      console.log("recevied answerrrrrr");
      rtcConnection.current?.setRemoteDescription(response.answer);
    });

    socket.on("ice_candidate", (ice_candidate) => {
      rtcConnection.current?.addIceCandidate(ice_candidate);
    });

    socket.on("stream:off", () => {
      setOpponentStream(undefined);
    });
  }, [socket]);

  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (opponentStream && opponentVideoRef.current) {
      opponentVideoRef.current.srcObject = opponentStream;
    }
  }, [opponentStream]);

  const receiveStream = () => {
    if (!rtcConnection.current) return;
    console.log("inside receive stream");
    rtcConnection.current.ontrack = (event) => {
      console.log("🔥 ontrack fired!", event.streams[0]);
      setOpponentStream(event.streams[0]);
    };
  };

  const turnOffMyStream = async () => {
    if (!myStream || !socket) return;

    const videoTrack = myStream.getVideoTracks()[0];
    videoTrack.stop();

    const sender = rtcConnection.current
      ?.getSenders()
      .find((s) => s.track === videoTrack);

    if (sender) {
      rtcConnection.current?.removeTrack(sender);
    }

    setMyStream(undefined);
    myStreamRef.current = null;
    socket.emit("stream:off", "stream:off");
  };

  const turnOnMyStream = () => {
    if (!socket) return;

    sendStream();
  };

  const createWebRtcOffer = async (socket: Socket) => {
    const offer = await rtcConnection.current?.createOffer();
    await rtcConnection.current?.setLocalDescription(offer);
    socket.emit("create:offer", { offer: offer });
  };

  console.log("GameView rendered");
  return (
    <div>
      <ToastContainer position="top-center" />

      <div className="flex flex-wrap h-[100vh] justify-around items-center lg:flex-row">
        <div className="order-2 lg:order-1 w-[90%] md:w-1/3 lg:w-1/5 flex flex-col gap-10">
          {!rtcConnection.current ? (
            <div className="h-[100%]">
              <Button color="#0BA0E2" onClick={requestCallHandler}>
                Request Call
              </Button>
            </div>
          ) : (
            <div className="w-[100%] md:h-[40vw] lg:h-[26vw] flex flex-col justify-between gap-1">
              <div>
                <h1 className={`text-center text-xl bg-[${SECONDARY_COLOR}]`}>
                  My Stream
                </h1>
                {myStream ? (
                  <div className="border-1 border-[#444444] relative">
                    <i
                      className={`ri-video-off-fill text-black bg-[#0BA0E2] cursor-pointer px-1 absolute top-1 left-1 z-10`}
                      onClick={turnOffMyStream}
                    />
                    <video
                      ref={myVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full md:h-[15vw] lg:h-[11vw] object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[100%] md:h-[15vw] lg:h-[11vw] bg-[#111111] border-1 border-[#444444] flex justify-center items-center relative">
                    <i
                      className={`ri-video-on-fill text-black bg-[#0BA0E2] cursor-pointer px-1 absolute top-1 left-1 z-10`}
                      onClick={turnOnMyStream}
                    />
                    <i className="ri-user-3-fill text-6xl " />
                  </div>
                )}
              </div>

              <div>
                <h1 className={`text-center text-xl bg-[${SECONDARY_COLOR}]`}>
                  Opponent Stream
                </h1>
                {opponentStream ? (
                  <div className="border-1 border-[#444444] relative">
                    {/* <i className={`ri-video-off-fill text-black bg-[#0BA0E2] cursor-pointer px-1 absolute top-1 left-1 `}/> */}
                    <video
                      ref={opponentVideoRef}
                      autoPlay
                      playsInline
                      className="w-full md:h-[15vw] lg:h-[11vw] object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[100%] md:h-[15vw] lg:h-[11vw] bg-[#111111] border-1 border-[#444444] flex justify-center items-center relative">
                    {/* <i className={`ri-video-on-fill text-black bg-[#0BA0E2] cursor-pointer px-1 absolute top-1 left-1 z-10`} onClick={()=>alert(1)}/> */}
                    <i className="ri-user-3-fill text-6xl " />
                  </div>
                )}
              </div>
            </div>
          )}

          {moves.length > 0 && <MovesView moves={moves} />}
        </div>
        <div className="order-1 pt-5 lg:order-2 w-full md:w-2/3 lg:w-3/6 flex flex-col justify-center items-center md:h-[100vh] ">
          {/* GameBoard HERE */}
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
              {!resultInfo?.gameResult &&
                playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                  <Button
                    color={PRIMARY_COLOR}
                    onClick={() => {
                      handleOpenOrCloseModal("abort_game_modal", true);
                    }}
                  >
                    ABORT GAME
                  </Button>
                )}
              {!resultInfo?.gameResult &&
                playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
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
          {inviteGameIdToSend &&
            !startTimer &&
            gameMode == GameModeEnum.INVITE && (
              <div
                title="Click to Copy"
                onClick={() => {
                  navigator.clipboard.writeText(inviteGameIdToSend);
                  alert("game id copied");
                }}
                className={`bg-[#131313] border border-${PRIMARY_COLOR} hover:border-${SECONDARY_COLOR} cursor-pointer m-5 p-5 place-self-center text-sm`}
              >
                <span className="text-3xl text-center ">Invite Code:</span>
                <br />
                {inviteGameIdToSend}
              </div>
            )}

          {resultInfo?.gameResult && (
            <h1 className="text-white text-4xl text-center">
              {resultInfo.gameResult + " BY " + resultInfo.gameResultReason}
            </h1>
          )}
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
                  {!resultInfo?.gameResult &&
                    playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
                      <Button
                        color={PRIMARY_COLOR}
                        onClick={() => {
                          handleOpenOrCloseModal("abort_game_modal", true);
                        }}
                      >
                        ABORT GAME
                      </Button>
                    )}
                  {!resultInfo?.gameResult &&
                    playersDetails?.myRole == PlayerRolesEnum.PLAYER && (
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
                <ChatView
                  sendChatHandler={sendChatHandler}
                  messages={messages}
                  playerDetails={playersDetails}
                />
              ) : (
                <div className=" h-[80vh] flex flex-col">
                  <ChessLoader />
                  <h1 className="text-2xl my-5">
                    Waiting for a player to connect....
                  </h1>
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
      <Modal modalName="abort_game_modal">
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
      </Modal>
      <ResultModal result={resultInfo} />
    </div>
  );
};

export default GameView;
