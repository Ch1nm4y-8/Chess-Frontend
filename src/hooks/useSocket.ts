import { io, Socket} from "socket.io-client"
import { BACKEND_WEBSOCKET_URL } from "../config"
import { useEffect, useState } from "react";

const useSocket = () => {
  const [socket , setSocket] = useState<Socket|null>(null);

  useEffect(() => {
      const socketObj:Socket = io(BACKEND_WEBSOCKET_URL,{
        withCredentials:true,
      })
      setSocket(socketObj)
  
      socketObj.on("connect", () => {
        console.log("Socket connected with ID:", socketObj.id);
      });

    return ()=>{
      console.log('socket disconnected')
      socketObj.disconnect();
    }

  }, [])
  

  return socket;
}

export default useSocket
