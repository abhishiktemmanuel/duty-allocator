import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const MultiSelectWithAddOption = ({
  options: initialOptions = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = 'Select or create options...',
  value
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOptions, setSelectedOptions] = useState(value || []);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Add this useEffect to sync with external value prop
  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  const handleCreateOption = async (inputValue) => {
    if (onOptionCreate) {
      const createdOption = await onOptionCreate({ label: inputValue });
      setOptions((prev) => [...prev, createdOption]);
      const newSelectedOptions = [...selectedOptions, createdOption];
      setSelectedOptions(newSelectedOptions);
      if (onSelectionChange) onSelectionChange(newSelectedOptions);
    }
  };

  const handleChange = (selected) => {
    const newSelected = selected || [];
    setSelectedOptions(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  return (
    <div className="">
      <CreatableSelect
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
        className="text-gray-800 text-left indent-2"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '20rem',
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': { borderColor: '#3b82f6' },
          }),
        }}
        isClearable={true}
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
