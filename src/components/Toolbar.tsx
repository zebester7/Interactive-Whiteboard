import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  MousePointer2,
  Pencil,
  Highlighter,
  Eraser,
  Square,
  Circle,
  StickyNote,
  Trash2,
  Palette,
  Type,
  Image as ImageIcon,
  Download,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  addShape: (type: string) => void;
  deleteSelected: () => void;
  exportToPNG: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  addShape,
  deleteSelected,
  exportToPNG,
}) => {

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "pen", icon: Pencil, label: "Pen (P)" },
    { id: "highlighter", icon: Highlighter, label: "Highlighter (H)" },
    { id: "eraser", icon: Eraser, label: "Eraser (E)" },
  ];

  const shapes = [
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "sticky", icon: StickyNote, label: "Sticky Note" },
  ];

  const colors = [
    "#000000", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"
  ];

  return (
    <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white rounded-xl border shadow-lg z-50">
      {tools.map((tool) => (
        <div key={tool.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "h-10 w-10 rounded-lg transition-all",
                  activeTool === tool.id ? "shadow-md" : "hover:bg-gray-100"
                )}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}

      <div className="h-px bg-gray-200 mx-1 my-1" />

      {shapes.map((shape) => (
        <div key={shape.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addShape(shape.id)}
                className="h-10 w-10 rounded-lg hover:bg-gray-100"
              >
                <shape.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{shape.label}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}


      <div className="h-px bg-gray-200 mx-1 my-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg hover:bg-gray-100"
          >
            <div
              className="w-5 h-5 rounded-full border border-gray-200"
              style={{ backgroundColor: strokeColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-48 p-3">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110",
                    strokeColor === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setStrokeColor(color)}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Stroke Width</span>
                <span>{strokeWidth}px</span>
              </div>
              <Slider
                value={[strokeWidth]}
                min={1}
                max={20}
                step={1}
                onValueChange={(val) => setStrokeWidth(val[0])}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={exportToPNG}
            className="h-10 w-10 rounded-lg hover:bg-gray-100"
          >
            <Download className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Export to PNG</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-px bg-gray-200 mx-1 my-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={deleteSelected}
            className="h-10 w-10 rounded-lg hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Delete Selected (Del)</p>
        </TooltipContent>
      </Tooltip>

    </div>
  );
};
