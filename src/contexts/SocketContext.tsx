import React, { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_WEBSOCKET_URL } from "../config";

type SocketGetter = () => Socket;
const SocketContext = createContext<SocketGetter | null>(null);

export const useSocket = () => {
  const getSocket = useContext(SocketContext);
  if (!getSocket) throw new Error("useSocket must be used within a SocketProvider");
  return getSocket();
};

export const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket>(null);

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(BACKEND_WEBSOCKET_URL, {
        withCredentials: true,
      });
      console.log(socketRef.current);
      //   setSocket(socketRef.current);
    }
    return socketRef.current;
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return <SocketContext.Provider value={getSocket}>{children}</SocketContext.Provider>;
};
