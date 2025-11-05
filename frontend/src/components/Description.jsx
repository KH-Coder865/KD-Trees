
import { BarChart2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function Description() {
    const [activeTab, setActiveTab] = useState('mechanism');
    return (
        <>
            <section className="bg-white p-8 mt-3 rounded-xl w-full shadow-lg border-t-4 border-purple-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <BarChart2 className="w-6 h-6 mr-3 text-purple-500" />
                    Project Deep Dive & Theory
                </h2>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    {['mechanism', 'pruning', 'limitations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative py-2 px-4 text-sm font-medium transition-colors duration-300 cursor-pointer
                                ${activeTab === tab ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}
                                after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-purple-600
                                after:transition-all after:duration-300
                                ${activeTab === tab ? 'after:w-full' : 'after:w-0'}
                            `}
                        >
                            {tab === 'mechanism' && 'Construction Mechanism'}
                            {tab === 'pruning' && 'Search & Pruning Logic'}
                            {tab === 'limitations' && 'Performance & Trade-offs'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="text-gray-600 space-y-4">
                    {/* 1. Mechanism Tab */}
                    {activeTab === 'mechanism' && (
                        <div className='space-y-4'>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                The KD-Tree is a specialized **Binary Search Tree (BST)** for $k$-dimensions. The core idea is to recursively partition the space based on coordinate values.
                            </ReactMarkdown>

                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                                <h3 className="font-semibold text-lg text-purple-800 mb-2">Construction: The Median & The Alternating Axis</h3>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Alternating Axis:** At each level (depth), the tree switches the dimension used for splitting ($X \to Y \to X \to Y \dots$). This ensures balance across all axes.</ReactMarkdown></li>
                                    <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Pivot Selection:** The data points are sorted along the current dimension, and the **median** point is chosen as the pivot. This guarantees an approximately balanced tree ($O(\log n)$ height).</ReactMarkdown></li>
                                    <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Boundary:** Each node implicitly defines a smaller, constrained region (a hyper-rectangle) inherited from its parent, which is then split by the node's pivot.</ReactMarkdown></li>
                                </ul>
                            </div>

                            <p><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>Since the construction takes $O(n \log n)$ due to the sorting required to find the median, KD-Trees are best suited for **static** or semi-static datasets where points are added infrequently.</ReactMarkdown></p>
                        </div>
                    )}

                    {/* 2. Pruning Tab */}
                    {activeTab === 'pruning' && (
                        <div className='space-y-4'>
                            <p><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>The **Nearest Neighbor Search (NNS)** algorithm is what makes the KD-Tree powerful, achieving $O(\log n)$ average time complexity for locating the closest point to a query point $Q$.</ReactMarkdown></p>

                            <h3 className="font-semibold text-lg text-gray-800 mb-2">The Pruning Logic (The Efficiency Gain)</h3>
                            <ol className="list-decimal pl-5 space-y-3 text-sm">
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Initial Descent:** The search first traverses down the tree toward the leaf node that would contain the query point $Q$. The closest point found on this path becomes the **Current Best Neighbor**.</ReactMarkdown></li>
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Backtracking and Check:** As the search unwinds (backtracks) up the tree, it calculates the distance from $Q$ to the current node's **splitting plane**.</ReactMarkdown></li>
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**The Prune Condition:** If the distance from $Q$ to the splitting plane is **greater** than the distance to the Current Best Neighbor, the algorithm knows that the other, unsearched side of the tree **cannot possibly contain a closer point**.</ReactMarkdown></li>
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>**Result:** The entire untested subtree is **pruned** (ignored), saving significant computation and achieving the logarithmic speedup.</ReactMarkdown></li>
                            </ol>

                            <p className="text-sm italic text-purple-700 bg-purple-50 p-3 rounded-lg">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>This bounding box check is the "magic." It transforms an $O(n)$ linear scan into a highly efficient spatial search.</ReactMarkdown>
                            </p>
                        </div>
                    )}

                    {/* 3. Limitations Tab */}
                    {activeTab === 'limitations' && (
                        <div className='space-y-4'>
                            <p>While powerful, KD-Trees have specific trade-offs, especially concerning the dimensions of the data.</p>

                            <h3 className="font-semibold text-lg text-gray-800 mb-2">The Curse of Dimensionality</h3>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {`As the number of dimensions ($k$) increases (e.g., $k$ {' > '} 20), the volume of the space grows exponentially, causing all data points to become increasingly distant from each other.`}</ReactMarkdown>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`**Pruning Degradation:** In high dimensions, the splitting hyperplanes become poor differentiators, and the distance from the query point to the plane is often less than the current best distance.`}</ReactMarkdown></li>
                                <li><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{`**Performance Hit:** This means the search loses its ability to prune effectively, forcing the algorithm to check a much larger fraction of the tree. The time complexity approaches $O(n)$ in the worst case.`}</ReactMarkdown></li>
                            </ul>

                            <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">Dynamic Data</h3>
                            <p className="text-sm">
                                KD-Trees are not well-suited for datasets that require frequent insertions and deletions, as maintaining balance during dynamic updates is complex and can degrade performance.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};