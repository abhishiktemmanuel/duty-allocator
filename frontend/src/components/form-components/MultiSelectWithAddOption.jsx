import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const MultiSelectWithAddOption = ({
  options: initialOptions = [], // Initial options passed as a prop
  onOptionCreate, // Callback for creating a new option
  onSelectionChange, // Callback for selection change
  placeholder = "Select or create options...", // Customizable placeholder
}) => {
  const [options, setOptions] = useState(initialOptions); // Local state for options
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Synchronize internal options state with props when initialOptions changes
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Handle adding a new option
  const handleCreateOption = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedOptions((prevSelected) => [...prevSelected, newOption]);

    // Trigger the callback to notify parent about the new option
    if (onOptionCreate) {
      onOptionCreate(newOption);
    }
  };

  // Handle selection changes
  const handleChange = (selected) => {
    setSelectedOptions(selected);

    // Trigger the callback to notify parent about the selection change
    if (onSelectionChange) {
      onSelectionChange(selected);
    }
  };

  return (
    <div style={{ width: "400px", margin: "0 auto" }}>
      <CreatableSelect
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
      />
    </div>
  );
};

MultiSelectWithAddOption.propTypes = {
  options: PropTypes.array,
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default MultiSelectWithAddOption;