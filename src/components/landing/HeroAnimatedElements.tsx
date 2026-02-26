import { motion } from 'framer-motion';
import { Sparkles, Zap, Star, PenTool } from 'lucide-react';

const floatingIcons = [
  { Icon: Sparkles, color: 'from-violet-500 to-purple-600', delay: 0, x: '5%', y: '15%' },
  { Icon: Zap, color: 'from-yellow-400 to-orange-500', delay: 0.2, x: '85%', y: '20%' },
  { Icon: Star, color: 'from-pink-500 to-rose-500', delay: 0.4, x: '10%', y: '70%' },
  { Icon: PenTool, color: 'from-blue-500 to-cyan-500', delay: 0.6, x: '90%', y: '65%' },
];

const floatingVariants = {
  animate: (i: number) => ({
    y: [0, -20, 0],
    transition: {
      duration: 4 + i * 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.2,
    },
  }),
};

const glowOrbs = [
  { size: 300, x: '20%', y: '30%', color: 'hsl(262, 83%, 58%)', delay: 0 },
  { size: 400, x: '70%', y: '50%', color: 'hsl(213, 100%, 64%)', delay: 1 },
  { size: 250, x: '50%', y: '70%', color: 'hsl(262, 100%, 75%)', delay: 2 },
];

export function HeroAnimatedElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Glow Orbs */}
      {glowOrbs.map((orb, index) => (
        <motion.div
          key={`orb-${index}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, color, delay, x, y }, index) => (
        <motion.div
          key={`icon-${index}`}
          className="absolute hidden md:block"
          style={{ left: x, top: y }}
          custom={index}
          variants={floatingVariants}
          animate="animate"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay, duration: 0.5 }}
        >
          <div
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg backdrop-blur-sm`}
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
          >
            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
