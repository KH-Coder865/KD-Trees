from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import math

app = Flask(__name__)
# Enable CORS for all routes, allowing the React frontend (running on a different port/origin) to connect
CORS(app)

# -----------------------------
# KD-Tree Node Definition
# -----------------------------
class Node:
    """Represents a node in the KD-Tree."""
    def __init__(self, point, depth=0, left=None, right=None):
        # point is a tuple (x, y)
        self.point = point
        self.left = left
        self.right = right
        self.depth = depth


class KDTree:
    """Manages the KD-Tree structure and operations."""
    def __init__(self, k=2):
        self.root = None
        self.k = k

    # --- Core KD-Tree Operations ---

    def insert(self, root, point, depth=0):
        """Recursively inserts a point into the tree."""
        if root is None:
            return Node(point, depth)

        cd = depth % self.k  # current dimension

        # Comparison logic: If equal, prefer right side for simplicity
        if point[cd] < root.point[cd]:
            root.left = self.insert(root.left, point, depth + 1)
        else:
            root.right = self.insert(root.right, point, depth + 1)

        return root

    def insert_point(self, point):
        """Public method to insert a point."""
        self.root = self.insert(self.root, point)

    def find_min(self, root, d, depth=0):
        """Finds the node with the minimum value in dimension d."""
        if root is None:
            return None

        cd = depth % self.k

        if cd == d:
            # If current dimension matches target dimension d, minimum must be in the left subtree
            if root.left is None:
                return root
            return self.find_min(root.left, d, depth + 1)

        # If dimensions don't match, check all three: root, left, and right
        left_min = self.find_min(root.left, d, depth + 1)
        right_min = self.find_min(root.right, d, depth + 1)

        min_node = root
        for node in [left_min, right_min]:
            # Use index 'd' for comparison, not 'cd'
            if node is not None and node.point[d] < min_node.point[d]:
                min_node = node

        return min_node

    def delete(self, root, point, depth=0):
        """Recursively deletes a point from the tree (using min-of-right-subtree replacement)."""
        if root is None:
            return None

        cd = depth % self.k

        if root.point == point:
            # Case 1: Node has a right child (find replacement from right subtree min)
            if root.right is not None:
                min_node = self.find_min(root.right, cd, depth + 1)
                root.point = min_node.point
                root.right = self.delete(root.right, min_node.point, depth + 1)
            # Case 2: Node has only a left child (find replacement from left, then replace right/left pointers)
            elif root.left is not None:
                # Find replacement from left subtree
                min_node = self.find_min(root.left, cd, depth + 1)
                root.point = min_node.point
                
                # The point must be moved up; effectively replace the current node
                # The original structure of the left subtree is re-rooted to the right pointer, and the left pointer is set to None.
                root.right = root.left 
                root.left = None
                root.right = self.delete(root.right, min_node.point, depth + 1)
            # Case 3: Leaf node
            else:
                return None
            return root

        # Standard traversal for deletion
        # Need to check for equality due to floating point and tuple comparison in Python
        if point == root.point: # Handle duplicate points if they exist in the tree
             # If the point matches, we try the right branch as per insertion rule (if equal, go right)
             root.right = self.delete(root.right, point, depth + 1)
        elif point[cd] < root.point[cd]:
            root.left = self.delete(root.left, point, depth + 1)
        else:
            root.right = self.delete(root.right, point, depth + 1)

        return root
    
    def delete_point(self, point):
        """Public method to delete a point."""
        self.root = self.delete(self.root, point)



    def preorder(self, root, res):
        """Performs a preorder traversal to get all points."""
        if root is not None:
            res.append(root.point)
            self.preorder(root.left, res)
            self.preorder(root.right, res)
        return res

    def get_all_points(self):
        """Returns a list of all points in the tree."""
        return self.preorder(self.root, [])

    # Using squared distance for efficiency in comparisons
    def distance_sq(self, p1, p2):
        """Squared Euclidean distance calculation."""
        return sum((a - b) ** 2 for a, b in zip(p1, p2))

    # Serialization for visualization
    def serialize_node(self, node):
        """Recursively converts the node structure to a dictionary for JSON serialization."""
        if node is None:
            return None
        return {
            # Convert tuple point to list for safer JSON serialization
            "point": list(node.point), 
            "depth": node.depth,
            "left": self.serialize_node(node.left),
            "right": self.serialize_node(node.right)
        }

    def get_tree_structure(self):
        """Returns the full nested structure of the tree."""
        return self.serialize_node(self.root)


    def nearest(self, root, target, depth=0, best_node=None):
        """Recursively finds the nearest neighbor."""
        if root is None:
            return best_node

        # Initialization check for best_node
        if best_node is None:
            best_node = root
        
        cd = depth % self.k
        current_distance_sq = self.distance_sq(target, root.point)
        best_distance_sq = self.distance_sq(target, best_node.point)
        
        # 1. Check current node
        if current_distance_sq < best_distance_sq:
            best_node = root
            best_distance_sq = current_distance_sq # Update the best distance

        # Determine which branch to search first (closer to target)
        if target[cd] < root.point[cd]:
            next_branch = root.left
            opposite_branch = root.right
        else:
            next_branch = root.right
            opposite_branch = root.left
        
        # 2. Search the promising branch
        best_node = self.nearest(next_branch, target, depth + 1, best_node)
        # Re-calculate the best distance after the recursive call
        best_distance_sq = self.distance_sq(target, best_node.point)

        # 3. Pruning check: See if the opposite branch could contain a closer point
        # The distance from the target point to the splitting plane (squared)
        plane_distance_sq = (target[cd] - root.point[cd]) ** 2

        if plane_distance_sq < best_distance_sq:
            # Only search the opposite side if the splitting plane is closer than the current best point
            best_node = self.nearest(opposite_branch, target, depth + 1, best_node)

        return best_node

    def nearest_neighbor(self, target):
        """Public method to find the nearest neighbor."""
        # Check for empty tree first
        if self.root is None:
            return None
        
        node = self.nearest(self.root, target)
        return node.point if node else None


