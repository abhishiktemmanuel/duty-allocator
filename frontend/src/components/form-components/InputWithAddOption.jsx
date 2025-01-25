import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const InputWithAddOption = ({
  onInputsChange, // Callback to notify parent about input changes
  placeholder = "Add or select inputs...", // Customizable placeholder
}) => {
  const [inputs, setInputs] = useState([]); // Local state for inputs

  // Handle adding a new input
  const handleCreateInput = (inputValue) => {
    const newInput = { label: inputValue, value: inputValue };
    setInputs((prevInputs) => [...prevInputs, newInput]);

    // Notify parent about the updated inputs
    if (onInputsChange) {
      onInputsChange([...inputs, newInput]);
    }
  };

  // Handle selection changes
  const handleChange = (selected) => {
    setInputs(selected || []); // Update local state with selected inputs

    // Notify parent about the updated inputs
    if (onInputsChange) {
      onInputsChange(selected || []);
    }
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <CreatableSelect
        isMulti
        options={inputs} // Use the current list of inputs as options
        value={inputs}
        onChange={handleChange}
        onCreateOption={handleCreateInput}
        placeholder={placeholder}
      />
    </div>
  );
};

InputWithAddOption.propTypes = {
  onInputsChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default InputWithAddOption;
