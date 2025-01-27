import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const SingleSelectWithAddOption = ({
  label,
  options: initialOptions = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = "Select or create an option...",
  defaultValue = null,
  error,
  value
}) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOption, setSelectedOption] = useState(value || defaultValue);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  // Add useEffect to sync with external value prop
  useEffect(() => {
    setSelectedOption(value || null);
  }, [value]);

  const handleCreateOption = async (inputValue) => {
    if (onOptionCreate) {
      const createdOption = await onOptionCreate({ label: inputValue });
      setOptions((prev) => [...prev, createdOption]);
      setSelectedOption(createdOption);
      if (onSelectionChange) onSelectionChange(createdOption);
    }
  };

  const handleChange = (option) => {
    const newValue = option || null;
    setSelectedOption(newValue);
    if (onSelectionChange) onSelectionChange(newValue);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="w-full max-w-md mx-auto">
        <CreatableSelect
          options={options}
          value={selectedOption}
          onChange={handleChange}
          onCreateOption={handleCreateOption}
          placeholder={placeholder}
          className="text-gray-800 text-left indent-2"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "20rem",
              borderColor: "#d1d5db",
              boxShadow: "none",
              "&:hover": { borderColor: "#3b82f6" },
            }),
          }}
          isClearable={true}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

SingleSelectWithAddOption.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  onOptionCreate: PropTypes.func,
  onSelectionChange: PropTypes.func,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.object,
  error: PropTypes.object,
  value: PropTypes.object
};

export default SingleSelectWithAddOption;
