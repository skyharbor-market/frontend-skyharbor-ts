import { motion } from "framer-motion";

interface LoaderProps {
  size?: number;
  className?: string;
}

export const Loader = ({ size = 48, className = "" }: LoaderProps) => (
  <div className={`m-auto relative ${className}`} style={{ width: size, height: size }}>
    <motion.div
      className="absolute inset-0"
      animate={{ rotate: 360 }}
      transition={{ ease: "linear", duration: 2, repeat: Infinity }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 4C12.954 4 4 12.954 4 24H0C0 10.745 10.745 0 24 0V4ZM24 44C35.046 44 44 35.046 44 24H48C48 37.255 37.255 48 24 48V44Z"
          className="fill-gray-900 dark:fill-gray-100"
        />
      </svg>
    </motion.div>
  </div>
);
