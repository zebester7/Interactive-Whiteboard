import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface PresenceProps {
  users: User[];
}

export const Presence: React.FC<PresenceProps> = ({ users }) => {
  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <div className="flex -space-x-2">
          <AnimatePresence>
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="relative"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-transparent transition-all hover:ring-primary">
                      <AvatarFallback
                        style={{ backgroundColor: user.color, color: "#fff" }}
                        className="text-[10px] font-bold"
                      >
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="px-3 py-1 bg-white/80 rounded-full border shadow-sm text-xs font-medium text-gray-600">
          {users.length} online
        </div>
      </div>

      {/* Real-time Cursors */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {users.map((user) => {
          if (!user.cursor) return null;
          return (
            <motion.div
              key={`cursor-${user.id}`}
              className="absolute flex flex-col items-start gap-1"
              animate={{
                x: user.cursor.x,
                y: user.cursor.y,
              }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 250,
                mass: 0.5,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: user.color }}
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill="currentColor"
                  stroke="white"
                />
              </svg>
              <div
                className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};
