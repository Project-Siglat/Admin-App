import React, { useState, useEffect } from 'react';
import Card from './Card.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  verificationType: 'email' | 'phone';
  contactValue: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

const VerificationManagement: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  useEffect(() => {
    // Filter verification requests
    let filtered = verificationRequests.filter(request =>
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactValue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(request => request.verificationType === filterType);
    }

    setFilteredRequests(filtered);
  }, [verificationRequests, searchTerm, filterStatus, filterType]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch verification requests
      // const data = await getVerificationRequests();
      setVerificationRequests([]);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      setVerificationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const openProcessModal = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || '');
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      // TODO: Implement API call to approve verification
      const updatedRequest = {
        ...selectedRequest,
        status: 'approved' as const,
        processedAt: new Date().toISOString(),
        processedBy: 'Current Admin', // Should be actual admin name
        notes
      };
      
      setVerificationRequests(prev => 
        prev.map(r => r.id === selectedRequest.id ? updatedRequest : r)
      );
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      setNotes('');
    } catch (error) {
      console.error('Error approving verification:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      // TODO: Implement API call to reject verification
      const updatedRequest = {
        ...selectedRequest,
        status: 'rejected' as const,
        processedAt: new Date().toISOString(),
        processedBy: 'Current Admin', // Should be actual admin name
        notes
      };
      
      setVerificationRequests(prev => 
        prev.map(r => r.id === selectedRequest.id ? updatedRequest : r)
      );
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? '📧' : '📱';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Search verifications..."
              value={searchTerm}
              onChange={setSearchTerm}
              fullWidth
              placeholder="Search by name, email, or contact"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Verification Requests List */}
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getTypeIcon(request.verificationType)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.verificationType.charAt(0).toUpperCase() + request.verificationType.slice(1)}
                            </div>
                            <div className="text-sm text-gray-500">{request.contactValue}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                        {request.processedBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {request.processedBy}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.requestedAt)}
                        {request.processedAt && (
                          <div className="text-xs text-gray-500">
                            Processed: {formatDate(request.processedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' ? (
                          <Button
                            onClick={() => openProcessModal(request)}
                            variant="outlined"
                            size="small"
                          >
                            Process
                          </Button>
                        ) : (
                          <button
                            onClick={() => openProcessModal(request)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'No verification requests found matching your criteria.'
                    : 'No verification requests available.'}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Process Verification Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRequest.status === 'pending' ? 'Process Verification Request' : 'Verification Details'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">User Information</h4>
                  <div className="mt-1 text-sm text-gray-900">
                    <div><strong>Name:</strong> {selectedRequest.userName}</div>
                    <div><strong>Email:</strong> {selectedRequest.userEmail}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Verification Request</h4>
                  <div className="mt-1 text-sm text-gray-900">
                    <div><strong>Type:</strong> {selectedRequest.verificationType}</div>
                    <div><strong>Contact:</strong> {selectedRequest.contactValue}</div>
                    <div><strong>Requested:</strong> {formatDate(selectedRequest.requestedAt)}</div>
                  </div>
                </div>
                
                {selectedRequest.status !== 'pending' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Processing Information</h4>
                    <div className="mt-1 text-sm text-gray-900">
                      <div><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</div>
                      <div><strong>Processed by:</strong> {selectedRequest.processedBy}</div>
                      <div><strong>Processed at:</strong> {selectedRequest.processedAt && formatDate(selectedRequest.processedAt)}</div>
                    </div>
                  </div>
                )}
                
                <TextField
                  label="Notes"
                  value={notes}
                  onChange={setNotes}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add notes about this verification..."
                  disabled={selectedRequest.status !== 'pending'}
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outlined"
                >
                  {selectedRequest.status === 'pending' ? 'Cancel' : 'Close'}
                </Button>
                
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={handleReject}
                      variant="outlined"
                      color="secondary"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      variant="contained"
                      color="primary"
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationManagement;