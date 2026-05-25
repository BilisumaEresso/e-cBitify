// src/components/CategoryFilter.jsx
import { useState } from "react";
import { ChevronDown, ChevronRight, Tag } from "lucide-react";

const CategoryFilter = ({ categories, selectedCategory, onChange }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
      >
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          <span className="font-medium">Categories</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="max-h-60 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => onChange("")}
              className={`w-full text-left px-3 py-2 rounded mb-1 ${
                !selectedCategory
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>

            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onChange(category._id)}
                className={`w-full text-left px-3 py-2 rounded mb-1 flex items-center ${
                  selectedCategory === category._id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400 mr-3"></span>
                {category.name}
                <span className="ml-auto text-sm text-gray-500">
                  ({category.productCount || 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
