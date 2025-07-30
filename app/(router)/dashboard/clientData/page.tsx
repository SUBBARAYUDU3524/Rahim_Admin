"use client"
import { useState, useEffect, useMemo } from 'react';
import { collection, deleteDoc, doc, onSnapshot, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { FiEdit2, FiTrash2, FiUser, FiHash, FiPhone, FiX, FiSearch, FiCalendar, FiActivity, FiPackage, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Client {
  id: string;
  clientName: string;
  clientId: string;
  mobileNum: string;
  date: string;
  slNo: number;
  status: 'ACTIVE' | 'INACTIVE';
  stockType: 'DELIVERY' | 'SALES';
  margin: number;
  place: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'slNo'>>({
    clientName: '',
    clientId: '',
    mobileNum: '',
    date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    stockType: 'DELIVERY',
    margin: 0,
    place: 'TIRUPATI'
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
          status: doc.data().status || 'ACTIVE',
          stockType: doc.data().stockType || 'DELIVERY',
          margin: doc.data().margin || 0,
          place: doc.data().place || 'TIRUPATI',
          slNo: snapshot.docs.length - index
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

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.clientName.toLowerCase().includes(term) ||
      client.clientId.toLowerCase().includes(term) ||
      client.mobileNum.includes(term) ||
      client.date.includes(term) ||
      client.place.toLowerCase().includes(term) ||
      client.status.toLowerCase().includes(term) ||
      client.stockType.toLowerCase().includes(term) ||
      client.margin.toString().includes(term)
    );
  }, [clients, searchTerm]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName,
      clientId: client.clientId,
      mobileNum: client.mobileNum,
      date: client.date,
      status: client.status,
      stockType: client.stockType,
      margin: client.margin,
      place: client.place
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientName' || name === 'place' ? value.toUpperCase() : value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Math.min(50, Math.max(0, Number(value))); // Limit between 0-50
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await toast.promise(
        updateDoc(doc(db, 'clients-data', selectedClient.id), {
          ...formData,
          margin: Number(formData.margin)
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === 'ACTIVE') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>ACTIVE</span>;
    }
    return <span className={`${baseClasses} bg-red-100 text-red-800`}>INACTIVE</span>;
  };

  const getStockTypeBadge = (stockType: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (stockType === 'DELIVERY') {
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>DELIVERY</span>;
    }
    return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>SALES</span>;
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiUser className="text-blue-500" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiHash className="text-blue-500" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiPhone className="text-blue-500" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiCalendar className="text-blue-500" />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiActivity className="text-blue-500" />
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiPackage className="text-blue-500" />
                    Stock Type
                  </label>
                  <select
                    name="stockType"
                    value={formData.stockType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  >
                    <option value="DELIVERY">DELIVERY</option>
                    <option value="SALES">SALES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiDollarSign className="text-blue-500" />
                    Client Margin (₹)
                  </label>
                  <input
                    type="number"
                    name="margin"
                    value={formData.margin}
                    onChange={handleNumberChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    Place
                  </label>
                  <select
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  >
                    <option value="TIRUPATI">TIRUPATI</option>
                    <option value="BANGALORE">BANGALORE</option>
                    <option value="CHENNAI">CHENNAI</option>
                    <option value="HYDERABAD">HYDERABAD</option>
                    <option value="OTHER">OTHER</option>
                  </select>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  SL No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-blue-500" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    <span>Client Name</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiHash className="text-blue-500" />
                    <span>Client ID</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiActivity className="text-blue-500" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-blue-500" />
                    <span>Stock Type</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-blue-500" />
                    <span>Margin</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-blue-500" />
                    <span>Place</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.slNo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {client.mobileNum}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-md inline-block">
                        {client.clientId}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStockTypeBadge(client.stockType)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹ {client.margin}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.place}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
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