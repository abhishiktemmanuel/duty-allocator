import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';
import { useState } from 'react';

const MultiSelectWithAddOption = ({
  options = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = 'Select or create options...',
  value = []
}) => {
  const [tempOptions, setTempOptions] = useState([]);

  const handleCreateOption = async (inputValue) => {
    if (!onOptionCreate) return;

    // Create a temporary option
    const tempOption = {
      label: inputValue,
      value: `temp-${Date.now()}`,
      __isNew__: true
    };

    // Optimistically update the selection
    const newSelection = [...value, tempOption];
    onSelectionChange(newSelection);

    // Add the temporary option to the list
    setTempOptions((prev) => [...prev, tempOption]);

    try {
      // Create the real option on the server
      const createdOption = await onOptionCreate({ label: inputValue });

      // Replace the temporary option with the real one
      const updatedSelection = newSelection.map((opt) =>
        opt.value === tempOption.value ? createdOption : opt
      );
      onSelectionChange(updatedSelection);

      // Remove the temporary option from the list
      setTempOptions((prev) => prev.filter((opt) => opt.value !== tempOption.value));
    } catch (error) {
      // Rollback on error
      const rollbackSelection = newSelection.filter((opt) => opt.value !== tempOption.value);
      onSelectionChange(rollbackSelection);
      setTempOptions((prev) => prev.filter((opt) => opt.value !== tempOption.value));
      console.error("Option creation failed:", error);
    }
  };

  // Combine permanent and temporary options
  const combinedOptions = [...options, ...tempOptions];

  return (
    <div className="">
      <CreatableSelect
        isMulti
        options={combinedOptions}
        value={value}
        onChange={(selected) => onSelectionChange(selected || [])}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
        className="text-gray-800 text-left indent-2"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '20rem',
            borderColor: '#d1d5db',
            backgroundColor: 'white',
            boxShadow: 'none',
            '&:hover': { borderColor: '#3b82f6' },
          }),
        }}
        isClearable
      />
    </div>
  );
};

MultiSelectWithAddOption.propTypes = {
  options: PropTypes.array,
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.array
};

export default MultiSelectWithAddOption;