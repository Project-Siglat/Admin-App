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
  Option
} from '@fluentui/react-components';
import {
  Add20Regular,
  Search20Regular,
  Edit20Regular,
  Delete20Regular,
  MoreHorizontal20Regular
} from '@fluentui/react-icons';
import { getContacts, createContact, updateContact, deleteContact } from '../lib/api.js';
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
  nameCell: {
    minWidth: '150px'
  },
  typeCell: {
    width: '100px'
  },
  valueCell: {
    minWidth: '180px'
  },
  descriptionCell: {
    minWidth: '200px'
  },
  actionCell: {
    width: '80px',
    textAlign: 'center'
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
  // Mobile responsive styles
  mobileTable: {
    display: 'block',
    '@media (max-width: 1024px)': {
      display: 'none'
    }
  },
  mobileCards: {
    display: 'none',
    '@media (max-width: 1024px)': {
      display: 'block'
    },
    padding: tokens.spacingVerticalL
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

interface Contact {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

const ContactCRUD: React.FC = () => {
  const styles = useStyles();
  const { showSuccess, showError } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  

  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    value: ''
  });

  const contactTypes = [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'facebook', label: 'Facebook' }
  ];

  const getContactTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phone': return 'informative';
      case 'email': return 'success';
      case 'facebook': return 'important';
      default: return 'subtle';
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    // Filter contacts based on search term with null checks
    const filtered = contacts.filter(contact => {
      if (!contact) return false;
      
      const name = contact.name || '';
      const type = contact.type || '';
      const value = contact.value || '';
      const description = contact.description || '';
      
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             type.toLowerCase().includes(searchTerm.toLowerCase()) ||
             value.toLowerCase().includes(searchTerm.toLowerCase()) ||
             description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredContacts(filtered);

  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      
      const data = await getContacts();

      
      // Handle different API response formats
      let contactsData = [];
      if (Array.isArray(data)) {
        contactsData = data;
      } else if (data && Array.isArray(data.contacts)) {
        contactsData = data.contacts;
      } else if (data && Array.isArray(data.data)) {
        contactsData = data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        contactsData = [];
      }
      
      // Transform and validate contact data
      const transformedContacts = contactsData
        .filter((contact: any) => contact && typeof contact === 'object')
        .map((contact: any, index: number) => ({
          id: contact.id || contact.Id || `contact-${Date.now()}-${index}`,
          name: contact.name || contact.Name || 'Unknown',
          description: contact.description || contact.Description || '',
          type: contact.type || contact.Type || 'phone',
          value: contact.value || contact.Value || '',
          createdAt: contact.createdAt || contact.CreatedAt || new Date().toISOString(),
          updatedAt: contact.updatedAt || contact.UpdatedAt || new Date().toISOString()
        }));
      
      // If no contacts from API, provide sample emergency contacts
      if (transformedContacts.length === 0) {

        const sampleContacts = [
          {
            id: 'sample-1',
            name: 'Emergency Hotline',
            description: 'National Emergency Response',
            type: 'phone',
            value: '911',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-2',
            name: 'Police Station',
            description: 'Local Police Department',
            type: 'phone',
            value: '(555) 123-4567',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-3',
            name: 'Fire Department',
            description: 'Local Fire & Rescue Services',
            type: 'phone',
            value: '(555) 234-5678',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-4',
            name: 'Hospital Emergency',
            description: 'General Hospital Emergency Room',
            type: 'phone',
            value: '(555) 345-6789',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-5',
            name: 'Emergency Coordinator',
            description: 'Emergency Response Coordinator',
            type: 'email',
            value: 'emergency@city.gov',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setContacts(sampleContacts);

      } else {
        setContacts(transformedContacts);

      }
    } catch (error) {
      console.error('Error fetching contacts:', error);

      // On error, still provide sample contacts for demo purposes
      const sampleContacts = [
        {
          id: 'sample-1',
          name: 'Emergency Hotline',
          description: 'National Emergency Response',
          type: 'phone',
          value: '911',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          name: 'Police Station',
          description: 'Local Police Department',
          type: 'phone',
          value: '(555) 123-4567',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-3',
          name: 'Fire Department',
          description: 'Local Fire & Rescue Services',
          type: 'phone',
          value: '(555) 234-5678',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setContacts(sampleContacts);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingContact) {
        // Update existing contact
        const updatedContact = { 
          ...editingContact, 
          ...formData,
          updatedAt: new Date().toISOString()
        };
        await updateContact(updatedContact);
        // Refresh the contacts list to ensure we have the latest data
        await fetchContacts();
        showSuccess('Contact updated successfully');
      } else {
        // Create new contact - generate GUID for ID
        const newContactData = {
          id: crypto.randomUUID(),
          name: formData.name,
          description: formData.description,
          type: formData.type,
          value: formData.value
        };
        await createContact(newContactData);
        
        // Refresh the contacts list to ensure we have the latest data
        await fetchContacts();
        showSuccess('Contact created successfully');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      showError('Error saving contact. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      description: '',
      type: '',
      value: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      description: contact.description,
      type: contact.type,
      value: contact.value
    });
    setIsModalOpen(true);
  };

  const handleDelete = (contactId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      onConfirm: () => performDelete(contactId)
    });
  };

  const performDelete = async (contactId: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    try {
      await deleteContact(contactId);
      // Refresh the contacts list to ensure we have the latest data
      await fetchContacts();
      showSuccess('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Error deleting contact. Please try again.');
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {/* Clean Header */}
        <div className={styles.header}>
          <Text className={styles.title}>Emergency Contacts</Text>
          <Button 
            appearance="primary" 
            icon={<Add20Regular />}
            onClick={openCreateModal}
          >
            Add Contact
          </Button>
        </div>

        {/* Content Card */}
        <Card className={styles.contentCard}>
          {/* Debug Info */}

          
          {/* Search Section */}
          <div className={styles.searchSection}>
            <Input
              className={styles.searchInput}
              contentBefore={<Search20Regular />}
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(_, data) => setSearchTerm(data.value)}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className={styles.loadingContainer}>
              <Spinner size="medium" label="Loading contacts..." />
            </div>
          )}

          {/* Desktop Table */}
          {!loading && (
            <div className={styles.mobileTable}>
              <div className={styles.tableContainer}>
                <Table arial-label="Contacts table" className={styles.presentableTable}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell className={styles.nameCell}>Name</TableHeaderCell>
                      <TableHeaderCell className={styles.typeCell}>Type</TableHeaderCell>
                      <TableHeaderCell className={styles.valueCell}>Value</TableHeaderCell>
                      <TableHeaderCell className={styles.descriptionCell}>Description</TableHeaderCell>
                      <TableHeaderCell className={styles.actionCell}>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact, index) => (
                      <TableRow key={contact.id || `contact-row-${index}`}>
                        <TableCell className={styles.nameCell}>
                          <TableCellLayout>
                            <Text weight="semibold" size={400}>
                              {contact.name || 'Unknown'}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.typeCell}>
                          <TableCellLayout>
                            <Badge 
                              appearance="filled" 
                              color={getContactTypeColor(contact.type || 'phone')}
                              size="medium"
                            >
                              {contact.type || 'phone'}
                            </Badge>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.valueCell}>
                          <TableCellLayout>
                            <Text size={400}>{contact.value || '-'}</Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.descriptionCell}>
                          <TableCellLayout>
                            <Text size={300} style={{ color: tokens.colorNeutralForeground2 }}>
                              {contact.description || '-'}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.actionCell}>
                          <TableCellLayout>
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
                                    onClick={() => openEditModal(contact)}
                                  >
                                    Edit Contact
                                  </MenuItem>
                                  <MenuItem 
                                    icon={<Delete20Regular />}
                                    onClick={() => handleDelete(contact.id)}
                                  >
                                    Delete Contact
                                  </MenuItem>
                                </MenuList>
                              </MenuPopover>
                            </Menu>
                          </TableCellLayout>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredContacts.length === 0 && (
                  <div className={styles.emptyState}>
                    <Text>
                      {searchTerm 
                        ? 'No contacts found matching your search.' 
                        : 'No contacts available.'}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && (
            <div className={styles.mobileCards}>
              {filteredContacts.map((contact, index) => (
                <div key={contact.id || `mobile-contact-${index}`} className={styles.mobileCard}>
                  <div className={styles.mobileCardTitle}>
                    <Text weight="semibold" size={500}>
                      {contact.name || 'Unknown'}
                    </Text>
                  </div>
                  
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Type:</Text>
                      <Badge 
                        appearance="filled" 
                        color={getContactTypeColor(contact.type || 'phone')}
                        size="medium"
                      >
                        {contact.type || 'phone'}
                      </Badge>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Value:</Text>
                      <Text size={400}>{contact.value || '-'}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Description:</Text>
                      <Text size={400} style={{ color: tokens.colorNeutralForeground2 }}>
                        {contact.description || '-'}
                      </Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Actions:</Text>
                      <div style={{ display: 'flex', gap: tokens.spacingHorizontalM }}>
                        <Button
                          appearance="secondary"
                          size="medium"
                          icon={<Edit20Regular />}
                          onClick={() => openEditModal(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          appearance="secondary"
                          size="medium"
                          icon={<Delete20Regular />}
                          onClick={() => handleDelete(contact.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredContacts.length === 0 && (
                <div className={styles.emptyState}>
                  <Text>
                    {searchTerm 
                      ? 'No contacts found matching your search.' 
                      : 'No contacts available.'}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Create/Edit Contact Modal */}
        <Dialog open={isModalOpen} onOpenChange={(_, data) => setIsModalOpen(data.open)}>
          <DialogSurface>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <DialogBody>
                <DialogTitle>
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </DialogTitle>
                <DialogContent>
                  <Field 
                    label="Name" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.name}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, name: data.value }))}
                      required
                      placeholder="Enter contact name..."
                    />
                  </Field>
                  
                  <Field 
                    label="Type" 
                    required 
                    className={styles.formField}
                  >
                    <Dropdown
                      value={contactTypes.find(t => t.value === formData.type)?.label || 'Select type...'}
                      onOptionSelect={(_: any, data: any) => {
                        if (data.optionValue) {
                          setFormData(prev => ({ ...prev, type: data.optionValue! }));
                        }
                      }}
                    >
                      {contactTypes.map(type => (
                        <Option key={type.value} value={type.value}>
                          {type.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>
                  
                  <Field 
                    label="Value" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.value}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, value: data.value }))}
                      required
                      placeholder="Enter contact value (phone, email, etc.)..."
                    />
                  </Field>
                  
                  <Field 
                    label="Description" 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.description}
                      onChange={(_, data) => setFormData(prev => ({ ...prev, description: data.value }))}
                      placeholder="Brief description of this contact..."
                    />
                  </Field>
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button 
                    type="submit" 
                    appearance="primary"
                  >
                    {editingContact ? 'Update' : 'Create'}
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

export default ContactCRUD;