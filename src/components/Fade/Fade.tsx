import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface FadeProps {
  children: ReactNode;
  fadeKey: React.Key;
  fadeDuration?: number;
}

function Fade({ children, fadeKey, fadeDuration = 0.5 }: FadeProps) {
  return (
    <motion.div
      key={fadeKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: fadeDuration }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

export default Fade;
