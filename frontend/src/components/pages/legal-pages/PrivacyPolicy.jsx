import { useEffect } from "react";

const PrivacyPolicyRedirect = () => {
  useEffect(() => {
    window.location.href = "https://merchant.razorpay.com/policy/Prl1FHccKbHvaH/privacy";
  }, []);

  return null;
};

export default PrivacyPolicyRedirect;