import React, { useState } from 'react';
import { X } from 'lucide-react'; 


const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    return {
      landmark: data?.address?.attraction || data?.address?.building || '',
      area: data?.address?.suburb || data?.address?.neighbourhood || data?.address?.city_district || '',
      address: data?.display_name || '',
    };
  } catch (err) {
    console.error('Error fetching location:', err);
    return { landmark: '', area: '', address: '' };
  }
};



const DonationForm = () => {
  const [donorType, setDonorType] = useState('common');
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    landmark: '',
    area: '',
    address: '',
    expiryTime: '',
    photo: null,
  });

  const removeImage = () => {
    setPreview(null);
  };
 

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const locationData = await getAddressFromCoords(latitude, longitude);
      setFormData((prev) => ({
        ...prev,
        landmark: locationData.landmark,
        area: locationData.area,
        address: locationData.address,
      }));
    }, () => {
      alert('Unable to retrieve your location');
    });
  };
  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === 'photo') {
      const file = files[0];
      if (file && file.size > 1024 * 1024) {
        alert('Photo must be less than or equal to 1MB');
        return;
      }
      else{
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
      }
      setFormData({ ...formData, photo: file });
    } else if (name === 'quantity') {
      const isValidNumber = /^\d+(\.\d+)?$/.test(value);
      if (!isValidNumber && value !== '') return;
      setFormData({ ...formData, quantity: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.title.length > 50) {
      alert('Title should not exceed 50 characters.');
      return;
    }

    if (formData.description.length > 200) {
      alert('Description should not exceed 200 characters.');
      return;
    }

    if (formData.photo && formData.photo.size > 1024 * 1024) {
      alert('Photo must be less than or equal to 1MB');
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(formData.quantity)) {
      alert('Quantity must be a valid number in kg.');
      return;
    }

    console.log('Submitting:', { donorType, ...formData });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">List Your Donation</h2>
        <div className="flex gap-4 items-center">
      <label htmlFor="donorType" className="font-medium">Donor Type:</label>
      <select
        id="donorType"
        value={donorType}
        onChange={(e) => setDonorType(e.target.value)}
        className="px-4 py-2 border rounded-md bg-white text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="" disabled>Select type</option>
        <option value="common">Common User</option>
        <option value="hotel">Hotel/Café</option>
      </select>
    </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold">Food Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            maxLength={50}
          />
        </div>

        <div>
          <label className="block font-semibold">Quantity (kg or servings)</label>
          <input
            type="text"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            inputMode="decimal"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            required
            maxLength={200}
          ></textarea>
        </div>

        {donorType === 'common' && (
  <>
    <div className="md:col-span-2">
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="mb-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-all"
      >
        Use Current Location
      </button>
    </div>
    <div className="md:col-span-2">
      <label className="block font-semibold">Full Address</label>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Full Address"
        required
      />
    </div>

    <div>
      <label className="block font-semibold">Landmark</label>
      <input
        type="text"
        name="landmark"
        value={formData.landmark}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="e.g. Near Central Park Gate"
        required
      />
    </div>

    <div>
      <label className="block font-semibold">Area</label>
      <input
        type="text"
        name="area"
        value={formData.area}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="e.g. Andheri West"
        required
      />
    </div>

    
  </>
)}


        <div>
          <label className="block font-semibold">Expiry Time</label>
          <input
            type="datetime-local"
            name="expiryTime"
            value={formData.expiryTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="md:col-span-2">
        <div className="flex items-center justify-center w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          preview
            ? 'bg-cover bg-center bg-no-repeat'
            : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
        } border-gray-300 dark:border-gray-600`}
        style={preview ? { backgroundImage: `url(${preview})` } : {}}
      >
        {!preview && (
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              id="dropzone-file"
              name="photo"
              type="file"
              className="hidden"
              onChange={handleChange}
              accept="image/*"
            />
          </label>
        )}

        {preview && (
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
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
