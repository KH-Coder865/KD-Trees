import { Network } from 'lucide-react';
import { Link } from 'react-scroll';



export default function Navbar() {

  return (
    <nav className="bg-black shadow-xl sticky rounded-b-3xl top-0 flex justify-between z-50">
      <div className="p-2 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-200 tracking-tight flex items-center">
          <Network className="w-8 h-8 mr-3 text-blue-400" />
          K - Dimensional Trees
        </h1>
          <p className="text-gray-400 mt-1">A deep dive into spatial partitioning, construction, and search efficiency.</p>
        </div>
        <div className="flex items-center space-x-4 pr-4">
          <Link
        className='cursor-pointer text-gray-200 hover:border-b-3 hover:border-blue-500 transition-all duration-150'
        to="intro"
        smooth={true}
        duration={600}
        offset={-70} // adjust if you have a fixed header
      >
        About the Project
      </Link>
          <Link
        className='cursor-pointer text-gray-200 hover:border-b-3 hover:border-blue-500 transition-all duration-150'
        to="vis"
        smooth={true}
        duration={600}
        offset={-70} // adjust if you have a fixed header
      >
        Visualization
      </Link>
          <Link
        className='cursor-pointer text-gray-200 hover:border-b-3 hover:border-blue-500 transition-all duration-150'
        to="code"
        smooth={true}
        duration={600}
        offset={-70} // adjust if you have a fixed header
      >
        Code Implementation
      </Link>
        <Link
        className='cursor-pointer text-gray-200 hover:border-b-3 hover:border-blue-500 transition-all duration-150'
        to="app"
        smooth={true}
        duration={600}
        offset={-70} // adjust if you have a fixed header
      >
        Application of KD Trees
      </Link>
        </div>
      </nav>
  );
}