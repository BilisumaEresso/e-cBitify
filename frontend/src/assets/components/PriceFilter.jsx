// src/components/PriceFilter.jsx
import { useState } from "react";
import { DollarSign } from "lucide-react";

const PriceFilter = ({ onChange }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleApply = () => {
    onChange(minPrice, maxPrice);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    onChange("", "");
  };

  const priceRanges = [
    { label: "Under $25", min: 0, max: 25 },
    { label: "$25 to $50", min: 25, max: 50 },
    { label: "$50 to $100", min: 50, max: 100 },
    { label: "$100 to $200", min: 100, max: 200 },
    { label: "Over $200", min: 200, max: 1000 },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Price Ranges */}
      <div className="grid grid-cols-2 gap-2">
        {priceRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => {
              setMinPrice(range.min);
              setMaxPrice(range.max);
              onChange(range.min, range.max);
            }}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Price Range */}
      <div className="pt-4 border-t">
        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium">Custom Range</span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            min="0"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            min="0"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
