import { motion } from 'framer-motion';

const CeriaLoader = () => (
  <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50">
    <div className="relative">
      {/* Animated Pulse Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-blue-400/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      />
      {/* Branded Logo with Pulse Effect */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white p-6 rounded-3xl shadow-xl flex items-center justify-center"
      >
        <img src="/logo.png" alt="CERIA Logo" className="w-20 h-20 object-contain" />
      </motion.div>
    </div>
    
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 text-center"
    >
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Memuat CERIA</h2>
      <p className="text-slate-500 mt-2 font-medium">Sistem Monitoring & Evaluasi Cerdas</p>
    </motion.div>
  </div>
);

export default CeriaLoader;
