import { useState, useEffect, useRef } from "react";

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const razorpayRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        razorpayRef.current = window.Razorpay;
        setIsLoading(false);
      } else {
        setError(new Error("Razorpay not available"));
      }
    };

    script.onerror = () => {
      setError(new Error("Failed to load Razorpay script"));
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return {
    Razorpay: razorpayRef.current,
    isLoading,
    error,
  };
};
