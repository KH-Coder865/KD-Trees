import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_BASE_URL = 'https://kd-trees-backend.onrender.com';
const CANVAS_SIZE = 700;
const BOUNDARY_MAX = 100;
const BOUNDARY_MIN = 0;
const CLICK_TOLERANCE = 10; // Pixel radius for point selection in Delete Mode

// --- Inline SVG Icons (Replacing lucide-react imports) ---
const Icon = ({ children, className = "w-6 h-6", strokeWidth = 2, viewBox = "0 0 24 24", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);
const Network = (props) => (
  <Icon {...props}><path d="M1 21h4V9H1v12zm8 0h4V3H9v18zM17 21h4v-6h-4v6z" /></Icon>
);
const Map = (props) => (
  <Icon {...props}><path d="M1 6v15m0-10l5 5l5-5l5 5l5-5v10l-5 5l-5-5l-5 5l-5-5z" /></Icon>
);
const Zap = (props) => (
  <Icon {...props}><path d="M13 2L3 14h9l-1 8l10-12h-9l1-8z" /></Icon>
);
const RefreshCw = (props) => (
  <Icon {...props}><path d="M23 4v6h-6m6 0l-3-3m3 3l-3 3M1 20v-6h6m-6 0l3 3m-3-3l3-3m3-10a10 10 0 0 1 1.7-6.2A10 10 0 0 1 12 2a10 10 0 0 1 10 10a10 10 0 0 1-10 10a10 10 0 0 1-10-10a10 10 0 0 1 1.7-6.2" /></Icon>
);
const Search = (props) => (
  <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
);
const Layers = (props) => (
  <Icon {...props}><path d="M12 2l10 5l-10 5l-10-5l10-5zM2 17l10 5l10-5M2 12l10 5l10-5" /></Icon>
);
const Trash2 = (props) => (
  <Icon {...props}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>
);
// --- End Icons ---


// --- API Fetch Utility ---
const useApi = async (url, method = 'GET', body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const config = { method, headers };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! Status: ${response.status}. Detail: ${errorBody.error || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { error: error.message };
  }
};

// --- Custom Hook for Debounced Loading State (Smoother UX) ---
const useDebouncedLoading = (delay = 300) => {
  // isPending: True immediately when a request starts (for disabling buttons)
  const [isPending, setIsPending] = useState(false);
  // showOverlay: True only after 'delay' ms has passed (for showing the UI overlay)
  const [showOverlay, setShowOverlay] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setIsPending(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, delay);
  }, [delay]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowOverlay(false);
    setIsPending(false);
  }, []);

  return { isPending, showOverlay, start, stop };
};


