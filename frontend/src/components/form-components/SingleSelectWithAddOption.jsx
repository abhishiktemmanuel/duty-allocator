import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";
import { useState } from 'react';

const SingleSelectWithAddOption = ({
  label,
  options = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = "Select or create an option...",
  error,
  value = null
}) => {
  const [tempOptions, setTempOptions] = useState([]);

  const handleCreateOption = async (inputValue) => {
    if (!onOptionCreate) return;

    // Create temporary option
    const tempOption = {
      label: inputValue,
      value: `temp-${Date.now()}`,
      __isNew__: true
    };

    // Optimistically update local state
    setTempOptions(prev => [...prev, tempOption]);
    onSelectionChange(tempOption);

    try {
      // Create real option
      const createdOption = await onOptionCreate({ label: inputValue });
      
      // Update selection with real option
      onSelectionChange(createdOption);
      
      // Remove temporary option
      setTempOptions(prev => prev.filter(opt => opt.value !== tempOption.value));
    } catch (error) {
      // Rollback on error
      setTempOptions(prev => prev.filter(opt => opt.value !== tempOption.value));
      onSelectionChange(null);
      console.error("Option creation failed:", error);
    }
  };

  // Combine permanent and temporary options
  const combinedOptions = [...options, ...tempOptions];

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="w-full  mx-auto">
      <CreatableSelect
          options={combinedOptions}
          value={value}
          onChange={(option) => onSelectionChange(option || null)}
          onCreateOption={handleCreateOption}
          placeholder={placeholder}
          className="input-field text-left "
          classNamePrefix="input-field" // Add this line
          isClearable
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

SingleSelectWithAddOption.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array,
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.object,
  value: PropTypes.object
};

export default SingleSelectWithAddOption;