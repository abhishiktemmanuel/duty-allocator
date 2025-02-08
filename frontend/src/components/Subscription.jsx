// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useRazorpay } from '../hooks/useRazorpay';
// import { createSubscription } from '../services/backendApi';
// import { useState } from 'react';

// const Subscription = () => {
//   const navigate = useNavigate();
//   const { updateUser } = useAuth();
//   const { Razorpay, isLoading: isRazorpayLoading, error: razorpayError } = useRazorpay();
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleSuccessfulSubscription = () => {
//     updateUser({ hasActiveSubscription: true });
//     navigate('/teachers');
//   };

//   const handleSubscription = async (planId) => {
//     if (isProcessing) return;
//     setIsProcessing(true);
//     console.log('Creating subscription for plan:', planId);

//     try {
//       const response = await createSubscription(planId);
//       const { data } = response;
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_API_KEY,
//         subscription_id: data.razorpaySubscriptionId,
//         name: "Your SaaS App",
//         description: "Subscription Payment",
//         handler: function (response) {
//           alert(`Subscription successful! Payment ID: ${response.razorpay_payment_id}`);
//           handleSuccessfulSubscription();
//         },
//         // Add these required fields:
//         amount: data.amount, // Make sure this is provided by your backend
//         currency: 'INR', // Or the appropriate currency code
//       };
      
//       const rzpay = new Razorpay(options);
//       rzpay.open();
//     } catch (error) {
//       console.error('Subscription error:', error);
//       console.log('Error details:', error.response?.data);
//       if (error.response?.status === 403) {
//         alert('Access denied. Please check your account status.');
//       } else {
//         alert('Error creating subscription. Please try again later.');
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (isRazorpayLoading) {
//     return <div>Loading Razorpay...</div>;
//   }

//   if (razorpayError) {
//     return <div>Error loading Razorpay: {razorpayError.message}</div>;
//   }

//   return (

//     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
//       <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
//           Choose a Subscription Plan
//         </h2>
//         <div className="space-y-4">
//           {['MONTHLY', 'QUARTERLY', 'YEARLY'].map((plan) => (
//             <button
//               key={plan}
//               onClick={() => handleSubscription(import.meta.env.VITE_RAZORPAY_MONTYLY_PLAN)}
//               disabled={isProcessing}
//               className={`w-full py-2 px-4 ${plan === 'MONTHLY' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium rounded-lg focus:outline-none focus:ring focus:ring-blue-300 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {plan.charAt(0) + plan.slice(1).toLowerCase()} Plan
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { createSubscription } from '../services/backendApi';
import { useState } from 'react';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { Razorpay, isLoading: isRazorpayLoading, error: razorpayError } = useRazorpay();
  const [processingPlan, setProcessingPlan] = useState(null); // Track which plan is being processed

  const plans = [
    {
      name: "Monthly",
      price: "₹149",
      description: "Perfect for short-term needs.",
      features: ["Automated Duty Allocation", "Synchronous invigilator account", "Support"],
      planId: import.meta.env.VITE_RAZORPAY_MONTHLY_PLAN, // Replace with your actual plan ID
    },
    {
      name: "Quarterly",
      price: "₹399",
      description: "Great for medium-term usage.",
      features: ["Automated Duty Allocation", "Synchronous invigilator account", "Support"],
      planId: import.meta.env.VITE_RAZORPAY_QUARTERLY_PLAN, // Replace with your actual plan ID
    },
    {
      name: "Yearly",
      price: "₹1499",
      description: "Best value for long-term usage.",
      features: ["Automated Duty Allocation", "Synchronous invigilator account", "Support"],
      planId: import.meta.env.VITE_RAZORPAY_YEARLY_PLAN, // Replace with your actual plan ID
    },
  ];

  const handleSuccessfulSubscription = () => {
    updateUser({ hasActiveSubscription: true });
    navigate('/teachers'); // Redirect to a success page or dashboard
  };

  const handleSubscription = async (planId) => {
    if (!user) {
      navigate('/login'); // Redirect to login if user is not authenticated
      return;
    }

    if (processingPlan) return; // Prevent multiple clicks
    setProcessingPlan(planId); // Set the currently processing plan

    try {
      const response = await createSubscription(planId);
      const { data } = response;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        subscription_id: data.razorpaySubscriptionId,
        name: "nuncio",
        description: "Subscription Payment",
        handler: function (response) {
          alert(`Subscription successful! Payment ID: ${response.razorpay_payment_id}`);
          handleSuccessfulSubscription();
        },
        amount: data.amount, // Ensure this is provided by your backend
        currency: 'INR', // Or the appropriate currency code
      };

      const rzpay = new Razorpay(options);
      rzpay.open();
    } catch (error) {
      console.error('Subscription error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Please check your account status.');
      } else {
        alert('Error creating subscription. Please try again later.');
      }
    } finally {
      setProcessingPlan(null); // Reset the processing plan
    }
  };

  if (isRazorpayLoading) {
    return <div>Loading Razorpay...</div>;
  }

  if (razorpayError) {
    return <div>Error loading Razorpay: {razorpayError.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
          <p className="text-4xl font-bold mb-4">{plan.price}</p>
          <p className="text-gray-600 mb-6">{plan.description}</p>
          <ul className="mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="mb-2">
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscription(plan.planId)}
            disabled={processingPlan === plan.planId} // Disable only the clicked plan's button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPlan === plan.planId ? 'Processing...' : 'Choose Plan'}
          </button>
        </div>
      ))}
    </div>
  );
};


export default Subscription;