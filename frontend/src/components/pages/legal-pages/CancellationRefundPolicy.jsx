
const CancellationRefundPolicy = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <p className="mb-4">Last updated: 09/02/2025</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Cancellation Policy</h2>
        <p className="mb-4">
          You may cancel your subscription to <strong>Nuncio</strong> at any time. To cancel, please contact us at <a href="mailto:support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Refund Policy</h2>
        <p className="mb-4">
          We offer refunds under the following conditions:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>If you cancel your subscription within 7 days of purchase, you are eligible for a full refund.</li>
          <li>No refunds will be provided after 7 days of purchase.</li>
          <li>Refunds will be processed within 10 business days.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about our Cancellation & Refund Policy, please contact us at <a href="mailto:support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>.
        </p>
      </section>
    </div>
  );
};

export default CancellationRefundPolicy;