const TermsAndConditions = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="mb-4">Last updated: 09/02/2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
        Welcome to <strong>Nuncio</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your information when you use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use of Services</h2>
        <p className="mb-4">
          You agree to use our services only for lawful purposes and in accordance with these Terms & Conditions. You must not:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Use our services in any way that violates applicable laws.</li>
          <li>Attempt to gain unauthorized access to our systems or data.</li>
          <li>Use our services to transmit any harmful or malicious content.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Payments</h2>
        <p className="mb-4">
          All payments are processed through <strong>Razorpay</strong>, a third-party payment gateway. We do not store or process payment details on our servers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
        <p className="mb-4">
          All content, trademarks, and intellectual property on this website are owned by <strong>Nuncio</strong>. You may not use, reproduce, or distribute any content without our prior written consent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
        <p className="mb-4">
          To the fullest extent permitted by law, <strong>Nuncio</strong> shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
        <p className="mb-4">
          These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Insert City], India.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms & Conditions, please contact us at <a href="mailto:support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;