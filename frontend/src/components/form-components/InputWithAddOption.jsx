import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const InputWithAddOption = ({
  onRoomsChange,
  placeholder = 'Add or select rooms...',
  value,
  className, // Destructure className
  classNamePrefix, // Destructure classNamePrefix
}) => {
  const [inputs, setInputs] = useState(value || []);

  useEffect(() => {
    setInputs(value || []);
  }, [value]);

  const handleCreateInput = (inputValue) => {
    if (!inputValue.trim()) return;
    
    const newInput = { label: inputValue, value: inputValue };
    const updatedInputs = [...inputs, newInput];
    setInputs(updatedInputs);
    onRoomsChange?.(updatedInputs);
  };

  const handleChange = (selected) => {
    const updatedInputs = selected || [];
    setInputs(updatedInputs);
    onRoomsChange?.(updatedInputs);
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
        isClearable
        isSearchable
        // Pass props to CreatableSelect
        className={className}
        classNamePrefix={classNamePrefix}
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
  ),
  className: PropTypes.string, // Add className prop type
  classNamePrefix: PropTypes.string, // Add classNamePrefix prop type
};

export default InputWithAddOption;