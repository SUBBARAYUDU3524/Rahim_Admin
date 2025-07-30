"use client"
import { useState } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { FiUser, FiHash, FiPhone, FiSave, FiCalendar, FiMapPin, FiActivity, FiPackage, FiDollarSign } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

interface Client {
  clientName: string;
  clientId: string;
  mobileNum: string;
  date: string;
  place: string;
  status: 'ACTIVE' | 'INACTIVE';
  stockType: 'DELIVERY' | 'SALES';
  margin: number;
}

export default function ClientForm() {
  const [formData, setFormData] = useState<Client>({
    clientName: '',
    clientId: '',
    mobileNum: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    place: 'TIRUPATI',
    status: 'ACTIVE',
    stockType: 'DELIVERY',
    margin: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'clientName' || name === 'place' ? value.toUpperCase() : value 
    }));
  };

const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const numValue = Number(value); // No limit applied
  setFormData(prev => ({ ...prev, [name]: numValue }));
};


  const checkExistingClient = async () => {
    // Check if client ID already exists
    const idQuery = query(collection(db, 'clients-data'), where('clientId', '==', formData.clientId));
    const idSnapshot = await getDocs(idQuery);
    
    // Check if mobile number already exists
    const mobileQuery = query(collection(db, 'clients-data'), where('mobileNum', '==', formData.mobileNum));
    const mobileSnapshot = await getDocs(mobileQuery);

    if (!idSnapshot.empty && !mobileSnapshot.empty) {
      return 'Both client ID and mobile number already exist for another client';
    } else if (!idSnapshot.empty) {
      return 'Client ID already exists for another client';
    } else if (!mobileSnapshot.empty) {
      return 'Mobile number already exists for another client';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.mobileNum)) {
      toast.error('Please enter a valid 10-digit phone number', {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          padding: '16px',
          minWidth: '250px'
        },
        duration: 4000
      });
      return;
    }

    const loadingToast = toast.loading('Checking client information...', {
      style: {
        background: '#f8fafc',
        color: '#0f172a',
        border: '1px solid #e2e8f0',
        padding: '16px',
        minWidth: '250px'
      }
    });
    
    try {
      // Check for existing client
      const existingClientError = await checkExistingClient();
      if (existingClientError) {
        toast.error(existingClientError, {
          icon: '⚠️',
          style: {
            background: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            padding: '16px',
            minWidth: '250px'
          },
          duration: 5000
        });
        return;
      }

      // If no duplicates found, add new client
      await addDoc(collection(db, 'clients-data'), {
        ...formData,
        clientName: formData.clientName.toUpperCase(),
        place: formData.place.toUpperCase(),
        margin: Number(formData.margin) // Ensure margin is stored as number
      });
      
      toast.success('Client added successfully!', {
        icon: '🎉',
        style: {
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          padding: '16px',
          minWidth: '250px'
        },
        duration: 3000
      });
      
      // Reset form (keep some defaults)
      setFormData({ 
        clientName: '', 
        clientId: '', 
        mobileNum: '',
        date: new Date().toISOString().split('T')[0],
        place: 'TIRUPATI',
        status: 'ACTIVE',
        stockType: 'DELIVERY',
        margin: 0
      });
      
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client. Please try again.', {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
          border: '1px solid #fecaca',
          padding: '16px',
          minWidth: '250px'
        },
        duration: 4000
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-full">
            <FiUser className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            Register New Client
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiUser className="text-blue-500" />
                Client Full Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g. JOHN SMITH"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the client's full legal name</p>
            </div>
            
            {/* Client ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiHash className="text-blue-500" />
                Client ID Number
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g. CL-10001"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for the client</p>
            </div>
            
            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiPhone className="text-blue-500" />
                Mobile Phone Number
              </label>
              <input
                type="tel"
                name="mobileNum"
                value={formData.mobileNum}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
                placeholder="e.g. 9876543210 (10 digits only)"
                required
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number without spaces or special characters"
              />
              <p className="text-xs text-gray-500 mt-1">10-digit number without country code</p>
            </div>

            {/* Client Status Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiActivity className="text-blue-500" />
                Client Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900"
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Set client account status</p>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiCalendar className="text-blue-500" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Select the date</p>
            </div>

            {/* Stock Type Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiPackage className="text-blue-500" />
                Stock Type
              </label>
              <select
                name="stockType"
                value={formData.stockType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900"
                required
              >
                <option value="DELIVERY">DELIVERY STOCK</option>
                <option value="SALES">STOCK SALES</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the stock type</p>
            </div>

            {/* Client Margin Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiDollarSign className="text-blue-500" />
                Client Margin (₹)
              </label>
              <input
                type="number"
                name="margin"
                value={formData.margin}
                onChange={handleNumberChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
                placeholder="50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter margin </p>
            </div>

            {/* Place Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiMapPin className="text-blue-500" />
                Place
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900"
                  required
                >
                  <option value="TIRUPATI">TIRUPATI</option>
                  <option value="BANGALORE">BANGALORE</option>
                  <option value="CHENNAI">CHENNAI</option>
                  <option value="HYDERABAD">HYDERABAD</option>
                  <option value="OTHER">OTHER</option>
                </select>
                {formData.place === 'OTHER' && (
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-gray-900 placeholder-gray-400"
                    placeholder="ENTER PLACE NAME"
                    required
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select or enter the place</p>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <FiSave className="text-lg" />
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}