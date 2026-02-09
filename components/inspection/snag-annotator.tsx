"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Undo2, Trash2, Check, X } from "lucide-react";

interface SnagAnnotatorProps {
  photoSrc: string; // data URL or blob URL
  onSave: (annotatedDataUrl: string) => void;
  onCancel: () => void;
}

const STROKE_COLOR = "#C62828"; // Punchly Critical Red
const STROKE_WIDTH = 4;
const MAX_CANVAS_SIZE = 1920;
const MAX_UNDO_STEPS = 20;

export function SnagAnnotator({ photoSrc, onSave, onCancel }: SnagAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [canvasReady, setCanvasReady] = useState(false);

  // Natural (image) dimensions and display scale
  const naturalSize = useRef({ width: 0, height: 0 });
  const displayScale = useRef(1);

  // ─── Initialize Canvas ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const img = new Image();
    img.onload = () => {
      // Constrain to MAX_CANVAS_SIZE
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const longest = Math.max(w, h);
      if (longest > MAX_CANVAS_SIZE) {
        const scale = MAX_CANVAS_SIZE / longest;
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      naturalSize.current = { width: w, height: h };

      // Set canvas internal resolution
      canvas.width = w;
      canvas.height = h;

      // Calculate display scale to fit container
      const containerRect = container.getBoundingClientRect();
      const scaleX = containerRect.width / w;
      const scaleY = (containerRect.height - 60) / h; // 60px for toolbar
      displayScale.current = Math.min(scaleX, scaleY, 1);

      // Draw image
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      // Save initial state for undo
      const initialState = ctx.getImageData(0, 0, w, h);
      setUndoStack([initialState]);
      setCanvasReady(true);
    };
    img.src = photoSrc;
  }, [photoSrc]);

  // ─── Coordinate Helpers ────────────────────────────────────────────
  const getCanvasCoords = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // ─── Drawing Handlers ─────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // Save state before new stroke for undo
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack((prev) => {
        const next = [...prev, currentState];
        return next.length > MAX_UNDO_STEPS ? next.slice(-MAX_UNDO_STEPS) : next;
      });

      const { x, y } = getCanvasCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = STROKE_COLOR;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setIsDrawing(true);

      // Capture pointer for smooth tracking
      canvas.setPointerCapture(e.pointerId);
    },
    [getCanvasCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      e.preventDefault();

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const { x, y } = getCanvasCoords(e);

      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, getCanvasCoords]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsDrawing(false);
      const canvas = canvasRef.current!;
      canvas.releasePointerCapture(e.pointerId);
    },
    []
  );

  // ─── Undo ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return; // Can't undo past initial state

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const newStack = [...undoStack];
    newStack.pop(); // Remove current state
    const previousState = newStack[newStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setUndoStack(newStack);
  }, [undoStack]);

  // ─── Clear all annotations ────────────────────────────────────────
  const handleClear = useCallback(() => {
    if (undoStack.length <= 1) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const initialState = undoStack[0];
    ctx.putImageData(initialState, 0, 0);
    setUndoStack([initialState]);
  }, [undoStack]);

  // ─── Save ──────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSave(dataUrl);
  }, [onSave]);

  // ─── Keyboard Shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, onCancel]);

  const scale = displayScale.current;
  const { width, height } = naturalSize.current;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-punchly-navy shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white transition-colors"
            aria-label="Cancel annotation"
          >
            <X className="h-4 w-4" strokeWidth={2} />
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Undo (Ctrl+Z)"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" strokeWidth={2} />
            Undo
          </button>
          <button
            onClick={handleClear}
            disabled={undoStack.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Clear all annotations"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Clear
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!canvasReady}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-punchly-success rounded-md hover:bg-punchly-success/90 disabled:opacity-50 transition-colors"
          aria-label="Save annotation"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          Save
        </button>
      </div>

      {/* Drawing hint */}
      <div className="text-center py-1 text-xs text-white/50 shrink-0">
        Draw with your finger or mouse to mark issues
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="cursor-crosshair"
          style={{
            touchAction: "none",
            width: canvasReady ? `${width * scale}px` : undefined,
            height: canvasReady ? `${height * scale}px` : undefined,
          }}
        />
        {!canvasReady && (
          <div className="text-white/50 text-sm">Loading photo...</div>
        )}
      </div>
    </div>
  );
}
