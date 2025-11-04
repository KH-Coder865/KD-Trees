import './nav.css'

import React from 'react';
import {
  BarChart3,
  GitBranch, 
  Share2, 
  SortAsc, 
  GanttChartSquare 
} from 'lucide-react';

const Logo = () => (
  <img src="vector-illustration-raster-binary-tree-600nw-1715937763.jpg" alt="binary tree" className='w-15'>
  </img>
);

const KpiCard = ({ title, value, icon, change, changeType }) => {
  const IconComponent = icon;
  const isPositive = changeType === 'positive';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <IconComponent className="h-6 w-6 text-gray-400" />
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <div className="mt-1 flex items-center">
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">vs. last run</span>
      </div>
    </div>
  );
};

/**
 * A placeholder for a chart widget.
 */
const ChartWidget = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
      {children || (
        <BarChart3 className="h-16 w-16 text-gray-300" />
      )}
    </div>
  </div>
);


const WebNavbar = () => {
  const navItems = [
    { name: 'Insertion', href: '#', icon: SortAsc },
    { name: 'Deletion', href: '#', icon: GanttChartSquare },
    { name: 'Search', href: '#', icon: GitBranch },
    { name: 'Application', href: '#', icon: Share2 },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Logo />
            <span className="font-bold text-xl ml-2 text-gray-800">
              KD Tree Visualizer
            </span>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <div className="font-sans text-gray-900 bg-gray-100 min-h-screen">
      <WebNavbar />
    </div>
  );
}