tree = KDTree(k=2)


@app.route('/insert', methods=['POST'])
def insert_point_route():
    """Route to insert a new point."""
    try:
        data = request.get_json()
        # Points must be tuples of floats/integers
        point = tuple(float(x) for x in data['point'])
        tree.insert_point(point)
        return jsonify({"message": f"Inserted point {point}", "current_tree": tree.get_all_points()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/traverse', methods=['GET'])
def traverse_tree_route():
    """Route to get all points in the tree (used for visualization)."""
    try:
        return jsonify({"points": tree.get_all_points()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/structure', methods=['GET'])
def get_tree_structure():
    """Route to get the full tree structure for partition visualization."""
    try:
        structure = tree.get_tree_structure()
        return jsonify({"tree": structure}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete', methods=['POST'])
def delete_point_route():
    """Route to delete a specific point."""
    try:
        data = request.get_json()
        point = tuple(float(x) for x in data['point'])
        
        tree.delete_point(point)
        
        return jsonify({"message": f"Attempted to delete point {point}", "success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/nearest', methods=['POST'])
def nearest_point_route():
    """Route to find the nearest neighbor to a target point."""
    try:
        data = request.get_json()
        target = tuple(float(x) for x in data['target'])
        nearest = tree.nearest_neighbor(target)
        
        # The frontend expects points to be lists or tuples for serialization
        return jsonify({"target": target, "nearest_neighbor": nearest}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/delete_all', methods=['DELETE'])
def delete_all_points():
    """Route to delete all points and reset the KD-Tree."""
    try:
        global tree
        tree = KDTree(k=2)  # Reinitialize
        return jsonify({"message": "All points deleted. KD-Tree reset successfully.", "success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
