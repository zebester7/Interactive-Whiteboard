/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Canvas } from "./components/Canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "motion/react";
import { Palette, Users, Zap, Share2 } from "lucide-react";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

function Landing() {
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState("");
  const [name, setName] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const id = boardId.trim() || Math.random().toString(36).substring(7);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      localStorage.setItem("nexus-user", JSON.stringify({ name, color }));
      navigate(`/board/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-none">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Palette className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">NexusCanvas</CardTitle>
            <CardDescription>Real-time collaborative digital whiteboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Board ID (Optional)</label>
                <Input
                  placeholder="Leave empty for new board"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold">
                Start Collaborating
              </Button>
            </form>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Real-time</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Multi-user</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Share2 className="w-4 h-4 text-green-500" />
                <span>Instant Share</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Board() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      // Redirect to landing if no user info
      window.location.href = "/";
    }
  }, []);

  if (!id || !user) return null;

  return <Canvas boardId={id} user={user} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

