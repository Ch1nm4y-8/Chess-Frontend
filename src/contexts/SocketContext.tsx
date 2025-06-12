import React,{ createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_WEBSOCKET_URL } from "../config";

const SocketContext = createContext<Socket|null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketContextProvider = ({children}:{children:ReactNode})=>{
    const [socket, setSocket] = useState<Socket|null>(null);
    const socketRef = useRef<Socket>(null);

    useEffect(()=>{
        if(!socketRef.current){
            socketRef.current = io(BACKEND_WEBSOCKET_URL,{
                withCredentials:true,
            })
            setSocket(socketRef.current);
        }

        return ()=>{
            socketRef.current?.disconnect();
        }
    },[])


    return (
        <SocketContext.Provider value={socket}>
        {children}
        </SocketContext.Provider>
    );
}