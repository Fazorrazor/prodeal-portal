'use client'; // needs framer-motion for scroll animations
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
};

export function TrustBadges() {
  return (
    <section className="py-16 bg-brand-deep-blue text-white relative z-20 shadow-2xl">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center pt-8 md:pt-0">
            <div className="w-12 h-1 bg-brand-blue mb-6 rounded-full" />
            <h3 className="font-heading font-bold text-xl mb-3">Enterprise Scale</h3>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Equipped to handle high-volume B2B orders across four distinct industrial divisions.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center pt-8 md:pt-0">
            <div className="w-12 h-1 bg-brand-red mb-6 rounded-full" />
            <h3 className="font-heading font-bold text-xl mb-3">Precision Timing</h3>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Strict adherence to delivery deadlines with real-time WhatsApp inquiry routing.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col items-center pt-8 md:pt-0">
            <div className="w-12 h-1 bg-brand-blue mb-6 rounded-full" />
            <h3 className="font-heading font-bold text-xl mb-3">Total Reliability</h3>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              No client login required. Frictionless procurement designed strictly for professionals.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
