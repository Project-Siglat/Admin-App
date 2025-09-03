import React, { useState, useEffect } from 'react';
import Card from './Card.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';
import { SkeletonTable } from './Skeleton.tsx';
import LoadingOverlay from './LoadingOverlay.tsx';
import { getUserList } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.tsx';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  roleName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roleId: 2, // Default to User role
    sendWelcomeEmail: true
  });

  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Ambulance' },
    { id: 4, name: 'PNP' },
    { id: 5, name: 'BFP' }
  ];

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term and role
    let filtered = users.filter(user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.roleId.toString() === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      const data = await getUserList();
      console.log('Users API response:', data);
      
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setUsers([]);
        return;
      }
      
      // Transform API response if needed - API returns camelCase
      const transformedUsers = data.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        roleName: getRoleName(user.roleId),
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      
      console.log(`Loaded ${transformedUsers.length} users:`, transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(`Failed to load users: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roleId: 2,
      sendWelcomeEmail: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    // Prevent editing the current user
    if (currentUser && user.id === currentUser.id) {
      alert('You cannot edit your own user account. This prevents accidentally locking yourself out of the system.');
      return;
    }
    
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: user.roleId,
      sendWelcomeEmail: false
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = { 
          ...editingUser, 
          ...formData,
          roleName: roles.find(r => r.id === formData.roleId)?.name || 'User'
        };
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          ...formData,
          roleName: roles.find(r => r.id === formData.roleId)?.name || 'User',
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    // Prevent deleting the current user
    if (currentUser && userId === currentUser.id) {
      alert('You cannot delete your own user account. This prevents accidentally locking yourself out of the system.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // TODO: Implement API call to delete user
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    // Prevent changing the current user's role
    if (currentUser && userId === currentUser.id) {
      alert('You cannot change your own role. This prevents accidentally removing your admin privileges.');
      return;
    }
    
    try {
      const newRoleName = roles.find(r => r.id === newRoleId)?.name || 'User';
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, roleId: newRoleId, roleName: newRoleName }
          : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <Button
              onClick={openCreateModal}
              variant="contained"
              color="primary"
            >
              Add User
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Search users..."
              value={searchTerm}
              onChange={setSearchTerm}
              fullWidth
              placeholder="Search by name or email"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        <div className="p-6">
          {loading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.roleId}
                          onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                          disabled={currentUser && user.id === currentUser.id}
                          className={`text-sm border border-gray-300 rounded px-2 py-1 ${
                            currentUser && user.id === currentUser.id 
                              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                              : ''
                          }`}
                          title={currentUser && user.id === currentUser.id ? "You cannot change your own role" : ""}
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isEmailVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Email: {user.isEmailVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <br />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isPhoneVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Phone: {user.isPhoneVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {currentUser && user.id === currentUser.id ? (
                          // Current user - show disabled buttons with tooltip
                          <>
                            <span 
                              className="text-gray-400 cursor-not-allowed"
                              title="You cannot edit your own account"
                            >
                              Edit
                            </span>
                            <span 
                              className="text-gray-400 cursor-not-allowed"
                              title="You cannot delete your own account"
                            >
                              Delete
                            </span>
                            <span className="text-xs text-blue-600 font-medium">(You)</span>
                          </>
                        ) : (
                          // Other users - show normal buttons
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || selectedRole !== 'all' 
                    ? 'No users found matching your criteria.' 
                    : 'No users available.'}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              
              <div className="space-y-4">
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                  required
                  fullWidth
                />
                
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                  required
                  fullWidth
                />
                
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  required
                  fullWidth
                />
                
                <TextField
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                  fullWidth
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {!editingUser && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-gray-700">
                      Send welcome email with setup instructions
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                >
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;