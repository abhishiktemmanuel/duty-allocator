const Unauthorized = () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600">You dont have permission to access this page.</p>
        </div>
      </div>
    );
  };
  
  export default Unauthorized;
  