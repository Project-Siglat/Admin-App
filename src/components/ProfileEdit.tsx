import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getProfile } from '../lib/api.js';
import Card from './Card.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';

interface ProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  dateOfBirth: string;
}

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        gender: data.gender || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setMessage(null); // Clear any existing messages
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      // TODO: Implement profile update API call
      // await updateProfile(profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="First Name"
            value={profile.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            required
            fullWidth
          />

          <TextField
            label="Middle Name"
            value={profile.middleName}
            onChange={(value) => handleInputChange('middleName', value)}
            fullWidth
          />

          <TextField
            label="Last Name"
            value={profile.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            required
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={profile.email}
            onChange={(value) => handleInputChange('email', value)}
            required
            fullWidth
            disabled // Email usually shouldn't be editable
          />

          <TextField
            label="Phone Number"
            value={profile.phoneNumber}
            onChange={(value) => handleInputChange('phoneNumber', value)}
            fullWidth
          />

          <TextField
            label="Gender"
            value={profile.gender}
            onChange={(value) => handleInputChange('gender', value)}
            fullWidth
          />

          <TextField
            label="Date of Birth"
            type="date"
            value={profile.dateOfBirth}
            onChange={(value) => handleInputChange('dateOfBirth', value)}
            fullWidth
          />

          <div className="md:col-span-2">
            <TextField
              label="Address"
              value={profile.address}
              onChange={(value) => handleInputChange('address', value)}
              fullWidth
              multiline
              rows={3}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            onClick={fetchProfile}
            variant="outlined"
            disabled={saving}
          >
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileEdit;