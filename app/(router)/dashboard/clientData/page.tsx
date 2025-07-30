"use client"
import { useState, useEffect, useMemo } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { FiEdit2, FiTrash2, FiUser, FiHash, FiPhone, FiPlus, FiX, FiSearch, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Client {
  id: string;
  clientName: string;
  clientId: string;
  mobileNum: string;
  date: string;
  slNo: number;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    clientName: '',
    clientId: '',
    mobileNum: '',
    date: new Date().toISOString().split('T')[0],
    slNo: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'clients-data'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clientsList = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          clientName: doc.data().clientName || '',
          clientId: doc.data().clientId || '',
          mobileNum: doc.data().mobileNum || '',
          date: doc.data().date || new Date().toISOString().split('T')[0],
          slNo: snapshot.docs.length - index // Assign serial number in reverse order
        }));
        setClients(clientsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.clientName.toLowerCase().includes(term) ||
      client.clientId.toLowerCase().includes(term) ||
      client.mobileNum.includes(term) ||
      client.date.includes(term)
    );
  }, [clients, searchTerm]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName,
      clientId: client.clientId,
      mobileNum: client.mobileNum,
      date: client.date,
      slNo: client.slNo
    });
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await toast.promise(
          deleteDoc(doc(db, 'clients-data', id)),
          {
            loading: 'Deleting client...',
            success: 'Client deleted successfully!',
            error: 'Failed to delete client'
          }
        );
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await toast.promise(
        updateDoc(doc(db, 'clients-data', selectedClient.id), {
          clientName: formData.clientName,
          clientId: formData.clientId,
          mobileNum: formData.mobileNum,
          date: formData.date
        }),
        {
          loading: 'Updating client...',
          success: 'Client updated successfully!',
          error: 'Failed to update client'
        }
      );
      setEditMode(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const closeModal = () => {
    setEditMode(false);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Edit Client Modal */}
      {editMode && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Edit Client</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNum"
                    value={formData.mobileNum}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden mt-6 border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FiUser className="text-white" />
                Client Directory
              </h2>
              <p className="text-blue-100 mt-1">
                {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg bg-white bg-opacity-20 text-gray-700 placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-100 hover:text-white transition-colors"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  SL No
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-500" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    <span>Client Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiHash className="text-blue-500" />
                    <span>Client ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-blue-500" />
                    <span>Mobile Number</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FiUser className="text-gray-300 text-4xl mb-3" />
                      <p className="text-lg font-medium text-gray-400">
                        {searchTerm ? 'No matching clients found' : 'No clients found'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? 'Try a different search term' : 'Add your first client to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className={`transition-all duration-150 ${hoveredRow === client.id ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
                    onMouseEnter={() => setHoveredRow(client.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.slNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="text-blue-600" />
                        </div> */}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.clientName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-md inline-block">
                        {client.clientId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.mobileNum}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className={`p-2 rounded-lg transition-all duration-200 ${hoveredRow === client.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-blue-100 hover:text-blue-600'}`}
                          title="Edit client"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${hoveredRow === client.id ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                          title="Delete client"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}