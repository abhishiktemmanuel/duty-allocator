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
