import { motion } from "framer-motion";
import React from "react";

export default function LoadingCircle(props) {
  return (
    <div className="relative" style={{ width: 80, height: 80 }}>
      <motion.div
        className="origin-center"
        animate={{ rotate: 360 }}
        transition={{ ease: "linear", duration: 8, repeat: Infinity }}
        className="rounded-[50%]"
        // style={{
        //   background:
        //     "radial-gradient(closest-side, white 79%, transparent 80% 100%),conic-gradient(#9966cc 75%, #b284be 0) ",
        // }}
      >
        <svg class="progress-ring" width="80" height="80" viewBox="0 0 120 120">
          <circle
            className=""
            style={{ strokeDasharray: "10 20" }}
            stroke="#9966cc"
            stroke-width="2"
            fill="transparent"
            r="52"
            cx="60"
            cy="60"
          />
        </svg>
      </motion.div>

      {/* <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center">
        <p className="mb-0 text-xs text-gray-500">loading...</p>
      </div> */}
    </div>
  );
}
