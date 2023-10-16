import React from "react";

type Props = {};

const LoadingCard = (props: Props) => {
  return (
    <div className="border border-blue-300 shadow rounded-md max-w-sm w-full mx-auto">
      <div className="animate-pulse">
        <div className="aspect-square">
          <div className="rounded-t-md bg-slate-700 w-full h-full"></div>
        </div>
        <div className="p-4 flex flex-col space-y-3">
          <div className="h-5 bg-slate-700 rounded col-span-2"></div>
          <div className="h-5 w-[30%] bg-slate-700 rounded col-span-2"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;
