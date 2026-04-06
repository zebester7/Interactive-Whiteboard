import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (boardId: string, user: any) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-board", { boardId, user });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("users-list", (userList: any[]) => {
      setUsers(userList);
    });

    return () => {
      socket.disconnect();
    };
  }, [boardId, user]);

  return { socket: socketRef.current, isConnected, users };
};
