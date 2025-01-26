import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const InputWithAddOption = ({ onInputsChange, placeholder = 'Add or select inputs...' }) => {
  const [inputs, setInputs] = useState([]);

  const handleCreateInput = (inputValue) => {
    const newInput = { label: inputValue, value: inputValue };
    setInputs((prev) => [...prev, newInput]);
    if (onInputsChange) onInputsChange([...inputs, newInput]);
  };

  const handleChange = (selected) => {
    setInputs(selected || []);
    if (onInputsChange) onInputsChange(selected || []);
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
      />
    </div>
  );
};

InputWithAddOption.propTypes = {
  onInputsChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default InputWithAddOption;
