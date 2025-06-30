import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface useWebRTCSocketHandlersProp {
  socket: Socket;
  setOpponentStream: SetState<MediaStream | undefined>;
  setMyStream: SetState<MediaStream | undefined>;

  rtcConnection: React.RefObject<RTCPeerConnection | null>;
  myStreamRef: React.RefObject<MediaStream | null>;
  opponentVideoRef: React.RefObject<HTMLVideoElement | null>;
  myVideoRef: React.RefObject<HTMLVideoElement | null>;

  opponentStream: MediaStream | undefined;
  myStream: MediaStream | undefined;
}

const useWebRTCSocketHandlers = ({
  socket,
  setOpponentStream,
  setMyStream,

  rtcConnection,
  myStreamRef,
  opponentVideoRef,
  myVideoRef,
  opponentStream,
  myStream,
}: useWebRTCSocketHandlersProp) => {
  const receiveStream = () => {
    if (!rtcConnection.current) return;
    console.log("inside receive stream");
    rtcConnection.current.ontrack = (event) => {
      console.log("🔥 ontrack fired!", event.streams[0]);
      setOpponentStream(event.streams[0]);
    };
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
};

export default useWebRTCSocketHandlers;
