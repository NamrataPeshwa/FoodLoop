import React, { useState } from 'react';

const DonationForm = () => {
  const [donorType, setDonorType] = useState('common');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
    expiryTime: '',
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', { donorType, ...formData });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">List Your Donation</h2>
        <div className="flex gap-4 items-center">
          <span className="font-medium">Donor Type:</span>
          <button
            className={`px-4 py-1 rounded-full border ${donorType === 'common' ? 'bg-green-600 text-white' : 'bg-white text-green-600'}`}
            onClick={() => setDonorType('common')}
          >
            Common User
          </button>
          <button
            className={`px-4 py-1 rounded-full border ${donorType === 'hotel' ? 'bg-green-600 text-white' : 'bg-white text-green-600'}`}
            onClick={() => setDonorType('hotel')}
          >
            Hotel/Café
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold">Food Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-semibold">Quantity (kg or servings)</label>
          <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="3" required></textarea>
        </div>

        <div>
          <label className="block font-semibold">Pickup Location (map pin or address)</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-semibold">Expiry Time</label>
          <input type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold">Upload Photo</label>
          <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-all">
            Submit Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
