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

  const handleOffer = async (response: {
    offer: RTCSessionDescriptionInit;
  }) => {
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
    socket.emit("create:answer", { answer });

    rtcConnection.current.onnegotiationneeded = async () => {
      const offer = await rtcConnection.current?.createOffer();
      await rtcConnection.current?.setLocalDescription(offer);
      socket.emit("create:offer", { offer });
    };

    rtcConnection.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", e.candidate);
      }
    };
  };

  const handleAnswer = (response: { answer: RTCSessionDescriptionInit }) => {
    console.log("recevied answerrrrrr");
    rtcConnection.current?.setRemoteDescription(response.answer);
  };

  const handleIceCandidate = (ice_candidate: RTCIceCandidate) => {
    rtcConnection.current?.addIceCandidate(ice_candidate);
  };

  const handleStreamOff = () => {
    setOpponentStream(undefined);
  };

  const handleDisconnect = () => {
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
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("create:offer", handleOffer);
    socket.on("create:answer", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("stream:off", handleStreamOff);
    socket.on("opponent:disconnected", handleDisconnect);

    return () => {
      socket.off("create:offer", handleOffer);
      socket.off("create:answer", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("stream:off", handleStreamOff);
      socket.off("opponent:disconnected", handleDisconnect);
    };
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
