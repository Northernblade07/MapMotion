import { useState, useEffect } from "react";

const RouteSelector = ({ options = [], selected, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(selected || 0);

  useEffect(() => {
    setSelectedValue(selected); // Sync with external selected value
  }, [selected]);

  const handleChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedValue(value);
    onSelect(value); // Pass to parent
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white p-3 rounded-xl shadow-md">
      <label className="text-sm font-semibold">Select Route: </label>
      <select
        value={selectedValue}
        onChange={handleChange}
        className="ml-2 border border-gray-300 rounded p-1"
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RouteSelector;

