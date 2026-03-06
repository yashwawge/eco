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
        // Reverse geocode to get address
        let address = 'Location detected';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            address = data.display_name.split(',').slice(0, 3).join(',');
          }
        } catch (e) {
          console.error('Geocoding error:', e);
        }

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
              address
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
            className={`pb-3 px-2 font-medium capitalize transition-colors border-b-2 ${activeTab === tab
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
                    <span className="text-gray-500">By {listing.seller?.name || 'Anonymous'}</span>
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
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="glass-card p-8 bg-gradient-to-br from-earth-50 to-eco-50">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Learn Composting</h2>
              <p className="text-lg text-gray-600 mb-4">
                Transform your kitchen waste into nutrient-rich compost and contribute to a sustainable future.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-eco-600">50%</div>
                  <div className="text-sm text-gray-600">Less Landfill Waste</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-earth-600">100%</div>
                  <div className="text-sm text-gray-600">Natural Fertilizer</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ocean-600">Zero</div>
                  <div className="text-sm text-gray-600">Chemical Additives</div>
                </div>
              </div>
            </div>

            {/* Why Compost */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <SparklesIcon className="w-7 h-7 text-eco-600" />
                Why Compost?
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Reduces Landfill Waste</h4>
                      <p className="text-sm text-gray-600">Organic waste makes up 50% of household waste. Composting diverts it from landfills.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Reduces Methane Emissions</h4>
                      <p className="text-sm text-gray-600">Organic waste in landfills produces methane, a potent greenhouse gas. Composting prevents this.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 font-bold shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Creates Nutrient-Rich Soil</h4>
                      <p className="text-sm text-gray-600">Compost improves soil structure, retains moisture, and provides essential nutrients for plants.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-earth-600 font-bold shrink-0">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Saves Money</h4>
                      <p className="text-sm text-gray-600">Reduce spending on chemical fertilizers and waste disposal fees.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-earth-600 font-bold shrink-0">5</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Supports Local Food</h4>
                      <p className="text-sm text-gray-600">Grow healthier vegetables and herbs in your own garden with homemade compost.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-earth-600 font-bold shrink-0">6</div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Earn Eco-Points</h4>
                      <p className="text-sm text-gray-600">Sell your compost on our marketplace and earn rewards!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Step-by-Step Composting Guide</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-eco-500 pl-6 py-2">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">Step 1: Choose Your Bin</h4>
                  <p className="text-gray-600 mb-3">Select a container with good ventilation. Options include:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Plastic compost bin (20-30L for small households)</li>
                    <li>Terracotta pot with drainage holes</li>
                    <li>Wooden crate lined with newspaper</li>
                    <li>Commercial vermicompost bin (with worms)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-eco-500 pl-6 py-2">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">Step 2: Layer Your Materials</h4>
                  <p className="text-gray-600 mb-3">Create layers of "Greens" and "Browns" in a 1:3 ratio:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">🟢 Greens (Nitrogen-rich)</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Fruit & vegetable peels</li>
                        <li>• Coffee grounds & tea bags</li>
                        <li>• Fresh grass clippings</li>
                        <li>• Plant trimmings</li>
                      </ul>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-amber-800 mb-2">🟤 Browns (Carbon-rich)</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Dry leaves</li>
                        <li>• Shredded newspaper</li>
                        <li>• Cardboard pieces</li>
                        <li>• Sawdust</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-eco-500 pl-6 py-2">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">Step 3: Maintain Moisture & Aeration</h4>
                  <p className="text-gray-600 mb-2">Keep your compost healthy:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Moisture: Like a wrung-out sponge (not too wet, not too dry)</li>
                    <li>Turn/mix the pile every 3-4 days for oxygen</li>
                    <li>Add water if too dry, add browns if too wet</li>
                    <li>Cover to prevent pests and excess rain</li>
                  </ul>
                </div>

                <div className="border-l-4 border-eco-500 pl-6 py-2">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">Step 4: Wait & Harvest</h4>
                  <p className="text-gray-600 mb-2">Timeline and signs of readiness:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Hot composting: 3-4 weeks</li>
                    <li>Cold composting: 3-6 months</li>
                    <li>Vermicomposting: 2-3 months</li>
                    <li>Ready when: Dark brown, crumbly, earthy smell</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-green-800 mb-4">✅ Do Compost</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Fruit and vegetable scraps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Eggshells (crushed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Coffee grounds and filters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Tea bags (remove staples)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Dry leaves and grass clippings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Shredded paper and cardboard</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-800 mb-4">❌ Don't Compost</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Meat, fish, or bones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Dairy products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Oils and fats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Diseased plants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Pet waste</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Glossy/coated paper</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Common Issues & Solutions</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-gray-800 mb-2">😷 Bad Smell?</h4>
                  <p className="text-sm text-gray-600"><strong>Cause:</strong> Too wet or too many greens</p>
                  <p className="text-sm text-gray-600"><strong>Solution:</strong> Add dry browns (leaves, paper), turn more frequently</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">🐛 Pests or Flies?</h4>
                  <p className="text-sm text-gray-600"><strong>Cause:</strong> Exposed food scraps</p>
                  <p className="text-sm text-gray-600"><strong>Solution:</strong> Bury scraps under browns, keep bin covered</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">🐌 Too Slow?</h4>
                  <p className="text-sm text-gray-600"><strong>Cause:</strong> Too dry, too cold, or not enough greens</p>
                  <p className="text-sm text-gray-600"><strong>Solution:</strong> Add water, add greens, turn more often, move to warmer spot</p>
                </div>
              </div>
            </div>

            {/* Video Resources */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📺 Video Tutorials</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.youtube.com/results?search_query=home+composting+for+beginners" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-gray-200 rounded-lg hover:border-eco-500 transition-colors">
                  <div className="font-semibold text-gray-800 mb-1">Composting for Beginners</div>
                  <div className="text-sm text-gray-600">Step-by-step video guide</div>
                </a>
                <a href="https://www.youtube.com/results?search_query=vermicomposting+at+home" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-gray-200 rounded-lg hover:border-eco-500 transition-colors">
                  <div className="font-semibold text-gray-800 mb-1">Vermicomposting Setup</div>
                  <div className="text-sm text-gray-600">Using worms for faster composting</div>
                </a>
                <a href="https://www.youtube.com/results?search_query=balcony+composting" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-gray-200 rounded-lg hover:border-eco-500 transition-colors">
                  <div className="font-semibent text-gray-800 mb-1">Balcony Composting</div>
                  <div className="text-sm text-gray-600">Perfect for apartment living</div>
                </a>
                <a href="https://www.youtube.com/results?search_query=troubleshooting+compost+problems" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-gray-200 rounded-lg hover:border-eco-500 transition-colors">
                  <div className="font-semibold text-gray-800 mb-1">Troubleshooting Guide</div>
                  <div className="text-sm text-gray-600">Fix common composting issues</div>
                </a>
              </div>
            </div>

            {/* Call to Action */}
            <div className="glass-card p-8 bg-gradient-eco text-white text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to Start Composting?</h3>
              <p className="mb-6 opacity-90">Join thousands of citizens making a difference. Start composting today!</p>
              <button
                onClick={() => setActiveTab('buy')}
                className="bg-white text-eco-600 font-bold py-3 px-8 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Browse Marketplace
              </button>
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
                  onChange={e => setNewListing({ ...newListing, type: e.target.value })}
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
                    onChange={e => setNewListing({ ...newListing, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price/kg (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    required
                    value={newListing.price}
                    onChange={e => setNewListing({ ...newListing, price: e.target.value })}
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
                  onChange={e => setNewListing({ ...newListing, description: e.target.value })}
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
