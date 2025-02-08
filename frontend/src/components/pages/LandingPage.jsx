import Pricing from '../Pricing'; // Pricing component (created below)

const LandingPage = () => {
  return (
    <div className="font-sans bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">nuncio</h1>
          <ul className="flex space-x-4">
            <li><a href="#about" className="hover:text-blue-200">About</a></li>
            <li><a href="#pricing" className="hover:text-blue-200">Pricing</a></li>
            <li><a href="#contact" className="hover:text-blue-200">Contact</a></li>
            <li>
              <a
                href="/login" // Link to your existing login page
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Simplify Exam Invigilation Duty Allocation</h1>
          <p className="text-xl mb-8">
            Efficiently manage and allocate invigilation duties for your school examinations with our SaaS solution.
          </p>
          <a
            href="#signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">About Us</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg mb-4">
              Nuncio is a powerful SaaS platform designed to help schools streamline the process of allocating invigilation duties for examinations. Our goal is to save time, reduce errors, and ensure fairness in duty allocation.
            </p>
            <p className="text-lg">
              With features like automated scheduling, real-time notifications, and customizable rules, ExamInvigilator is the ultimate solution for schools looking to simplify their exam management process.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-blue-50 py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
          <Pricing />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg mb-4">
              Have questions or need support? Reach out to us!
            </p>
            <p className="text-lg mb-4">
              Email: <a href="support@abhishikt.com" className="text-blue-600">support@abhishikt.com</a>
            </p>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 nuncio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;