const KdTreeViewer = () => {
  // Modes: 'insert', 'search', 'delete'
  const [mode, setMode] = useState('insert');
  const [points, setPoints] = useState([]); // List of points (for display in table)
  const [treeStructure, setTreeStructure] = useState(null); // Full nested structure for partition drawing
  const [targetPoint, setTargetPoint] = useState(null);
  const [nearestNeighbor, setNearestNeighbor] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('legend');
  const canvasRef = useRef(null);

  // Using the custom hook for smooth loading
  const { isPending, showOverlay, start, stop } = useDebouncedLoading(300);

  // Helper: Converts canvas pixels (0-500) to coordinates (0-100)
  const pixelToCoord = (pixel, isY = false) => {
    const coord = (pixel / CANVAS_SIZE) * BOUNDARY_MAX;
    // Invert Y coordinate for Cartesian system (0 is bottom, 100 is top)
    return Math.round(isY ? BOUNDARY_MAX - coord : coord);
  };

  // Helper: Converts coordinates (0-100) to canvas pixels (0-500)
  const coordToPixel = (coord, isY = false) => {
    const pixel = (coord / BOUNDARY_MAX) * CANVAS_SIZE;
    // Invert Y coordinate for Canvas system (0 is top, 500 is bottom)
    return isY ? CANVAS_SIZE - pixel : pixel;
  };

  // --- Data Fetching and Initialization ---

  const fetchData = useCallback(async () => {
    start();
    setApiError(null);

    try {
      const [pointsData, structureData] = await Promise.all([
        useApi('/traverse', 'GET'),
        useApi('/structure', 'GET')
      ]);

      if (pointsData.error) {
        setApiError(`Failed to load points: ${pointsData.error}`);
        setPoints([]);
      } else if (structureData.error) {
        setApiError(`Failed to load tree structure: ${structureData.error}`);
        setTreeStructure(null);
        setPoints(pointsData.points.map(([x, y]) => ({ x, y })));
      } else {
        setPoints(pointsData.points.map(([x, y], index) => ({ id: index, x, y })));
        setTreeStructure(structureData.tree);
      }
    } catch (error) {
      setApiError(`An unexpected error occurred: ${error.message}`);
    } finally {
      stop();
    }
  }, [start, stop]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---

  const handleCanvasClick = useCallback(async (event) => {
    if (isPending) return;
    setApiError(null);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clickX_pixel = event.clientX - rect.left;
    const clickY_pixel = event.clientY - rect.top;

    const x_coord = pixelToCoord(clickX_pixel);
    const y_coord = pixelToCoord(clickY_pixel, true);
    const queryPoint = [x_coord, y_coord];

    if (mode === 'insert') {
      start();
      try {
        const response = await useApi('/insert', 'POST', { point: queryPoint });

        if (response.error) {
          setApiError(response.error);
        }
        await fetchData();
      } finally {
        stop();
      }

    } else if (mode === 'search') {
      if (points.length === 0) {
        setApiError("Tree is empty. Insert points first.");
        return;
      }
      setTargetPoint({ x: x_coord, y: y_coord });
      setNearestNeighbor(null);

      start();
      try {
        const data = await useApi('/nearest', 'POST', { target: queryPoint });

        if (data.nearest_neighbor) {
          const [nnX, nnY] = data.nearest_neighbor;
          setNearestNeighbor({ x: nnX, y: nnY });
        } else if (data.error) {
          setApiError(data.error);
          setNearestNeighbor(null);
        }
      } finally {
        stop();
      }

    } else if (mode === 'delete') {
      if (points.length === 0) {
        setApiError("Tree is empty. Nothing to delete.");
        return;
      }

      // Find the closest point within the tolerance
      let closestPoint = null;
      let minDistanceSq = (CLICK_TOLERANCE * CLICK_TOLERANCE) * 2;

      for (const p of points) {
        const pX_pixel = coordToPixel(p.x);
        const pY_pixel = coordToPixel(p.y, true);

        const dx = pX_pixel - clickX_pixel;
        const dy = pY_pixel - clickY_pixel;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestPoint = p;
        }
      }

      if (closestPoint) {
        start();
        try {
          // Call delete API using the found point's coordinates
          const response = await useApi('/delete', 'POST', { point: [closestPoint.x, closestPoint.y] });

          if (response.error) {
            setApiError(response.error);
          } else {
            console.log(`Successfully deleted point (${closestPoint.x}, ${closestPoint.y})`);
            // Clear search results as the neighbor might change
            setTargetPoint(null);
            setNearestNeighbor(null);
          }
          await fetchData(); // Re-fetch all data to refresh tree
        } finally {
          stop();
        }

      } else {
        setApiError(`No point found within ${CLICK_TOLERANCE} pixels of click.`);
      }
    }
  }, [mode, fetchData, isPending, points, start, stop]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setTargetPoint(null);
    setNearestNeighbor(null);
    setApiError(null);
  };

  // --- Canvas Drawing Logic ---

  // Recursive function to draw the splitting hyperplanes
  const drawPartitions = useCallback((ctx, node, minX, maxX, minY, maxY) => {
    if (!node) return;

    const [x, y] = node.point;
    const depth = node.depth;
    const dim = depth % 2; // 0 for X (vertical line), 1 for Y (horizontal line)

    ctx.setLineDash([5, 3]);
    ctx.lineWidth = 1.5;

    if (dim === 0) { // Split on X-dimension (Vertical Line)
      const px = coordToPixel(x);
      const pYmin = coordToPixel(minY, true);
      const pYmax = coordToPixel(maxY, true);

      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + (depth * 0.05)})`; // Reddish, lighter with depth
      ctx.beginPath();
      ctx.moveTo(px, pYmin);
      ctx.lineTo(px, pYmax);
      ctx.stroke();

      // Recurse Left (Points X' < x): New X max is x
      drawPartitions(ctx, node.left, minX, x, minY, maxY);
      // Recurse Right (Points X' >= x): New X min is x
      drawPartitions(ctx, node.right, x, maxX, minY, maxY);

    } else { // Split on Y-dimension (Horizontal Line)
      const py = coordToPixel(y, true);
      const pXmin = coordToPixel(minX);
      const pXmax = coordToPixel(maxX);

      ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 + (depth * 0.05)})`; // Bluish, lighter with depth
      ctx.beginPath();
      ctx.moveTo(pXmin, py);
      ctx.lineTo(pXmax, py);
      ctx.stroke();

      // Recurse Left (Points Y' < y): Lower region. Y bounds are [minY, y]
      drawPartitions(ctx, node.left, minX, maxX, minY, y);
      // Recurse Right (Points Y' >= y): Upper region. Y bounds are [y, maxY]
      drawPartitions(ctx, node.right, minX, maxX, y, maxY);
    }

  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Clear canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Draw Grid and Axes (simplified, as coordinates are 0-100)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (let i = 0; i <= 10; i++) {
      // Horizontal lines (Y-axis)
      ctx.beginPath();
      ctx.moveTo(0, i * 50);
      ctx.lineTo(CANVAS_SIZE, i * 50);
      ctx.stroke();
      // Vertical lines (X-axis)
      ctx.beginPath();
      ctx.moveTo(i * 50, 0);
      ctx.lineTo(i * 50, CANVAS_SIZE);
      ctx.stroke();
    }

    // 3. Draw Partitions (if structure is available)
    if (treeStructure) {
      drawPartitions(ctx, treeStructure, BOUNDARY_MIN, BOUNDARY_MAX, BOUNDARY_MIN, BOUNDARY_MAX);
    }

    // 4. Draw Data Points (on top of partitions)
    points.forEach(p => {
      const px = coordToPixel(p.x);
      const py = coordToPixel(p.y, true);

      // Standard Data Point
      ctx.fillStyle = '#10b981'; // Tailwind emerald-500
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      // Point Label (Coordinates)
      ctx.fillStyle = '#4b5563';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`(${p.x}, ${p.y})`, px + 7, py + 4);
    });

    // 5. Draw Nearest Neighbor result
    if (nearestNeighbor) {
      const nnX = coordToPixel(nearestNeighbor.x);
      const nnY = coordToPixel(nearestNeighbor.y, true);

      // Highlight Nearest Neighbor (large ring)
      ctx.strokeStyle = '#ef4444'; // Tailwind red-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(nnX, nnY, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Highlight Nearest Neighbor (point color)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(nnX, nnY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Draw Target Point last 
    if (targetPoint) {
      const tX = coordToPixel(targetPoint.x);
      const tY = coordToPixel(targetPoint.y, true);

      // Cross hair
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(tX - 8, tY);
      ctx.lineTo(tX + 8, tY);
      ctx.moveTo(tX, tY - 8);
      ctx.lineTo(tX, tY + 8);
      ctx.stroke();

      // Target Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`TARGET (${targetPoint.x}, ${targetPoint.y})`, tX + 10, tY + 4);

      // Draw a dashed line from Target to Nearest Neighbor
      if (nearestNeighbor) {
        const nnX = coordToPixel(nearestNeighbor.x);
        const nnY = coordToPixel(nearestNeighbor.y, true);
        ctx.strokeStyle = '#f59e0b'; // Amber-500
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tX, tY);
        ctx.lineTo(nnX, nnY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dashed line
      }
    }

    ctx.setLineDash([]); // Ensure line dashes are reset
    ctx.lineWidth = 1;

  }, [points, targetPoint, nearestNeighbor, treeStructure, drawPartitions]);

  useEffect(() => {
    draw();
  }, [draw]);

  // --- JSX Render ---

  const modeClasses = {
    insert: 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700',
    search: 'bg-blue-600 text-white shadow-md hover:bg-blue-700',
    delete: 'bg-red-600 text-white shadow-md hover:bg-red-700',
    default: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
  };


  return (
    <>
      <div className="bg-white shadow-2xl border-t-4 border-emerald-600 flex flex-col justify-center rounded-xl p-6 md:p-8 h-auto w-[88vw]">

        {/* Header */}
        <h2 className="text-2xl  font-bold text-gray-800 mb-4 flex items-center">
          <Network className="w-6 h-6 mr-3 text-emerald-600" />
          KD-Tree Visualization & Interaction
        </h2>
        <p className="text-gray-500 mb-6 border-b pb-4">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>

            The visualization now shows **space partitions** and supports **point deletion**.

          </ReactMarkdown>
        </p>

        {/* Control Panel and Canvas Container */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left Panel: Canvas and Controls */}
          <div className="w-[55%]">
            <div className="flex flex-wrap gap-2 items-center mb-4">

              <button
                onClick={() => handleModeChange('insert')}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'insert' ? modeClasses.insert : modeClasses.default}`}
                disabled={isPending}
              >
                <Map className="w-4 h-4 mr-2" />
                Insert Mode
              </button>
              <button
                onClick={() => handleModeChange('search')}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'search' ? modeClasses.search : modeClasses.default}`}
                disabled={isPending}
              >
                <Search className="w-4 h-4 mr-2" />
                Search Mode
              </button>
              <button
                onClick={() => handleModeChange('delete')}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'delete' ? modeClasses.delete : modeClasses.default}`}
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Mode
              </button>

              <button
                onClick={async () => {
                  start();
                  await useApi('/delete_all', 'DELETE'); // ← calls Flask delete_all endpoint
                  await fetchData();                     // ← reloads cleared tree
                  stop();
                }}
                className="ml-auto flex cursor-pointer items-center text-sm px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isPending}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh Data
              </button>
            </div>

            {/* Canvas */}
            <div className="relative h-1/2 w-full border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onClick={handleCanvasClick}
                className={`bg-gray-50 transition-cursor ${mode === 'insert' ? 'cursor-crosshair' :
                  mode === 'search' ? 'cursor-crosshair' :
                    'cursor-pointer'
                  }`}
                disabled={isPending}
              ></canvas>
              {showOverlay && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-white text-lg font-semibold flex items-center">
                    <Zap className="w-6 h-6 animate-spin mr-2" />
                    Processing on Flask Server...
                  </div>
                </div>
              )}
              <div className="absolute top-1 left-1 bg-white bg-opacity-90 p-1 text-xs text-gray-600 rounded-br-lg shadow-sm">
                Coordinates: (x,y)
              </div>
            </div>

            {/* Status/Results */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-inner">

              {apiError && (
                <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  <strong>API Error:</strong> {apiError}
                </div>
              )}
              <p className="text-sm font-semibold text-gray-700">
                Total Points: <span className="text-emerald-600">{points.length}</span>
              </p>
              {mode === 'search' && targetPoint && (
                <div className="mt-2 text-sm font-medium">
                  <p className="text-blue-600">Query Target: ({targetPoint.x}, {targetPoint.y})</p>
                  {nearestNeighbor ? (
                    <p className="text-red-600 mt-1">
                      Nearest Neighbor Found: ({nearestNeighbor.x}, {nearestNeighbor.y})
                    </p>
                  ) : (
                    <p className="text-orange-500 mt-1">Searching...</p>
                  )}
                </div>
              )}
              {points.length > 0 && (
                <p className="text-xs text-gray-400 mt-2 truncate">
                  Current Action: {mode === 'insert' ? 'Click to add point.' : mode === 'search' ? 'Click to find nearest neighbor.' : 'Click near a point to delete it.'}
                </p>
              )}
            </div>
          </div>

          {/* Right Panel: Documentation Tabs */}
          <div style={{ width: '80%' }} className="md:w-1/2">
            <div className="bg-gray-50 p-5 min-w-[500px] max-w-1/2 rounded-lg border border-gray-200 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">KD-Tree Concepts</h2>


              <div className="flex mb-4 border-b border-gray-300">
                <button
                  className={`flex-1 cursor-pointer py-2 text-sm font-medium transition-colors ${activeTab === 'legend' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('legend')}
                ><Layers className="w-4 h-4 inline mr-1" /> Partitions</button>
                <button
                  className={`flex-1 cursor-pointer py-2 text-sm font-medium transition-colors ${activeTab === 'delete' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('delete')}
                ><Trash2 className="w-4 h-4 inline mr-1" /> Deletion</button>
              </div>


              <div className="text-sm text-gray-700 space-y-3">
                {activeTab === 'legend' && (
                  <>
                    <h3 className="font-bold text-base text-gray-800">Space Partitioning</h3>

                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {`The visualization now shows the **splitting hyperplanes** used by the tree:`}
                    </ReactMarkdown>

                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><span className="font-semibold text-red-600">Red Dashed Lines</span>: X-dimension splits (Vertical).</li>
                      <li><span className="font-semibold text-blue-600">Blue Dashed Lines</span>: Y-dimension splits (Horizontal).</li>
                    </ul>
                    <p className="pt-2">Each line represents a node, dividing the remaining space into two child regions. This partitioning is the foundation of the KD-Tree's search efficiency.</p>
                  </>
                )}

                {activeTab === 'delete' && (
                  <>
                    <h3 className="font-bold text-base text-gray-800">Point Deletion</h3>
                    <p>
                      KD-Tree deletion is a slightly more complex operation to maintain the tree structure correctly:
                    </p>
                    <ol className="list-decimal space-y-1">
                      <li>The target node is located.</li>
                      <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`If the node is not a leaf, it is replaced by the node with the minimum value in the splitting dimension from its **right subtree**.`}</ReactMarkdown></li>
                      <li>The replacement process is recursive. If a right subtree doesn't exist, the replacement is found in the left subtree, and a complex re-linking operation occurs to preserve the tree properties.</li>
                    </ol>
                    <p className="mt-3 bg-red-100 p-2 rounded-md border border-red-200">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {`In **Delete Mode**, click near a point (within ~10 pixels) to find and remove the corresponding data entry from the tree via the API.`}</ReactMarkdown>
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Binary Tree Representation */}
            {treeStructure && (
              <div className="w-1/2 mt-3">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Binary Tree Representation
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  This diagram shows the binary (hierarchical) representation of the same KD-tree.
                </p>
                <div
                  className="border rounded-lg shadow-md bg-white overflow-x-auto p-4"
                  style={{ height: "400px", overflowY: "auto" }}
                >
                  <svg
                    width="1000"
                    height="1000"
                    viewBox="0 0 1000 1000"
                    className="mx-auto"
                  >
                    {(() => {
                      const nodes = [];
                      const links = [];

                      // Recursive traversal to compute node positions
                      const traverse = (node, depth, x, xStep, yStep = 70) => {
                        if (!node) return;

                        const y = (depth + 1) * yStep;
                        nodes.push({ x, y, label: `(${node.point[0]}, ${node.point[1]})` });

                        if (node.left) {
                          const childX = x - xStep / 4;
                          links.push({ x1: x, y1: y, x2: childX, y2: (depth + 2) * yStep });
                          traverse(node.left, depth + 1, childX, xStep, yStep);
                        }

                        if (node.right) {
                          const childX = x + xStep / 4;
                          links.push({ x1: x, y1: y, x2: childX, y2: (depth + 2) * yStep });
                          traverse(node.right, depth + 1, childX, xStep / 2, yStep);
                        }
                      };

                      traverse(treeStructure, 0, 350, 400);

                      return (
                        <>
                          {/* Links */}
                          {links.map((l, i) => (
                            <line
                              key={i}
                              x1={l.x1}
                              y1={l.y1}
                              x2={l.x2}
                              y2={l.y2}
                              stroke="#9ca3af"
                              strokeWidth="2"
                            />
                          ))}
                          {/* Nodes */}
                          {nodes.map((n, i) => (
                            <g key={i}>
                              <circle
                                cx={n.x}
                                cy={n.y}
                                r="18"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={n.x}
                                y={n.y + 4}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="600"
                                fill="white"
                                fontFamily="Inter, sans-serif"
                              >
                                {n.label}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KdTreeViewer;
