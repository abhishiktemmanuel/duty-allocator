import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileDetails, updateProfile, cancelSubscription } from '../../services/backendApi';
import { useAuth } from '../../context/AuthContext';
import Pricing from '../Pricing';
import { FiEdit3, FiUser, FiMail, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const data = await getProfileDetails();
      setProfile(data.data);
      setName(data.data.profile.name);
      setEmail(data.data.profile.email);
      setPhoneNumber(data.data.profile.phoneNumber);
      setLoading(false);
    } catch (err) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-red-400 flex items-center gap-2">
          <FiAlertCircle className="text-xl" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">
        No profile found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-t-xl p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 rounded-full p-4 h-16 w-16 flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {profile.profile.name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.profile.name}</h1>
              <p className="text-gray-400">{profile.profile.email}</p>
              <p className="text-gray-400 ">{profile.profile.phoneNumber}</p>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiEdit3 className="text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div className="bg-gray-800 p-6 border-b border-gray-700">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

{/* Subscription Details */}
<div className="bg-gray-800 rounded-b-xl p-6">
  <h2 className="text-xl font-bold text-white mb-6">Subscription Details</h2>
  {profile.subscription ? (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            profile.subscription.status === 'active' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-yellow-900 text-yellow-300'
          }`}>
            {profile.subscription.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Plan Details */}
      {profile.subscription.plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            {profile.subscription.plan.validTill && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Valid Till</span>
                <span className="text-white">{profile.subscription.plan.validTill}</span>
              </div>
            )}
            {profile.subscription.plan.daysRemaining != null && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Days Remaining</span>
                <span className="text-indigo-400">{profile.subscription.plan.daysRemaining} days</span>
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mt-1">
                  Your subscription will remain active until the end of the current billing period
                </p>
                <button
                  onClick={handleCancelSubscription}
                  className="underline text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center">
      <p className="text-gray-400 mb-6">No active subscription</p>
      <Pricing 
        profileEmail={profile.profile.email} 
        profilePhone={profile.profile.phoneNumber}
      />
    </div>
  )}
</div>


      </div>
    </div>
  );
};

export default Profile;
