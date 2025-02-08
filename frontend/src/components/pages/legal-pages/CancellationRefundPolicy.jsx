import { useEffect } from "react";

const CancellationRefundPolicyRedirect = () => {
  useEffect(() => {
    window.location.href = "https://merchant.razorpay.com/policy/Prl1FHccKbHvaH/refund";
  }, []);

  return null;
};

export default CancellationRefundPolicyRedirect;