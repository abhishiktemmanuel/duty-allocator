import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const InputWithAddOption = ({ onRoomsChange, placeholder = 'Add or select rooms...', value }) => {
  const [inputs, setInputs] = useState(value || []);

  // Add useEffect to sync with external value changes
  useEffect(() => {
    setInputs(value || []);
  }, [value]);

  const handleCreateInput = (inputValue) => {
    if (!inputValue.trim()) return;
    
    try {
      const newInput = { label: inputValue, value: inputValue };
      const updatedInputs = [...inputs, newInput];
      setInputs(updatedInputs);
      if (onRoomsChange) onRoomsChange(updatedInputs);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleChange = (selected) => {
    const updatedInputs = selected || [];
    setInputs(updatedInputs);
    if (onRoomsChange) onRoomsChange(updatedInputs);
  };

  return (
    <div className="w-full">
      <CreatableSelect
        isMulti
        options={inputs}
        value={inputs}
        onChange={handleChange}
        onCreateOption={handleCreateInput}
        placeholder={placeholder}
        className="text-gray-800"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: '0.375rem',
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': { borderColor: '#3b82f6' },
          }),
        }}
        isClearable={true}
        isSearchable={true}
      />
    </div>
  );
};

InputWithAddOption.propTypes = {
  onRoomsChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  )
};

export default InputWithAddOption;

