import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Code } from 'lucide-react';

// --- 1. Code Snippets Data (KD-Tree Implementations) ---
const codeSnippets = {
    'c': 
`#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define K 2 // Dimensionality of the space (2D for simplicity)

// A structure to represent a K-dimensional point
typedef struct Point {
    double coords[K];
} Point;

// A structure to represent a KD-Tree node
typedef struct KDNode {
    Point point;
    struct KDNode *left, *right;
    int axis; // The dimension (0 or 1) used for splitting at this node
} KDNode;

// Global variables for the nearest neighbor search (necessary for C implementation structure)
KDNode *best_node = NULL;
double best_dist_sq = INFINITY;

// Function to create a new KD-Tree node
KDNode* newNode(Point p, int axis) {
    KDNode* temp = (KDNode*)malloc(sizeof(KDNode));
    if (temp == NULL) {
        perror("Failed to allocate memory for KDNode");
        exit(EXIT_FAILURE);
    }
    temp->point = p;
    temp->left = temp->right = NULL;
    temp->axis = axis;
    return temp;
}

// Recursive helper function for insertion
KDNode* insertRec(KDNode* root, Point p, int depth) {
    // Current axis is depth modulo K
    int axis = depth % K;

    if (root == NULL) {
        return newNode(p, axis);
    }

    // Compare the new point with the root's point along the current axis
    if (p.coords[axis] < root->point.coords[axis]) {
        root->left = insertRec(root->left, p, depth + 1);
    } else {
        // Points with equal coordinates go to the right subtree
        root->right = insertRec(root->right, p, depth + 1);
    }

    return root;
}

// Public function to insert a point
KDNode* insert(KDNode* root, Point p) {
    return insertRec(root, p, 0);
}

// Calculate the squared Euclidean distance between two points
double distanceSquared(Point p1, Point p2) {
    double dist_sq = 0.0;
    for (int i = 0; i < K; i++) {
        dist_sq += (p1.coords[i] - p2.coords[i]) * (p1.coords[i] - p2.coords[i]);
    }
    return dist_sq;
}

// Recursive helper function for Nearest Neighbor Search
void searchNearestNeighborRec(KDNode* root, Point query_point) {
    if (root == NULL) {
        return;
    }

    // 1. Check the current node
    double current_dist_sq = distanceSquared(root->point, query_point);
    if (current_dist_sq < best_dist_sq) {
        best_dist_sq = current_dist_sq;
        best_node = root;
    }

    // 2. Determine which child subtree to search first
    int axis = root->axis;
    KDNode *near_child, *far_child;

    if (query_point.coords[axis] < root->point.coords[axis]) {
        near_child = root->left;
        far_child = root->right;
    } else {
        near_child = root->right;
        far_child = root->left;
    }

    // Recursively search the near side
    searchNearestNeighborRec(near_child, query_point);

    // 3. Check if the "splitting plane" intersects the current best distance sphere
    double plane_dist = query_point.coords[axis] - root->point.coords[axis];
    double plane_dist_sq = plane_dist * plane_dist;

    // Pruning Step: Only search the far side if a better point *could* exist there
    if (plane_dist_sq < best_dist_sq) {
        searchNearestNeighborRec(far_child, query_point);
    }
}

// Public function to find the nearest neighbor
void searchNearestNeighbor(KDNode* root, Point query_point) {
    // Reset global state for each new search
    best_node = NULL;
    best_dist_sq = INFINITY;

    searchNearestNeighborRec(root, query_point);

    if (best_node) {
        printf("\\nNearest Neighbor to (%.1f, %.1f) is (%.1f, %.1f) with distance %.2f\\n",
               query_point.coords[0], query_point.coords[1],
               best_node->point.coords[0], best_node->point.coords[1],
               sqrt(best_dist_sq));
    } else {
        printf("The tree is empty.\\n");
    }
}

// Example usage
int main() {
    // Dataset of 2D points
    Point points[] = {
        {{3.0, 6.0}}, {{17.0, 15.0}}, {{13.0, 15.0}}, {{6.0, 12.0}},
        {{9.0, 1.0}}, {{2.0, 7.0}}, {{10.0, 19.0}}
    };
    int n = sizeof(points) / sizeof(points[0]);

    KDNode* root = NULL;

    printf("Building KD-Tree with %d points...\\n", n);
    for (int i = 0; i < n; i++) {
        root = insert(root, points[i]);
        printf("Inserted (%.1f, %.1f)\\n", points[i].coords[0], points[i].coords[1]);
    }

    // Search query
    Point query = {{12.0, 16.0}};
    searchNearestNeighbor(root, query); 

    return 0;
}`,
    'python': 
`import math
from typing import List, Tuple

# We'll use K=2 dimensions for this example
K = 2

class KDNode:
    """Represents a node in the KD-Tree."""
    def __init__(self, point: Tuple[float, ...], axis: int):
        self.point: Tuple[float, ...] = point
        self.left: 'KDNode' = None
        self.right: 'KDNode' = None
        self.axis: int = axis # Dimension used to split the space at this node

class KDTree:
    """Represents the KD-Tree data structure."""
    def __init__(self, points: List[Tuple[float, ...]]):
        # Building the tree using a recursive function that ensures balance
        self.root = self._build_tree(points, 0)

    def _build_tree(self, points: List[Tuple[float, ...]], depth: int) -> KDNode:
        """Recursively builds the KD-Tree, ensuring a balanced structure."""
        if not points:
            return None

        # Determine the current axis for splitting
        axis = depth % K

        # 1. Sort points by the current axis and find the median (pivot)
        points.sort(key=lambda x: x[axis])
        median_index = len(points) // 2
        median_point = points[median_index]

        # 2. Create the current node
        node = KDNode(median_point, axis)

        # 3. Recursively build the left and right subtrees
        node.left = self._build_tree(points[:median_index], depth + 1)
        node.right = self._build_tree(points[median_index + 1:], depth + 1)
        
        return node

    @staticmethod
    def _distance_sq(p1: Tuple[float, ...], p2: Tuple[float, ...]) -> float:
        """Calculates the squared Euclidean distance between two points."""
        return sum((a - b) ** 2 for a, b in zip(p1, p2))

    def nearest_neighbor(self, query_point: Tuple[float, ...]) -> Tuple[Tuple[float, ...], float]:
        """Public method to find the nearest neighbor."""
        if not self.root:
            raise ValueError("The KD-Tree is empty.")

        # Initialize best result tracker
        self.best_point = None
        self.best_dist_sq = float('inf')

        self._nn_recursive(self.root, query_point)
        
        return self.best_point, math.sqrt(self.best_dist_sq)

    def _nn_recursive(self, node: KDNode, query_point: Tuple[float, ...]):
        """Recursive helper for Nearest Neighbor Search (NNS)."""
        if node is None:
            return

        # 1. Check the current node's distance
        current_dist_sq = self._distance_sq(node.point, query_point)
        if current_dist_sq < self.best_dist_sq:
            self.best_dist_sq = current_dist_sq
            self.best_point = node.point

        # The axis used for splitting at this node
        axis = node.axis
        
        # Determine the search order (near side first)
        if query_point[axis] < node.point[axis]:
            near_child, far_child = node.left, node.right
        else:
            near_child, far_child = node.right, node.left

        # Recursively search the near side
        self._nn_recursive(near_child, query_point)

        # 2. Pruning Step: Check if the splitting plane intersects the best distance sphere
        distance_to_plane = query_point[axis] - node.point[axis]
        plane_dist_sq = distance_to_plane ** 2

        if plane_dist_sq < self.best_dist_sq:
            self._nn_recursive(far_child, query_point)


# --- Example Usage ---
if __name__ == '__main__':
    data_points = [
        (3.0, 6.0), (17.0, 15.0), (13.0, 15.0), (6.0, 12.0),
        (9.0, 1.0), (2.0, 7.0), (10.0, 19.0)
    ]
    tree = KDTree(data_points)
    query1 = (12.0, 16.0)
    nn1, dist1 = tree.nearest_neighbor(query1)
    # print(f"Query Point: {query1}\\nNearest Neighbor: {nn1}\\nEuclidean Distance: {dist1:.2f}")`,
    'java': 
`import java.util.List;
import java.util.Arrays;

/**
 * A simple implementation of a K-Dimensional Tree (KD-Tree) 
 * for Nearest Neighbor Search.
 */
public class KDTree {
    
    private static final int K = 2;
    private Node root;

    private static class Node {
        double[] point; 
        Node left, right;
        int axis;       

        public Node(double[] point, int axis) {
            this.point = point;
            this.axis = axis;
        }
    }

    // Helper class to hold and update the best result across recursive calls
    private static class BestResult {
        double bestDistSq = Double.MAX_VALUE;
        double[] bestPoint = null;
    }

    public void insert(double[] point) {
        root = insertRec(root, point, 0);
    }

    private Node insertRec(Node node, double[] point, int depth) {
        int axis = depth % K;

        if (node == null) return new Node(point, axis);

        if (point[axis] < node.point[axis]) {
            node.left = insertRec(node.left, point, depth + 1);
        } else {
            node.right = insertRec(node.right, point, depth + 1);
        }
        return node;
    }

    public double[] findNearestNeighbor(double[] queryPoint) {
        BestResult result = new BestResult();
        findNearestNeighborRec(root, queryPoint, result);
        return result.bestPoint;
    }

    private void findNearestNeighborRec(Node node, double[] queryPoint, BestResult result) {
        if (node == null) return;

        // 1. Check the current node's distance
        double currentDistSq = distanceSquared(node.point, queryPoint);
        if (currentDistSq < result.bestDistSq) {
            result.bestDistSq = currentDistSq;
            result.bestPoint = node.point;
        }

        int axis = node.axis;
        Node nearChild, farChild;

        // Determine the search order
        if (queryPoint[axis] < node.point[axis]) {
            nearChild = node.left;
            farChild = node.right;
        } else {
            nearChild = node.right;
            farChild = node.left;
        }

        // Recursively search the near side
        findNearestNeighborRec(nearChild, queryPoint, result);

        // 2. Pruning Step: Check if the splitting plane intersects the best distance sphere
        double distanceToPlane = queryPoint[axis] - node.point[axis];
        double planeDistSq = distanceToPlane * distanceToPlane;

        if (planeDistSq < result.bestDistSq) {
            // Search farChild
            findNearestNeighborRec(farChild, queryPoint, result);
        }
    }

    private double distanceSquared(double[] p1, double[] p2) {
        double distSq = 0.0;
        for (int i = 0; i < K; i++) {
            distSq += Math.pow(p1[i] - p2[i], 2);
        }
        return distSq;
    }
    
    // --- Example Usage ---
    public static void main(String[] args) {
        KDTree tree = new KDTree();
        List<double[]> dataPoints = List.of(
            new double[]{3.0, 6.0}, new double[]{17.0, 15.0}, new double[]{13.0, 15.0}, 
            new double[]{6.0, 12.0}, new double[]{9.0, 1.0}, new double[]{2.0, 7.0}, 
            new double[]{10.0, 19.0}
        );
        for (double[] point : dataPoints) { tree.insert(point); }
        double[] query1 = {12.0, 16.0};
        double[] nn1 = tree.findNearestNeighbor(query1);
        // System.out.println("\\nQuery Point: " + Arrays.toString(query1) + "\\nNearest Neighbor: " + Arrays.toString(nn1));
    }
}`
};

