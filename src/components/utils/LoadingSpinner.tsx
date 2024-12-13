// components/LoadingSpinner.tsx

import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-solid"></div>
      {/* You can replace the above spinner with any other animation or pulsing effect */}
    </div>
  );
};

export default LoadingSpinner;
