import { Network } from 'lucide-react';
import { Link } from 'react-scroll';



export default function Navbar() {

    const navlinks = [
        "Description",
        "2D Tree Visualization",
    ]
  return (
    <nav className="bg-gray-50 shadow-xl sticky top-0 flex justify-between z-50">
      <div className="p-2 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight flex items-center">
          <Network className="w-8 h-8 mr-3 text-blue-400" />
          Interactive KD-Tree Project
        </h1>
          <p className="text-gray-400 mt-1">A deep dive into spatial partitioning, construction, and search efficiency.</p>
        </div>
        <div className="flex items-center space-x-4 pr-4">
          <Link
        className='cursor-pointer'
        to="intro"
        smooth={true}
        duration={600}
        offset={-70} // adjust if you have a fixed header
      >
        Description
      </Link>
        </div>
      </nav>
  );
}