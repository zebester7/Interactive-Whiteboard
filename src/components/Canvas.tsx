import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useSocket } from "@/hooks/useSocket";
import { v4 as uuidv4 } from "uuid";
import { Toolbar } from "./Toolbar";
import { Presence } from "./Presence";
import { TooltipProvider } from "@/components/ui/tooltip";

interface CanvasProps {
  boardId: string;
  user: { name: string; color: string };
}

interface ExtendedCanvas extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
}

interface ExtendedObject extends fabric.FabricObject {
  id?: string;
  creatorId?: string;
  remote?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ boardId, user }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<ExtendedCanvas | null>(null);
  const { socket, isConnected, users } = useSocket(boardId, user);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#ffffff",
    }) as ExtendedCanvas;

    fabricCanvasRef.current = canvas;

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    // Zoom and Pan
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on("mouse:down", (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey === true) {
        canvas.isDragging = true;
        canvas.selection = false;
        canvas.lastPosX = evt.clientX;
        canvas.lastPosY = evt.clientY;
      }
    });

    canvas.on("mouse:move", (opt) => {
      const e = opt.e as MouseEvent;
      if (canvas.isDragging && canvas.lastPosX !== undefined && canvas.lastPosY !== undefined) {
        const vpt = canvas.viewportTransform;
        vpt[4] += e.clientX - canvas.lastPosX;
        vpt[5] += e.clientY - canvas.lastPosY;
        canvas.requestRenderAll();
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
      }

      // Send cursor position
      if (socket) {
        const pointer = canvas.getScenePoint(opt.e);
        socket.emit("cursor-move", { boardId, position: pointer });
      }
    });

    canvas.on("mouse:up", () => {
      canvas.setViewportTransform(canvas.viewportTransform);
      canvas.isDragging = false;
      canvas.selection = true;
    });

    // Object events
    canvas.on("object:added", (e) => {
      const obj = e.target as ExtendedObject;
      if (obj && !obj.id) {
        obj.id = uuidv4();
        obj.creatorId = socket?.id;
        emitObject(obj);
      }
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target as ExtendedObject;
      if (obj) {
        emitObject(obj);
      }
    });

    canvas.on("object:removed", (e) => {
      const obj = e.target as ExtendedObject;
      if (obj && !obj.remote) {
        socket?.emit("delete-object", { boardId, objectId: obj.id });
      }
    });

    const emitObject = (obj: ExtendedObject) => {
      if (obj.remote) return;
      const json = obj.toObject(["id", "creatorId"]);
      socket?.emit("draw", { boardId, object: json });
    };

    // Socket events
    if (socket) {
      socket.on("board-state", (state: any[]) => {
        canvas.loadFromJSON({ objects: state }).then(() => {
          canvas.getObjects().forEach((obj: ExtendedObject) => {
            obj.remote = true;
          });
          canvas.renderAll();
        });
      });

      socket.on("draw", (object: any) => {
        const existing = canvas.getObjects().find((o: ExtendedObject) => o.id === object.id) as ExtendedObject;
        if (existing) {
          existing.set(object);
          existing.setCoords();
        } else {
          fabric.util.enlivenObjects([object]).then((objs) => {
            objs.forEach((obj: ExtendedObject) => {
              obj.remote = true;
              canvas.add(obj);
            });
          });
        }
        canvas.renderAll();
      });

      socket.on("delete-object", (objectId: string) => {
        const obj = canvas.getObjects().find((o: ExtendedObject) => o.id === objectId);
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      });
    }


    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [boardId, socket]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === "pen" || activeTool === "highlighter";
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = strokeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
      if (activeTool === "highlighter") {
        canvas.freeDrawingBrush.color = strokeColor + "80"; // 50% opacity
        canvas.freeDrawingBrush.width = 20;
      }
    }
  }, [activeTool, strokeColor, strokeWidth]);

  const addShape = (type: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape;
    const common = {
      left: 100,
      top: 100,
      fill: "transparent",
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    };

    if (type === "rect") {
      shape = new fabric.Rect({ ...common, width: 100, height: 100 });
    } else if (type === "circle") {
      shape = new fabric.Circle({ ...common, radius: 50 });
    } else if (type === "sticky") {
      shape = new fabric.Textbox("Sticky Note", {
        left: 100,
        top: 100,
        width: 150,
        backgroundColor: "#fef3c7",
        padding: 10,
        fontSize: 16,
      });
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const exportToPNG = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = `board-${boardId}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <TooltipProvider>
      <div className="relative w-full h-screen overflow-hidden bg-gray-50">
        <canvas ref={canvasRef} />
        
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          strokeColor={strokeColor}
          setStrokeColor={setStrokeColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          addShape={addShape}
          deleteSelected={deleteSelected}
          exportToPNG={exportToPNG}
        />


        <Presence users={users} />

        <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md border shadow-sm">
          {isConnected ? "Connected" : "Connecting..."} | Board: {boardId} | Alt + Drag to Pan | Scroll to Zoom
        </div>
      </div>
    </TooltipProvider>
  );
};
