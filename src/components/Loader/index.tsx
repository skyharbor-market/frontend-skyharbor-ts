import { motion } from "framer-motion";

interface LoaderProps {
  scale?: number;
  className?: string;
}
export const Loader = ({ scale = 1, className = "" }: LoaderProps) => (
  <div style={{ transform: `scale(${scale})` }}>
    <div className={` m-auto relative h-12 w-12 ${className}`}>
      <motion.div
        className="h-12 w-12 align-left absolute"
        animate={{ rotate: 360 }}
        transition={{ ease: "linear", duration: 2, repeat: Infinity }}
      >
        <img
          className="h-full hue-rotate-60"
          src="/assets/images/loadinginfinity.svg"
        />
      </motion.div>
    </div>
  </div>
);
