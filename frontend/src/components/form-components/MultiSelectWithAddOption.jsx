import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const MultiSelectWithAddOption = ({
  options: initialOptions = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = 'Select or create options...',
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleCreateOption = async (inputValue) => {
    // Ask the parent to create the subject and return its ID
    if (onOptionCreate) {
      const createdOption = await onOptionCreate({ label: inputValue });
      setOptions((prev) => [...prev, createdOption]);
      setSelectedOptions((prev) => [...prev, createdOption]);
    }
  };

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    if (onSelectionChange) onSelectionChange(selected);
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
