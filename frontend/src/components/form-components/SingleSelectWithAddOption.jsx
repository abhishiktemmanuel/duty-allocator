import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const SingleSelectWithAddOption = ({
  options: initialOptions = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = "Select or create an option...",
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleCreateOption = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setOptions((prevOptions) => [...prevOptions, newOption]);
    setSelectedOption(newOption);
    if (onOptionCreate) {
      onOptionCreate(newOption);
    }
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    if (onSelectionChange) {
      onSelectionChange(option);
    }
  };

  return (
    <div style={{ width: "400px", margin: "0 auto" }}>
      <CreatableSelect
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
      />
    </div>
  );
};

SingleSelectWithAddOption.propTypes = {
  options: PropTypes.array,
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default SingleSelectWithAddOption;