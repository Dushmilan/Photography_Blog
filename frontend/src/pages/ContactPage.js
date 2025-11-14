import React, { useState } from 'react';
import { FiMail, FiInstagram, FiFacebook, FiSend, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../utils/api';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState(null); // null, 'loading', 'success', 'error'

  // Contact form handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactStatus('error');
      alert('Please fill in all required fields (name, email, and message).');
      return;
    }

    setContactStatus('loading');

    try {
      const response = await api.post('/contact', contactForm);

      if (response.data.success) {
        setContactStatus('success');
        // Reset form
        setContactForm({
          name: '',
          email: '',
          message: ''
        });

        // Show success message for a few seconds then reset
        setTimeout(() => {
          setContactStatus(null);
        }, 3000);
      } else {
        setContactStatus('error');
        alert('Failed to send message: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      setContactStatus('error');
      console.error('Contact form error:', error);
      alert('An error occurred while sending your message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'black' }}>
      {/* Header section */}
      <header className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-left">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
            Let's <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Connect</span>
          </h1>
          <div className="space-y-4 mt-4">
            <p className="text-base text-white max-w-2xl opacity-90">
              I'd love to hear about your project and explore how we can bring your vision to life.
              Whether you're planning a wedding, corporate event, or artistic collaboration,
              I'm here to discuss your creative needs.
            </p>
            <p className="text-base text-white max-w-2xl opacity-90">
              I typically respond within 24 hours, and I'm selective about the projects I take on
              to ensure I can give each one my full attention. Please share details about your timeline,
              vision, and expectations so we can determine if we're a good fit to work together.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-24">
          {/* Contact Form First */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-8">
              Send a <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Message</span>
            </h2>

            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white mb-2 font-medium">Name *</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your Name *"
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white mb-2 font-medium">Email *</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your Email *"
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-white mb-2 font-medium">Message *</label>
                <textarea
                  id="message"
                  rows="8"
                  placeholder="Your Message *"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactStatus === 'loading'}
                className={`w-full py-3 rounded-lg font-medium transition-all border ${
                  contactStatus === 'loading'
                    ? 'bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF6F61] to-[#FF9933] text-white hover:from-[#FF5F51] hover:to-[#E58929]'
                }`}
              >
                {contactStatus === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2 inline" /> Send Message
                  </>
                )}
              </button>

              {contactStatus === 'success' && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200 mt-4">
                  Message sent successfully! Thank you for contacting me. I'll get back to you as soon as possible.
                </div>
              )}

              {contactStatus === 'error' && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 mt-4">
                  Error sending message. Please try again or contact me directly at hello@photography.com
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;