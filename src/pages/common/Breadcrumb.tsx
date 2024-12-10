import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 mb-4 overflow-auto"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 md:space-x-3 flex-wrap gap-2 justify-start">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            <Link
              to={item.href}
              className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2 truncate"
              style={{ maxWidth: "200px" }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
