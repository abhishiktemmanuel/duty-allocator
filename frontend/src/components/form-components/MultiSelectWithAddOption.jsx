import CreatableSelect from 'react-select/creatable';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const MultiSelectWithAddOption = ({
  options = [],
  onOptionCreate,
  onSelectionChange,
  placeholder = 'Select or create options...',
  value = []
}) => {
  const [tempOptions, setTempOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOption = async (inputValue) => {
    if (!onOptionCreate) return;
    setIsLoading(true);

    // Create temporary option
    const tempOption = {
      label: inputValue,
      value: `temp-${Date.now()}`,
      __isNew__: true,
      __isPending__: true
    };

    // Optimistically update selection
    const newSelection = [...value, tempOption];
    onSelectionChange(newSelection);
    setTempOptions(prev => [...prev, tempOption]);

    try {
      // Create real option
      const createdOption = await onOptionCreate({ label: inputValue });

      // Replace temporary option
      const updatedSelection = newSelection.map(opt =>
        opt.value === tempOption.value ? createdOption : opt
      );
      onSelectionChange(updatedSelection);
    } catch (error) {
      // Rollback on error
      onSelectionChange(prev => 
        prev.filter(opt => opt.value !== tempOption.value)
      );
      console.error("Creation failed:", error);
    } finally {
      setTempOptions(prev => 
        prev.filter(opt => opt.value !== tempOption.value)
      );
      setIsLoading(false);
    }
  };

  // Combine options
  const combinedOptions = [...options, ...tempOptions];

  return (
    <div className="relative">
      <CreatableSelect
        isMulti
        options={combinedOptions}
        value={value}
        onChange={(selected) => onSelectionChange(selected || [])}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
        className="input-field text-left"
        classNamePrefix="input-field"
        isClearable
        isDisabled={isLoading}
        formatOptionLabel={(option) => (
          <div className="flex items-center gap-2">
            <span>{option.label}</span>
            {option.__isPending__ && (
              <span className="text-gray-500 text-sm">(saving...)</span>
            )}
          </div>
        )}
        styles={{
          control: (base) => ({
            ...base,
            opacity: isLoading ? 0.7 : 1,
          })
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <ClipLoader size={16} color="#4b5563" />
            <span className="text-sm">Saving new item...</span>
          </div>
        </div>
      )}
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