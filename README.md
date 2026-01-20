# Experience the power of KD-Trees:
- **Deployed At:** https://kh-coder865.github.io/KD-Trees/

---

# KD-Trees (k-Dimensional Trees)

A **KD-tree** (short for **k-dimensional tree**) is a space-partitioning data structure used to organize points in a *k*-dimensional space. It is commonly used for efficient **nearest neighbor searches**, **range queries**, and **spatial indexing** in computational geometry, machine learning, and graphics.

---

## What Is a KD-Tree?

A KD-tree is a **binary tree** where each node represents a point in *k*-dimensional space.  
At each level of the tree, the data is split along **one dimension**, cycling through all dimensions as the tree grows.

- Level 0 → split by dimension 0 (e.g., x-axis)
- Level 1 → split by dimension 1 (e.g., y-axis)
- Level 2 → split by dimension 2 (if applicable)
- Repeat cyclically

This recursive partitioning divides the space into nested half-spaces.

---

## Key Operations

### 1. Construction
A KD-tree is usually built by:
1. Choosing a splitting dimension
2. Selecting a median point along that dimension
3. Recursively building left and right subtrees

**Time complexity:**  
- Average: `O(n log n)`
- Worst case (unbalanced): `O(n²)`

---

### 2. Nearest Neighbor Search
KD-trees allow fast queries to find the closest point to a given target.

**Average time:** `O(log n)`  
**Worst case:** `O(n)`

The algorithm prunes large portions of the tree by comparing distances to splitting planes.

---

### 3. Range Search
Find all points within a given region (rectangle, sphere, etc.).

**Efficiency:** Much faster than brute force in low-dimensional spaces.

---

## Advantages

- Efficient for low-dimensional data
- Faster than brute force for spatial queries
- Simple binary tree structure
- Widely used in practice (e.g., k-NN search)

---

## Limitations

- Performance degrades in high dimensions (curse of dimensionality)
- Can become unbalanced if not built carefully
- Worst-case query time is linear

---

## Applications

- Nearest neighbor search (k-NN)
- Computer graphics (ray tracing, collision detection)
- Machine learning
- Robotics and path planning
- Geographic information systems (GIS)

---

## Example (2D Split)



--- 

# To run this on your local machine:

### First Clone the Repository:

 ```bash
  git clone https://github.com/KH-Coder865/KD-Trees.git
  ```

### Run this Command to install Backend requirements:

```bash
pip install -r requirements.txt
```

### Make sure you have node installed on your machine:

- **Windows:-**

```bash
winget install OpenJS.NodeJS.LTS
```
- Or you can go to the official website to install $Node.Js$

- **MacOS:-**

```bash
brew install node
```

### Now do this to run the frontend server:

```bash
cd frontend
```
```bash
npm install
```
```bash
npm run dev
```

### Now to run the backend server:

```bash
cd backend
```
```bash
python app.py
```

**Now the app is ready for your local machine!**
**Enjoy! 😎**
