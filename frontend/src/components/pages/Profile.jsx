import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileDetails, updateProfile, cancelSubscription } from '../../services/backendApi';
import { useAuth } from '../../context/AuthContext';
import Pricing from '../Pricing';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const data = await getProfileDetails();
      setProfile(data.data);
      setName(data.data.user.name);
      setEmail(data.data.user.email);
      setLoading(false);
    } catch (error) {
      setError('Error fetching profile details');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      setEditMode(false);
      fetchProfileDetails();
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancelSubscription();
        fetchProfileDetails();
      } catch (err) {
        setError('Error cancelling subscription');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!profile) return <div className="text-center">No profile found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save Changes</button>
                <button type="button" onClick={() => setEditMode(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p><strong>Name:</strong> {profile.user.name}</p>
              <p><strong>Email:</strong> {profile.user.email}</p>
              <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit Profile</button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Subscription Details</h3>
          {profile.subscription ? (
            <div className="space-y-2">
              <p><strong>Plan:</strong> {profile.subscription.type}</p>
              <p><strong>Status:</strong> {profile.subscription.status}</p>
              <p><strong>Start Date:</strong> {new Date(profile.subscription.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(profile.subscription.endDate).toLocaleDateString()}</p>
              <p><strong>Remaining Days:</strong> {profile.subscription.remainingDays}</p>
              <button onClick={handleCancelSubscription} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4">Cancel Subscription</button>
            </div>
          ) : (
            <div>
              <p className="mb-4">No active subscription</p>
              <Pricing />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
