import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mergeAccount } from '../../services/backendApi';

export const MergeAccount = () => {
  const [token, setToken] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMerge = async () => {
    try {
      await mergeAccount(token);
      navigate('/dashboard');
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="merge-container">
      <h2>Link Organization Account</h2>
      <input 
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter merge token"
      />
      <button onClick={handleMerge}>Link Account</button>
      
      {user.organizations.length > 0 && (
        <div className="organization-switcher">
          <h3>Your Organizations</h3>
          {user.organizations.map(org => (
            <div key={org.organizationId} onClick={() => {
              localStorage.setItem('currentOrg', org.organizationId);
              navigate('/dashboard');
            }}>
              {org.name} - {org.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};