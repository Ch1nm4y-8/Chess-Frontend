import React, { useRef, useState } from "react";
import Button from "./Button";
import { useSocket } from "../contexts/SocketContext";
import { SECONDARY_COLOR } from "../config/constants";
import { Socket } from "socket.io-client";
import useWebRTCSocketHandlers from "../hooks/useWebRTCSocketHandlers";

const VideoCallView = () => {
  const rtcConnection = useRef<RTCPeerConnection>(null);
  const [myStream, setMyStream] = useState<MediaStream>();
  const myStreamRef = useRef<MediaStream>(null);
  const [opponentStream, setOpponentStream] = useState<MediaStream>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const opponentVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useSocket();

  useWebRTCSocketHandlers({
    socket,
    setOpponentStream,
    setMyStream,
    rtcConnection,
    myStreamRef,
    opponentVideoRef,
    myVideoRef,
    opponentStream,
    myStream,
  });

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

  return (
    <>
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
    </>
  );
};

export default VideoCallView;
