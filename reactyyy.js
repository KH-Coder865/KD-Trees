import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function KdTree2DVisualizer() {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const canvasSize = 400;

  // Redraw the canvas when points change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw all points
    ctx.fillStyle = "#3b82f6";
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [points]);

  const handleCanvasClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  const generateRandomPoints = () => {
    const pts = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvasSize,
      y: Math.random() * canvasSize,
    }));
    setPoints(pts);
  };

  const clearPoints = () => setPoints([]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.h1
        className="text-3xl font-bold text-blue-600 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        2D KD-Tree Visualization
      </motion.h1>

      <div className="shadow-lg border border-gray-200 rounded-xl p-4 flex flex-col items-center space-y-4">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onClick={handleCanvasClick}
          className="border border-gray-300 rounded-lg bg-gray-50 cursor-crosshair transition-transform hover:scale-[1.02]"
        ></canvas>

        <div className="flex space-x-3 mt-2">
          <button
            onClick={generateRandomPoints}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Generate Random Points
          </button>
          <button
            onClick={clearPoints}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="mt-4 text-gray-600 text-sm">
        Click on the canvas to add points or generate random ones.
      </p>
    </div>
  );
}
