
import { Puzzle } from 'lucide-react';
import 'katex/dist/katex.min.css';

export default function Application() {
    return (
        <>
            <section className="bg-white p-8 mt-3 rounded-xl w-full shadow-lg border-t-4 border-orange-500">
                <h2 className="text-2xl border-b border-gray-300 py-2 font-bold text-gray-800 mb-4 flex items-center">
                    <Puzzle className="w-6 h-6 mr-3 text-orange-500" />
                    Applications of KD Trees
                </h2>

                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-semibold text-gray-800">Core Utility: Spatial Indexing and Search</h3>
                    <p className="text-gray-700">
                        KD-Trees excel in search operations within large, static datasets of points (like locations, colors, or features). Its efficiency comes from quickly pruning large sections of the search space.
                    </p>
                    <ul className="space-y-3 pl-5 list-disc text-gray-700">
                        <li>
                            <strong className="text-orange-600">Nearest Neighbor Search:</strong> This is the most common application, used to find the point in a dataset that is closest to a given query point.
                            <span className="block text-sm text-gray-500 ml-4 mt-1">
                                Examples: Recommending the closest physical store or identifying the most similar data point in machine learning (k-Nearest Neighbors).
                            </span>
                        </li>
                        <li>
                            <strong className="text-orange-600">Range Search (Orthogonal Range Query):</strong> Quickly retrieves all points that fall within a specified hyper-rectangle (a box defined by boundaries for each dimension).
                            <span className="block text-sm text-gray-500 ml-4 mt-1">
                                Examples: Identifying all objects within a specific longitude/latitude boundary in a GIS database.
                            </span>
                        </li>
                        <li>
                            <strong className="text-orange-600">K-Nearest Neighbors (k-NN):</strong> Efficiently finds the 𝑘 closest points to a given query point, foundational for many classification and regression algorithms.
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 pt-3">Industry-Specific Applications</h3>
                    <p className="text-gray-700">Due to their speed in handling multi-dimensional data, KD-Trees are vital in several specialized fields:</p>
                    <ul className="space-y-3 pl-5 list-disc text-gray-700">
                        <li>
                            <strong className="text-orange-600">Computer Graphics:</strong> Used in ray tracing to partition 3D space, speeding up rendering and collision detection.
                        </li>
                        <li>
                            <strong className="text-orange-600">Robotics:</strong> Indexing robot configurations to rapidly query the nearest safe or goal configuration for real-time pathfinding.
                        </li>
                        <li>
                            <strong className="text-orange-600">Data Compression:</strong> Used in vector quantization to efficiently find the nearest codeword in a large codebook.
                        </li>
                    </ul>
                </div>
            </section>
        </>
    );
};