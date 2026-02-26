import { motion } from 'framer-motion';
import dashboardPreview from '@/assets/dashboard-preview.png';

export function HeroPreview() {
  return (
    <motion.div 
      className="relative drop-shadow-[0_10px_30px_rgba(139,92,246,0.2)] sm:drop-shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Browser Chrome Frame */}
        <div className="bg-muted/80 backdrop-blur-sm rounded-t-lg sm:rounded-t-xl border border-border/50 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 bg-background/50 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
            peakdraft.app/dashboard
          </div>
        </div>
        {/* Browser Content */}
        <div className="bg-background/30 backdrop-blur-sm rounded-b-lg sm:rounded-b-xl border border-t-0 border-border/50 overflow-hidden">
          <motion.img 
            src={dashboardPreview} 
            alt="PeakDraft Dashboard - Create blog posts, social media content, emails and ad copy with AI"
            className="w-full h-auto object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>
      
      {/* Glowing ring around preview */}
      <motion.div
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-primary-glow to-primary opacity-20 blur-xl -z-10"
        animate={{ 
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
