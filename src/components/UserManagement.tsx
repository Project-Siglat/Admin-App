import React, { useState, useEffect } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Input,
  Badge,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Field,
  Spinner,
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Card,
  Text,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Dropdown,
  Option,
  Checkbox
} from '@fluentui/react-components';
import {
  Add20Regular,
  Search20Regular,
  Edit20Regular,
  Delete20Regular,
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  MoreHorizontal20Regular
} from '@fluentui/react-icons';
import { getUserList } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    maxWidth: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: tokens.spacingVerticalM,
      alignItems: 'stretch'
    }
  },
  title: {
    margin: 0,
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1
  },
  contentCard: {
    boxShadow: tokens.shadow4,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1
  },
  searchSection: {
    padding: tokens.spacingVerticalL,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    alignItems: 'end',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch'
    }
  },
  searchInput: {
    maxWidth: '400px',
    width: '100%'
  },
  filterDropdown: {
    maxWidth: '200px',
    width: '100%'
  },
  tableContainer: {
    overflow: 'auto',
    padding: tokens.spacingVerticalL
  },
  presentableTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    '& .fui-TableRow': {
      minHeight: '56px',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      '&:hover': {
        backgroundColor: tokens.colorNeutralBackground1Hover
      }
    },
    '& .fui-TableCell': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
      fontSize: tokens.fontSizeBase400,
      verticalAlign: 'middle'
    },
    '& .fui-TableHeaderCell': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
      fontSize: tokens.fontSizeBase400,
      fontWeight: tokens.fontWeightSemibold,
      backgroundColor: tokens.colorNeutralBackground3,
      borderBottom: `2px solid ${tokens.colorNeutralStroke2}`
    },
    '& .fui-TableCellLayout': {
      padding: 0,
      display: 'flex',
      alignItems: 'center'
    }
  },
  userInfoCell: {
    minWidth: '200px'
  },
  nameText: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400
  },
  emailText: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300
  },
  phoneText: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300
  },
  genderCell: {
    width: '80px',
    textAlign: 'center'
  },
  roleCell: {
    width: '120px'
  },
  verificationCell: {
    width: '140px',
    minWidth: '140px'
  },
  dateCell: {
    width: '100px',
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2
  },
  actionCell: {
    width: '100px',
    textAlign: 'center'
  },
  verificationBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    '& .verified-checkbox': {
      '--colorCompoundBrandBackground': tokens.colorPaletteGreenBackground3,
      '--colorCompoundBrandBackgroundHover': tokens.colorPaletteGreenBackground3,
      '--colorCompoundBrandBackgroundPressed': tokens.colorPaletteGreenBackground3,
      '--colorNeutralStrokeAccessible': tokens.colorPaletteGreenBorder2
    },
    '& .unverified-checkbox': {
      '--colorCompoundBrandBackground': tokens.colorPaletteRedBackground3,
      '--colorCompoundBrandBackgroundHover': tokens.colorPaletteRedBackground3,
      '--colorCompoundBrandBackgroundPressed': tokens.colorPaletteRedBackground3,
      '--colorNeutralStrokeAccessible': tokens.colorPaletteRedBorder2
    }
  },
  formField: {
    marginBottom: tokens.spacingVerticalS
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacingVerticalL
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3
  },
  // Mobile responsive
  mobileTable: {
    '@media (max-width: 1024px)': {
      display: 'none'
    }
  },
  mobileCards: {
    display: 'none',
    '@media (max-width: 1024px)': {
      display: 'block',
      padding: tokens.spacingVerticalL
    }
  },
  mobileCard: {
    padding: tokens.spacingVerticalXL,
    marginBottom: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow2,
    '&:last-child': {
      marginBottom: 0
    }
  },
  mobileCardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1
  },
  mobileCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  },
  mobileCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0
    }
  },
  mobileCardLabel: {
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase400
  }
});

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  roleId: number;
  roleName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const styles = useStyles();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
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
      const data = await getUserList();
      
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setUsers([]);
        return;
      }
      
      // Transform API response - API returns PascalCase, component expects camelCase
      const transformedUsers = data.map(user => ({
        id: user.Id || user.id,
        firstName: user.FirstName || user.firstName,
        lastName: user.LastName || user.lastName,
        email: user.Email || user.email,
        phoneNumber: user.PhoneNumber || user.phoneNumber,
        gender: user.Gender || user.gender || 'Male',
        roleId: user.RoleId || user.roleId,
        roleName: getRoleName(user.RoleId || user.roleId),
        isEmailVerified: user.IsEmailVerified || user.isEmailVerified,
        isPhoneVerified: user.IsPhoneVerified || user.isPhoneVerified,
        createdAt: user.CreatedAt || user.createdAt,
        lastLogin: user.LastLogin || user.lastLogin
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError(`Failed to load users: ${error.message}`);
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
      gender: 'Male',
      roleId: 2,
      sendWelcomeEmail: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    // Prevent editing the current user
    if (currentUser && user.id === currentUser.id) {
      showError('You cannot edit your own user account. This prevents accidentally locking yourself out of the system.');
      return;
    }
    
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
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
        showSuccess('User updated successfully');
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
        showSuccess('User created successfully');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Error saving user. Please try again.');
    }
  };

  const handleDelete = (userId: string) => {
    // Prevent deleting the current user
    if (currentUser && userId === currentUser.id) {
      showError('You cannot delete your own user account. This prevents accidentally locking yourself out of the system.');
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: () => performDelete(userId)
    });
  };

  const performDelete = async (userId: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    try {
      // TODO: Implement API call to delete user
      setUsers(prev => prev.filter(u => u.id !== userId));
      showSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error deleting user. Please try again.');
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    // Prevent changing the current user's role
    if (currentUser && userId === currentUser.id) {
      showError('You cannot change your own role. This prevents accidentally removing your admin privileges.');
      return;
    }
    
    try {
      const newRoleName = roles.find(r => r.id === newRoleId)?.name || 'User';
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, roleId: newRoleId, roleName: newRoleName }
          : u
      ));
      showSuccess('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      showError('Error updating user role. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {/* Clean Header */}
        <div className={styles.header}>
          <Text className={styles.title}>User Management</Text>
          <Button 
            appearance="primary" 
            icon={<Add20Regular />}
            onClick={openCreateModal}
          >
            Add User
          </Button>
        </div>

        {/* Content Card */}
        <Card className={styles.contentCard}>
          {/* Search Section */}
          <div className={styles.searchSection}>
            <Input
              className={styles.searchInput}
              contentBefore={<Search20Regular />}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(_, data) => setSearchTerm(data.value)}
            />
            
            <Field label="Filter by Role">
              <Dropdown
                className={styles.filterDropdown}
                value={selectedRole === 'all' ? 'All Roles' : roles.find(r => r.id.toString() === selectedRole)?.name || 'All Roles'}
                onSelectionChange={(_, data) => setSelectedRole(data.optionValue || 'all')}
              >
                <Option value="all">All Roles</Option>
                {roles.map(role => (
                  <Option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          </div>

          {/* Loading */}
          {loading && (
            <div className={styles.loadingContainer}>
              <Spinner size="medium" label="Loading users..." />
            </div>
          )}

          {/* Desktop Table */}
          {!loading && (
            <div className={styles.mobileTable}>
              <div className={styles.tableContainer}>
                <Table arial-label="Users table" className={styles.presentableTable}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell className={styles.userInfoCell}>User</TableHeaderCell>
                      <TableHeaderCell className={styles.genderCell}>Gender</TableHeaderCell>
                      <TableHeaderCell className={styles.roleCell}>Role</TableHeaderCell>
                      <TableHeaderCell className={styles.verificationCell}>Verification</TableHeaderCell>
                      <TableHeaderCell className={styles.dateCell}>Created</TableHeaderCell>
                      <TableHeaderCell className={styles.dateCell}>Last Login</TableHeaderCell>
                      <TableHeaderCell className={styles.actionCell}>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className={styles.userInfoCell}>
                          <TableCellLayout>
                            <div>
                              <Text className={styles.nameText}>
                                {user.firstName} {user.lastName}
                                {currentUser && user.id === currentUser.id && (
                                  <Badge appearance="outline" color="informative" size="small" style={{ marginLeft: '8px' }}>
                                    You
                                  </Badge>
                                )}
                              </Text>
                              <div>
                                <Text className={styles.emailText}>{user.email}</Text>
                              </div>
                              <div>
                                <Text className={styles.phoneText}>{user.phoneNumber}</Text>
                              </div>
                            </div>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.genderCell}>
                          <TableCellLayout>
                            <Text size={400}>{user.gender}</Text>
                          </TableCellLayout>
                        </TableCell>
                         <TableCell className={styles.roleCell}>
                           <TableCellLayout>
                             <Badge 
                               appearance="filled" 
                               color="informative"
                               size="medium"
                             >
                               {user.roleName}
                             </Badge>
                           </TableCellLayout>
                         </TableCell>
                        <TableCell className={styles.verificationCell}>
                          <TableCellLayout>
                             <div className={styles.verificationBadges}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <Checkbox
                                   checked={user.isEmailVerified}
                                   disabled
                                   className={user.isEmailVerified ? 'verified-checkbox' : 'unverified-checkbox'}
                                   style={{ pointerEvents: 'none' }}
                                 />
                                 <Text size={300}>Email</Text>
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <Checkbox
                                   checked={user.isPhoneVerified}
                                   disabled
                                   className={user.isPhoneVerified ? 'verified-checkbox' : 'unverified-checkbox'}
                                   style={{ pointerEvents: 'none' }}
                                 />
                                 <Text size={300}>Phone</Text>
                               </div>
                             </div>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.dateCell}>
                          <TableCellLayout>
                            <Text size={300}>
                              {formatDate(user.createdAt)}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.dateCell}>
                          <TableCellLayout>
                            <Text size={300}>
                              {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.actionCell}>
                          <TableCellLayout>
                            {currentUser && user.id === currentUser.id ? (
                              <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                                Protected
                              </Text>
                            ) : (
                              <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                  <Button
                                    appearance="subtle"
                                    icon={<MoreHorizontal20Regular />}
                                    style={{ 
                                      minWidth: '40px', 
                                      height: '32px',
                                      borderRadius: tokens.borderRadiusCircular
                                    }}
                                  />
                                </MenuTrigger>
                                 <MenuPopover>
                                   <MenuList>
                                     <MenuItem 
                                       icon={<Edit20Regular />}
                                       onClick={() => openEditModal(user)}
                                     >
                                       Edit User
                                     </MenuItem>
                                     <MenuItem 
                                       icon={<Delete20Regular />}
                                       onClick={() => handleDelete(user.id)}
                                     >
                                       Delete User
                                     </MenuItem>
                                   </MenuList>
                                 </MenuPopover>
                              </Menu>
                            )}
                          </TableCellLayout>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>
                  <Text>
                    {searchTerm || selectedRole !== 'all' 
                      ? 'No users found matching your criteria.' 
                      : 'No users available.'}
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && (
            <div className={styles.mobileCards}>
              {filteredUsers.map((user) => (
                <div key={user.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardTitle}>
                    <Text weight="semibold" size={500}>
                      {user.firstName} {user.lastName}
                      {currentUser && user.id === currentUser.id && (
                        <Badge appearance="outline" color="informative" size="small" style={{ marginLeft: '8px' }}>
                          You
                        </Badge>
                      )}
                    </Text>
                  </div>
                  
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Email:</Text>
                      <Text size={400}>{user.email}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Phone:</Text>
                      <Text size={400}>{user.phoneNumber}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Gender:</Text>
                      <Text size={400}>{user.gender}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Role:</Text>
                      <Badge appearance="filled" color="informative">
                        {user.roleName}
                      </Badge>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Verification:</Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                        <Badge 
                          appearance="filled"
                          color={user.isEmailVerified ? 'success' : 'severe'}
                          size="small"
                        >
                          Email: {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Badge 
                          appearance="filled"
                          color={user.isPhoneVerified ? 'success' : 'severe'}
                          size="small"
                        >
                          Phone: {user.isPhoneVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Created:</Text>
                      <Text size={400}>{formatDate(user.createdAt)}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Actions:</Text>
                      {currentUser && user.id === currentUser.id ? (
                        <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
                          Protected Account
                        </Text>
                      ) : (
                        <div style={{ display: 'flex', gap: tokens.spacingHorizontalM }}>
                          <Button
                            appearance="secondary"
                            size="medium"
                            icon={<Edit20Regular />}
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            appearance="secondary"
                            size="medium"
                            icon={<Delete20Regular />}
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>
                  <Text>
                    {searchTerm || selectedRole !== 'all' 
                      ? 'No users found matching your criteria.' 
                      : 'No users available.'}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Create/Edit User Modal */}
        <Dialog open={isModalOpen} onOpenChange={(_, data) => setIsModalOpen(data.open)}>
          <DialogSurface>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <DialogBody>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                  <Field 
                    label="First Name" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.firstName}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, firstName: data.value }))}
                      required
                      placeholder="Enter first name..."
                    />
                  </Field>
                  
                  <Field 
                    label="Last Name" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.lastName}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, lastName: data.value }))}
                      required
                      placeholder="Enter last name..."
                    />
                  </Field>
                  
                  <Field 
                    label="Email" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, email: data.value }))}
                      required
                      placeholder="Enter email address..."
                    />
                  </Field>
                  
                  <Field 
                    label="Phone Number" 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.phoneNumber}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, phoneNumber: data.value }))}
                      placeholder="Enter phone number..."
                    />
                  </Field>
                  
                  <Field 
                    label="Gender" 
                    className={styles.formField}
                  >
                    <Dropdown
                      value={formData.gender}
                      onSelectionChange={(_, data) => setFormData(prev => ({ ...prev, gender: data.optionValue || 'Male' }))}
                    >
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                    </Dropdown>
                  </Field>
                  
                  <Field 
                    label="Role" 
                    className={styles.formField}
                  >
                    <Dropdown
                      value={roles.find(r => r.id === formData.roleId)?.name || 'User'}
                      onSelectionChange={(_, data) => {
                        if (data.optionValue) {
                          setFormData(prev => ({ ...prev, roleId: parseInt(data.optionValue!) }));
                        }
                      }}
                    >
                      {roles.map(role => (
                        <Option key={role.id} value={role.id.toString()}>
                          {role.name}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  {!editingUser && (
                    <Field className={styles.formField}>
                      <Checkbox
                        label="Send welcome email with setup instructions"
                        checked={formData.sendWelcomeEmail}
                        onChange={(_, data) => setFormData(prev => ({ ...prev, sendWelcomeEmail: data.checked === true }))}
                      />
                    </Field>
                  )}
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button 
                    type="submit" 
                    appearance="primary"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </DialogBody>
            </form>
          </DialogSurface>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.isOpen} onOpenChange={(_, data) => setConfirmDialog(prev => ({ ...prev, isOpen: data.open }))}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogContent>
                <Text>{confirmDialog.message}</Text>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">Cancel</Button>
                </DialogTrigger>
                <Button 
                  appearance="primary" 
                  onClick={confirmDialog.onConfirm}
                >
                  Confirm
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </FluentProvider>
  );
};

export default UserManagement;