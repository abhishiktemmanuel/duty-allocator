import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TermsAndConditionsRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.replace("https://merchant.razorpay.com/policy/Prl1FHccKbHvaH/terms");
  }, [navigate]);

  return null;
};

export default TermsAndConditionsRedirect;