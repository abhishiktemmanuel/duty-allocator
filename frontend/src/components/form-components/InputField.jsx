import PropTypes from 'prop-types';

const InputField = ({ label, type, register, error, placeholder, className, ...props }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      {...register}
      {...props}
      className={`input-field w-full bg-white border rounded-full border-gray-300 text-gray-800 text-left indent-1
      focus:ring-blue-500 focus:border-blue-500 block px-3  sm:text-base${className}`} 


    />
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
);

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  register: PropTypes.object,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default InputField;