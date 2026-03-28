import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Package } from '../firebase/firestoreService';

interface Props { pkg: Package; }

const PackageCard: React.FC<Props> = ({ pkg }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden border-4 border-brand-yellow bg-void group h-550px transition-transform duration-500 hover:-translate-y-2"
    >
      <Link to={`/packages/${pkg.id}`} className="block h-full">
        <img 
          src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'} 
          alt={pkg.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/20 to-transparent p-8 flex flex-col justify-end">
          <div className="border-l-4 border-brand-yellow pl-4 mb-6">
            <span className="text-[10px] font-mono font-bold text-brand-yellow tracking-widest block mb-2">
              {pkg.category || 'DESTINATION'}
            </span>
            <h3 className="text-4xl font-display font-black text-paper leading-none uppercase">
              {pkg.title}
            </h3>
          </div>
          
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-mono opacity-60 max-w-180px uppercase tracking-tighter">
              {pkg.duration || 'EXPEDITION_READY'}
            </p>
            <div className="text-right">
              <span className="text-[10px] font-mono opacity-40 block uppercase">STARTING AT</span>
              <span className="text-2xl font-display font-black text-brand-yellow">₹{pkg.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 p-4">
          <div className="w-12 h-12 bg-brand-red flex items-center justify-center border-2 border-brand-yellow">
            <ArrowRight className="text-paper group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PackageCard;