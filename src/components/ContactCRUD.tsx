import React, { useState, useEffect } from 'react';
import Card from './Card.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';
import Select from './Select.tsx';
import { getContacts, createContact, updateContact, deleteContact } from '../lib/api.js';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    // Filter contacts based on search term
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [contacts, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c));
      } else {
        // Create new contact - don't include ID, let server generate it
        const newContactData = {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          value: formData.value
        };
        const createdContact = await createContact(newContactData);
        setContacts(prev => [...prev, createdContact]);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    }
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(contactId);
        setContacts(prev => prev.filter(c => c.id !== contactId));
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
            <Button
              onClick={openCreateModal}
              variant="contained"
              color="primary"
            >
              Add Contact
            </Button>
          </div>
          
          <TextField
            label="Search contacts..."
            value={searchTerm}
            onChange={setSearchTerm}
            fullWidth
            placeholder="Search by name, type, value, or description"
          />
        </div>
      </Card>

      {/* Contacts List */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {contact.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {contact.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(contact)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No contacts found matching your search.' : 'No contacts available.'}
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
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              
              <div className="space-y-4">
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  required
                  fullWidth
                  placeholder="Enter contact name"
                />
                
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Brief description of this contact"
                />
                
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(value) => handleInputChange('type', value)}
                  options={contactTypes}
                  required
                  fullWidth
                  placeholder="Select contact type"
                />
                
                <TextField
                  label="Value"
                  value={formData.value}
                  onChange={(value) => handleInputChange('value', value)}
                  required
                  fullWidth
                  placeholder="Enter contact value (phone number, email, etc.)"
                />
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
                  {editingContact ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCRUD;