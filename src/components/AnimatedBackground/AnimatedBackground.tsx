import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedBackgroundProps {
  currentTheme: string;
}

const AnimatedBackground = ({ currentTheme }: AnimatedBackgroundProps) => {
  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentTheme}
          initial={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'brightness(1.5)'
          }}
          animate={{ 
            opacity: 0.75,
            scale: 1,
            filter: 'brightness(1)'
          }}
          transition={{ 
            duration: 0.7,
            ease: [0.4, 0, 0.2, 1] // Custom easing function for smooth transition
          }}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${currentTheme === 'dark' ? '/assets/images/cyberdarkmode.gif' : '/assets/images/cyberlightmode.gif'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* <motion.div
          key={`${currentTheme}-overlay`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
          style={{
            background: currentTheme === 'dark' 
              ? 'radial-gradient(circle at center, rgba(79, 70, 229, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          }}
        /> */}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedBackground; 