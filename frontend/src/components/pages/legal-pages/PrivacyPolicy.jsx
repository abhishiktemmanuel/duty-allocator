
const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: 09/02/2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to <strong>Nuncio</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your information when you use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
        <p className="mb-4">
          We may collect the following types of information:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details.</li>
          <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
          <li><strong>Device Information:</strong> IP address, browser type, and operating system.</li>
        </ul>
        <p className="mb-4">
          We do not collect or store payment details. All payments are processed through <strong>Razorpay</strong>, a third-party payment gateway.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="mb-4">
          We use your information for the following purposes:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>To provide and maintain our services.</li>
          <li>To communicate with you about your account and our services.</li>
          <li>To improve our website and services.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="mb-4">
          Under Indian law, you have the right to:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Access and update your personal information.</li>
          <li>Request deletion of your personal information.</li>
          <li>Withdraw consent for data processing.</li>
        </ul>
        <p className="mb-4">
          To exercise these rights, please contact us at <a href="mailto:support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;