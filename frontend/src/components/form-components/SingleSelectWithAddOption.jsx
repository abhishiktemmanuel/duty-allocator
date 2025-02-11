import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";

const SingleSelectWithAddOption = ({
  label,
  options = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = "Select or create an option...",
  error,
  value = null
}) => {
  const handleCreateOption = async (inputValue) => {
    if (onOptionCreate) {
      try {
        const createdOption = await onOptionCreate({ label: inputValue });
        onSelectionChange(createdOption);
      } catch (error) {
        console.error("Option creation failed:", error);
      }
    }
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
          value={value}
          onChange={(option) => onSelectionChange(option || null)}
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