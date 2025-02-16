import PropTypes from 'prop-types';

const CsvUploadModal = ({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  onImport, 
  csvFile 
}) => {
  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "text/csv") {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "text/csv") {
      onFileSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
        <p className="mt-2 text-sm text-gray-500">
          CSV format: subject,date,shift,rooms,standard (rooms comma-separated)
        </p>
        <div
          className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>Drag and drop a CSV file here, or</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
            id="csvFileInput"
          />
          <label
            htmlFor="csvFileInput"
            className="text-blue-500 cursor-pointer"
          >
            click to select a file
          </label>
        </div>
        {csvFile && (
          <div className="mt-4">
            <p className="text-sm">Selected file: {csvFile.name}</p>
            <button
              onClick={onImport}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
            >
              Import CSV
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

CsvUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  csvFile: PropTypes.object,
};

export default CsvUploadModal;