// Map keys to readable tab names
const tabs = {
    c: 'C',
    python: 'Python',
    java: 'Java',
};

// --- 2. Main App Component (code.jsx) ---
const Codes = () => {
    // State for managing the active language tab
    const [activeTab, setActiveTab] = useState('c');
    // State for managing the copy button feedback (0: default, 1: copied, 2: failed)
    const [copyStatus, setCopyStatus] = useState(0); 

    const activeCode = codeSnippets[activeTab];

    // Handles copying the current code snippet to the clipboard
    const handleCopy = () => {
        const codeToCopy = activeCode;

        // Use document.execCommand('copy') for compatibility
        const textArea = document.createElement("textarea");
        textArea.value = codeToCopy;
        // Hide the textarea off-screen
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.select();
        
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Copy failed:', err);
        }
        
        document.body.removeChild(textArea);

        setCopyStatus(success ? 1 : 2); // Set status to 1 (Copied) or 2 (Failed)
        
        // Reset the button after 2 seconds
        setTimeout(() => {
            setCopyStatus(0);
        }, 2000);
    };

    // Determine button appearance based on copy status
    let copyButtonClass = 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800';
    let copyButtonText = 'Copy Code';
    let CopyIcon = Copy;

    if (copyStatus === 1) {
        copyButtonClass = 'bg-green-600 hover:bg-green-700';
        copyButtonText = 'Copied!';
        CopyIcon = Check;
    } else if (copyStatus === 2) {
        copyButtonClass = 'bg-red-600 hover:bg-red-700';
        copyButtonText = 'Failed';
    }


    return (
        <div className="bg-white rounded-2xl border-t-6 border-black w-[88vw] text-gray-100 p-4 sm:p-8 font-sans">
            <div className="w-full">
                <h2 className="text-2xl  font-bold text-gray-800 mb-4 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-black" />
                    Applications of KD Trees
                </h2>
                <p className="text-gray-600 border-b border-gray-300 py-2 mb-8 text-md">
                    View implementations of the KD-Tree (Insertion and Nearest Neighbor Search) across different languages.
                </p>

                {/* Tab Controls */}
                <div className="flex space-x-2 sm:space-x-4 border-b border-gray-700 mb-4">
                    {Object.entries(tabs).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`
                                py-2 px-3 cursor-pointer sm:px-4 text-sm sm:text-base font-semibold transition-all duration-200 ease-in-out rounded-t-lg
                                ${activeTab === key 
                                    ? 'text-blue-400 border-b-4 border-blue-500 bg-gray-800' 
                                    : 'text-gray-600 border-b-4 border-transparent hover:text-blue-300 hover:border-gray-600'
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Code Display Area */}
                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    
                    {/* Header and Copy Button */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-700">
                        <span className="text-sm font-medium text-gray-400 italic">
                            File Type: .{activeTab}
                        </span>
                        <button 
                            onClick={handleCopy}
                            className={`flex items-center cursor-pointer space-x-2 px-3 py-1 text-white text-sm font-semibold rounded-md shadow-lg transition duration-150 ease-in-out ${copyButtonClass}`}
                        >
                            <CopyIcon className="w-4 h-4" />
                            <span>{copyButtonText}</span>
                        </button>
                    </div>
                    
                    {/* Code Block */}
                    <pre className="overflow-auto max-h-[60vh] p-4 sm:p-6 bg-gray-900">
                        <code className="text-gray-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                            {activeCode}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default Codes;