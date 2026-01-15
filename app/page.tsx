'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  TruckIcon, 
  ChartBarIcon, 
  SparklesIcon,
  BellIcon,
  CurrencyRupeeIcon 
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">Eco</span> Waste Management
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transforming India's urban waste challenges into sustainable solutions through smart technology and community engagement
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/login" className="btn-primary">
                Get Started
              </Link>
              <Link href="#features" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Floating Icons Animation */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: TruckIcon, label: 'Smart Collection', delay: 0 },
              { icon: SparklesIcon, label: 'Composting', delay: 0.2 },
              { icon: MapPinIcon, label: 'GPS Tracking', delay: 0.4 },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item.delay, duration: 0.5 }}
                className="glass-card p-6 text-center animate-float"
              >
                <item.icon className="w-12 h-12 mx-auto text-eco-600 mb-3" />
                <p className="font-semibold text-gray-700">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-center">The Challenge</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Missed Pickups',
                description: 'Unpredictable collection schedules lead to illegal dumping and overflowing bins',
                stat: '30%',
                statLabel: 'of pickups missed',
              },
              {
                title: 'Methane Emissions',
                description: 'Organic waste in landfills releases harmful greenhouse gases',
                stat: '50%',
                statLabel: 'organic waste',
              },
              {
                title: 'No Accountability',
                description: 'Citizens and authorities lack real-time monitoring systems',
                stat: '0',
                statLabel: 'transparency',
              },
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="text-4xl font-bold text-red-500 mb-2">{problem.stat}</div>
                <div className="text-sm text-red-600 mb-4">{problem.statLabel}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-center">Our Solution: Three Pillars</h2>
          
          <div className="space-y-12">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gradient-eco p-4 rounded-2xl">
                  <TruckIcon className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">
                    Pillar 1: Smart Collection & Logistics
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Efficiency on wheels - guaranteeing collection success through technology
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <MapPinIcon className="w-5 h-5 text-eco-600 mt-1 flex-shrink-0" />
                      <span><strong>Real-Time GPS Tracking:</strong> Citizens see vehicle location on their map</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BellIcon className="w-5 h-5 text-eco-600 mt-1 flex-shrink-0" />
                      <span><strong>Predictive Notifications:</strong> Alerts to residents to maximize collection rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChartBarIcon className="w-5 h-5 text-eco-600 mt-1 flex-shrink-0" />
                      <span><strong>Future: IoT Integration:</strong> Fill-level sensors for dynamic route optimization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gradient-earth p-4 rounded-2xl">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">
                    Pillar 2: Resource Recovery & Thrive
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Waste to wealth - turning organic waste into income and reducing methane
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <SparklesIcon className="w-5 h-5 text-earth-600 mt-1 flex-shrink-0" />
                      <span><strong>Methane Mitigation:</strong> Diverting wet waste from landfills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CurrencyRupeeIcon className="w-5 h-5 text-earth-600 mt-1 flex-shrink-0" />
                      <span><strong>Fertilizer Marketplace:</strong> Connect compost producers with buyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChartBarIcon className="w-5 h-5 text-earth-600 mt-1 flex-shrink-0" />
                      <span><strong>Economic Incentive:</strong> Micro-income stream for residents</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-ocean-500 to-ocean-700 p-4 rounded-2xl">
                  <MapPinIcon className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">
                    Pillar 3: Community Monitoring & Accountability
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Citizen guardians - empowering communities to monitor and report
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <MapPinIcon className="w-5 h-5 text-ocean-600 mt-1 flex-shrink-0" />
                      <span><strong>Geo-Tagged Reporting:</strong> Report issues with location-verified photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChartBarIcon className="w-5 h-5 text-ocean-600 mt-1 flex-shrink-0" />
                      <span><strong>Municipal Dashboard:</strong> Instant routing to cleanup crews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <SparklesIcon className="w-5 h-5 text-ocean-600 mt-1 flex-shrink-0" />
                      <span><strong>Eco-Points Rewards:</strong> Gamification for sustained engagement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-eco text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of citizens and municipalities transforming waste management
          </p>
          <Link href="/auth/signup" className="inline-block bg-white text-eco-600 font-bold py-4 px-8 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p>&copy; 2024 Eco Waste Management. Built for a sustainable future. 🌱</p>
      </footer>
    </div>
  );
}
