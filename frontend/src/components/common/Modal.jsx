import PropTypes from 'prop-types';

const Modal = ({ title, children, actions, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 p-4 border-t">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-lg ${action.primary ? 
                'bg-blue-600 text-white hover:bg-blue-700' : 
                'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    primary: PropTypes.bool
  })),
  onClose: PropTypes.func.isRequired
};

export default Modal;