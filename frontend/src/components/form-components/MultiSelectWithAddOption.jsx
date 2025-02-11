import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';

const MultiSelectWithAddOption = ({
  options = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = 'Select or create options...',
  value = []
}) => {
  const handleCreateOption = async (inputValue) => {
    if (onOptionCreate) {
      try {
        const createdOption = await onOptionCreate({ label: inputValue });
        onSelectionChange([...value, createdOption]);
      } catch (error) {
        console.error("Option creation failed:", error);
      }
    }
  };

  return (
    <div className="">
      <CreatableSelect
        isMulti
        options={options}
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