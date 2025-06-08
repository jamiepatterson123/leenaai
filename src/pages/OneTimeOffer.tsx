
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OneTimeOffer = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard since offers are no longer available
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you back to the app</p>
      </div>
    </div>
  );
};

export default OneTimeOffer;
