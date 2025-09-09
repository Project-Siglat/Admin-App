import React, { useState, useEffect } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Button,
  Input,
  Checkbox,
  Badge,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Field,
  Textarea,
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
  MenuItem
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
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { TokenStorage } from '../lib/tokenStorage.js';

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
    backgroundColor: tokens.colorNeutralBackground2
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
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionCell: {
    width: '100px',
    textAlign: 'center'
  },
  nameCell: {
    minWidth: '150px',
    fontWeight: tokens.fontWeightSemibold
  },
  descriptionCell: {
    maxWidth: '250px',
    minWidth: '150px'
  },
  statusCell: {
    width: '120px',
    textAlign: 'center'
  },
  yesNoCell: {
    width: '80px',
    textAlign: 'center'
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
  }
});

interface TypeOfIncident {
  id: string;
  nameOfIncident: string;
  description?: string;
  addedDateTime: string;
  whoAddedItID: string;
  isActive: boolean;
  isBFPTrue: boolean;
  isPNPTrue: boolean;
  createdAt: string;
  updatedAt: string;
}

const TypeOfIncidentManagement: React.FC = () => {
  const styles = useStyles();
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [incidents, setIncidents] = useState<TypeOfIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<TypeOfIncident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<TypeOfIncident | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [formData, setFormData] = useState({
    nameOfIncident: '',
    description: '',
    isActive: true,
    isBFPTrue: false,
    isPNPTrue: false
  });

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      const response = await fetch('http://localhost:5000/api/v1/TypeOfIncident/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        const transformedData = data.map((incident: any) => ({
          id: incident.Id || incident.id,
          nameOfIncident: incident.NameOfIncident || incident.nameOfIncident,
          description: incident.Description || incident.description,
          addedDateTime: incident.AddedDateTime || incident.addedDateTime,
          whoAddedItID: incident.WhoAddedItID || incident.whoAddedItID,
          isActive: incident.IsActive !== undefined ? incident.IsActive : incident.isActive,
          isBFPTrue: incident.isBFPTrue !== undefined ? incident.isBFPTrue : false,
          isPNPTrue: incident.isPNPTrue !== undefined ? incident.isPNPTrue : false,
          createdAt: incident.CreatedAt || incident.createdAt,
          updatedAt: incident.UpdatedAt || incident.updatedAt
        }));
        
        setIncidents(transformedData);
        setFilteredIncidents(transformedData);
      } else {
        showError('Failed to fetch incident types');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      showError('Error fetching incident types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    const filtered = incidents.filter(incident =>
      (incident.nameOfIncident && incident.nameOfIncident.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (incident.description && incident.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredIncidents(filtered);
  }, [searchTerm, incidents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      const url = editingIncident 
        ? `http://localhost:5000/api/v1/TypeOfIncident/${editingIncident.id}`
        : 'http://localhost:5000/api/v1/TypeOfIncident';
      
      const method = editingIncident ? 'PUT' : 'POST';
      
      const payload = editingIncident ? {
        id: editingIncident.id,
        ...formData,
        whoAddedItID: currentUser?.id || ''
      } : {
        ...formData,
        whoAddedItID: currentUser?.id || ''
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchIncidents();
        setIsModalOpen(false);
        resetForm();
        showSuccess(`Incident type ${editingIncident ? 'updated' : 'created'} successfully`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to ${editingIncident ? 'update' : 'create'} incident type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving incident:', error);
      showError(`Error ${editingIncident ? 'updating' : 'creating'} incident type. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (incident: TypeOfIncident) => {
    setEditingIncident(incident);
    setFormData({
      nameOfIncident: incident.nameOfIncident || '',
      description: incident.description || '',
      isActive: incident.isActive === true,
      isBFPTrue: incident.isBFPTrue === true,
      isPNPTrue: incident.isPNPTrue === true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Incident Type',
      message: 'Are you sure you want to deactivate this incident type? It will be marked as inactive.',
      onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:5000/api/v1/TypeOfIncident/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchIncidents();
        showSuccess('Incident type deactivated successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to deactivate incident type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
      showError('Error deactivating incident type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reactivate Incident Type',
      message: 'Are you sure you want to reactivate this incident type?',
      onConfirm: () => performReactivate(id)
    });
  };

  const performReactivate = async (id: string) => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:5000/api/v1/TypeOfIncident/${id}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchIncidents();
        showSuccess('Incident type reactivated successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(`Failed to reactivate incident type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error reactivating incident:', error);
      showError('Error reactivating incident type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nameOfIncident: '',
      description: '',
      isActive: true,
      isBFPTrue: false,
      isPNPTrue: false
    });
    setEditingIncident(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {/* Clean Header */}
        <div className={styles.header}>
          <Text className={styles.title}>Type of Incident Management</Text>
          <Button 
            appearance="primary" 
            icon={<Add20Regular />}
            onClick={openModal}
          >
            Add New Incident Type
          </Button>
        </div>

        {/* Content Card */}
        <Card className={styles.contentCard}>
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
              <Spinner size="medium" label="Loading..." />
            </div>
          )}

          {/* Desktop Table */}
          {!loading && (
            <div className={styles.mobileTable}>
              <div className={styles.tableContainer}>
                <Table arial-label="Incident types table" className={styles.presentableTable}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell className={styles.nameCell}>Name</TableHeaderCell>
                      <TableHeaderCell className={styles.descriptionCell}>Description</TableHeaderCell>
                      <TableHeaderCell className={styles.yesNoCell}>BFP</TableHeaderCell>
                      <TableHeaderCell className={styles.yesNoCell}>PNP</TableHeaderCell>
                      <TableHeaderCell className={styles.statusCell}>Status</TableHeaderCell>
                      <TableHeaderCell className={styles.actionCell}>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className={styles.nameCell}>
                          <TableCellLayout>
                            <Text weight="semibold" size={400}>
                              {incident.nameOfIncident}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.descriptionCell}>
                          <TableCellLayout>
                            <Text 
                              size={400}
                              style={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                display: 'block',
                                width: '100%'
                              }}
                              title={incident.description || 'No description'}
                            >
                              {incident.description || 'No description'}
                            </Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.yesNoCell}>
                          <TableCellLayout>
                            <Badge 
                              appearance="filled"
                              color={incident.isBFPTrue ? 'danger' : 'subtle'}
                              size="large"
                            >
                              {incident.isBFPTrue ? 'Yes' : 'No'}
                            </Badge>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.yesNoCell}>
                          <TableCellLayout>
                            <Badge 
                              appearance="filled"
                              color={incident.isPNPTrue ? 'informative' : 'subtle'}
                              size="large"
                            >
                              {incident.isPNPTrue ? 'Yes' : 'No'}
                            </Badge>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell className={styles.statusCell}>
                          <TableCellLayout>
                            <Badge 
                              appearance="filled"
                              color={incident.isActive ? 'success' : 'severe'}
                              size="large"
                              icon={incident.isActive ? <CheckmarkCircle20Filled /> : <DismissCircle20Filled />}
                            >
                              {incident.isActive ? 'Active' : 'Inactive'}
                            </Badge>
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
                                    onClick={() => handleEdit(incident)}
                                  >
                                    Edit
                                  </MenuItem>
                                  {incident.isActive ? (
                                    <MenuItem 
                                      icon={<Delete20Regular />}
                                      onClick={() => handleDelete(incident.id)}
                                    >
                                      Deactivate
                                    </MenuItem>
                                  ) : (
                                    <MenuItem 
                                      onClick={() => handleReactivate(incident.id)}
                                    >
                                      Reactivate
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </MenuPopover>
                            </Menu>
                          </TableCellLayout>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredIncidents.length === 0 && (
                <div className={styles.emptyState}>
                  <Text>
                    {searchTerm ? 'No incidents found matching your search.' : 'No incident types found.'}
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && (
            <div className={styles.mobileCards}>
              {filteredIncidents.map((incident) => (
                <div key={incident.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardTitle}>
                    <Text weight="semibold" size={500}>{incident.nameOfIncident}</Text>
                  </div>
                  
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Description:</Text>
                      <Text size={400}>{incident.description || 'No description'}</Text>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>BFP:</Text>
                      <Badge 
                        appearance="filled"
                        color={incident.isBFPTrue ? 'danger' : 'subtle'}
                        size="small"
                      >
                        {incident.isBFPTrue ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>PNP:</Text>
                      <Badge 
                        appearance="filled"
                        color={incident.isPNPTrue ? 'informative' : 'subtle'}
                        size="small"
                      >
                        {incident.isPNPTrue ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Status:</Text>
                      <Badge 
                        appearance="filled"
                        color={incident.isActive ? 'success' : 'severe'}
                        icon={incident.isActive ? <CheckmarkCircle20Filled /> : <DismissCircle20Filled />}
                      >
                        {incident.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className={styles.mobileCardRow}>
                      <Text className={styles.mobileCardLabel}>Actions:</Text>
                      <div className={styles.actionButtons}>
                        <Button
                          appearance="secondary"
                          size="medium"
                          icon={<Edit20Regular />}
                          onClick={() => handleEdit(incident)}
                        >
                          Edit
                        </Button>
                        {incident.isActive ? (
                          <Button
                            appearance="secondary"
                            size="medium"
                            icon={<Delete20Regular />}
                            onClick={() => handleDelete(incident.id)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            appearance="primary"
                            size="medium"
                            onClick={() => handleReactivate(incident.id)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredIncidents.length === 0 && (
                <div className={styles.emptyState}>
                  <Text>
                    {searchTerm ? 'No incidents found matching your search.' : 'No incident types found.'}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Clean Modal */}
        <Dialog open={isModalOpen} onOpenChange={(_, data) => setIsModalOpen(data.open)}>
          <DialogSurface>
            <form onSubmit={handleSubmit}>
              <DialogBody>
                <DialogTitle>
                  {editingIncident ? 'Edit Incident Type' : 'Add New Incident Type'}
                </DialogTitle>
                <DialogContent>
                  <Field 
                    label="Incident Name" 
                    required 
                    className={styles.formField}
                  >
                    <Input
                      value={formData.nameOfIncident}
                      onChange={(_, data) => setFormData({ ...formData, nameOfIncident: data.value })}
                      required
                      placeholder="Enter incident type name..."
                    />
                  </Field>
                  
                  <Field 
                    label="Description"
                    className={styles.formField}
                  >
                    <Textarea
                      value={formData.description}
                      onChange={(_, data) => setFormData({ ...formData, description: data.value })}
                      placeholder="Enter description (optional)..."
                      rows={3}
                      resize="vertical"
                    />
                  </Field>

                  <Field className={styles.formField}>
                    <Checkbox
                      label="Active"
                      checked={formData.isActive}
                      onChange={(_, data) => setFormData({ ...formData, isActive: data.checked === true })}
                    />
                  </Field>

                  <Field className={styles.formField}>
                    <Checkbox
                      label="Bureau of Fire Protection (BFP)"
                      checked={formData.isBFPTrue}
                      onChange={(_, data) => setFormData({ ...formData, isBFPTrue: data.checked === true })}
                    />
                  </Field>

                  <Field className={styles.formField}>
                    <Checkbox
                      label="Philippine National Police (PNP)"
                      checked={formData.isPNPTrue}
                      onChange={(_, data) => setFormData({ ...formData, isPNPTrue: data.checked === true })}
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
                    disabled={loading}
                  >
                    {editingIncident ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </DialogBody>
            </form>
          </DialogSurface>
        </Dialog>

        {/* Clean Confirmation */}
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
                  disabled={loading}
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

export default TypeOfIncidentManagement;