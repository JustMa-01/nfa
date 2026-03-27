// PackageCard — reusable card component for travel packages

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Package } from '../firebase/firestoreService';

interface Props {
  pkg: Package;
}

const PackageCard: React.FC<Props> = ({ pkg }) => {
  const heroImage = pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="kinetic-card group cursor-pointer h-full flex flex-col">
      <Link to={`/packages/${pkg.id}`} className="block h-full flex flex-col">
        <div className="aspect-[4/5] overflow-hidden relative">
          <img
            src={heroImage}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-void/40 group-hover:bg-void/10 transition-colors" />
          
          <div className="absolute top-4 left-4 bg-brand-red text-paper px-3 py-1 font-mono text-[10px] uppercase">
            ₹{pkg.price.toLocaleString('en-IN')}
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-50 block mb-1 text-brand-yellow">
              {pkg.category || 'DESTINATION'}
            </span>
            <h3 className="text-4xl font-display leading-none text-paper line-clamp-2">{pkg.title}</h3>
          </div>
        </div>
        
        <div className="p-6 bg-void flex justify-between items-center flex-1 border-t-2 border-paper/10">
          <span className="font-mono text-sm opacity-50">
            {pkg.duration ? pkg.duration : `${pkg.itinerary?.length || 1} DAYS`}
          </span>
          <ArrowRight className="text-brand-yellow group-hover:translate-x-2 transition-transform" />
        </div>
      </Link>
    </div>
  );
};

export default PackageCard;
