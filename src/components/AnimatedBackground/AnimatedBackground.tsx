import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BsLink } from 'react-icons/bs';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MdOutlet } from 'react-icons/md';

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
            opacity: 0.25,
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
      <Link href="/collection/cybercitizens" >
      <div className="absolute top-4 right-4 backdrop-blur-sm bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-black dark:text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/20 dark:border-gray-800/50 transition-all duration-300 flex items-center gap-2 group cursor-pointer">
        <p className="font-medium">Background by CyberCitizens</p>
        <FaExternalLinkAlt className="text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </div>
      </Link>
    </div>
  );
};

export default AnimatedBackground; 