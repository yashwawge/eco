'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, CurrencyRupeeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';

interface CompostListing {
  _id: string;
  seller: { name: string };
  quantity: number;
  pricePerKg: number;
  description: string;
  type: string;
}

export default function CompostingHub() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'learn'>('buy');
  const [listings, setListings] = useState<CompostListing[]>([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const [newListing, setNewListing] = useState({ quantity: '', price: '', description: '', type: 'vermicompost' });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/compost');
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
       alert('Geolocation is needed to list an item.');
       return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const res = await fetch('/api/compost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: session?.user?.id,
            quantity: Number(newListing.quantity),
            pricePerKg: Number(newListing.price),
            description: newListing.description,
            type: newListing.type,
            location: { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude, 
              address: 'Bangalore' // Could reverse geocode here too if needed
            } 
          }),
        });
        if (res.ok) {
          setShowSellModal(false);
          fetchListings();
          alert('Listing created! +100 Eco-Points');
        }
      } catch (error) {
        console.error('Error creating listing:', error);
      }
    }, (err) => {
      alert('Location access denied. Cannot list item.');
    });
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Composting Hub</h1>
          <p className="text-gray-600">Turn waste into wealth. Buy, sell, or learn.</p>
        </div>
        <button 
          onClick={() => setShowSellModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <SparklesIcon className="w-5 h-5" />
          Sell Compost
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {['buy', 'learn'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 px-2 font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-eco-500 text-eco-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'buy' ? 'Marketplace' : 'Learn Composting'}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'buy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="card-hover group">
                <div className="h-32 bg-earth-100 rounded-t-xl flex items-center justify-center mb-4 group-hover:bg-earth-200 transition-colors">
                  <SparklesIcon className="w-12 h-12 text-earth-600" />
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 capitalize">{listing.type.replace('_', ' ')}</h3>
                    <span className="text-sm font-semibold text-eco-600 bg-eco-50 px-2 py-1 rounded-full">
                      ₹{listing.pricePerKg}/kg
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">By {listing.seller.name}</span>
                    <span className="font-medium text-gray-700">{listing.quantity} kg avail</span>
                  </div>
                  <button className="w-full mt-4 btn-secondary py-2 text-sm">
                    Contact Seller
                  </button>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No listings found. Be the first to sell!
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Compost?</h2>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">1</div>
                  <span>Reduces landfill waste by up to 50%</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">2</div>
                  <span>Reduces methane emissions significantly</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">3</div>
                  <span>Creates nutrient-rich soil for your garden</span>
                </li>
              </ul>
            </div>
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Start?</h2>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-gray-100">
                  <h3 className="font-bold text-earth-700 mb-1">1. Choose a Bin</h3>
                  <p className="text-sm text-gray-600">Select a container with good ventilation.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100">
                  <h3 className="font-bold text-earth-700 mb-1">2. Mix Greens & Browns</h3>
                  <p className="text-sm text-gray-600">Kitchen scraps (Greens) + Dry leaves/Paper (Browns).</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100">
                  <h3 className="font-bold text-earth-700 mb-1">3. Aerate & Moisten</h3>
                  <p className="text-sm text-gray-600">Turn the pile weekly and keep it moist like a sponge.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">List Your Compost</h2>
            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="input-field"
                  value={newListing.type}
                  onChange={e => setNewListing({...newListing, type: e.target.value})}
                >
                  <option value="vermicompost">Vermicompost</option>
                  <option value="pot_compost">Pot Compost</option>
                  <option value="dry_leaf">Dry Leaf Compost</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    required
                    value={newListing.quantity}
                    onChange={e => setNewListing({...newListing, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price/kg (₹)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    required
                    value={newListing.price}
                    onChange={e => setNewListing({...newListing, price: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  required
                  value={newListing.description}
                  onChange={e => setNewListing({...newListing, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                >
                  List Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
