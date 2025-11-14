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
    <div className="min-h-screen flex flex-col pt-24" style={{ backgroundColor: 'black' }}>
      {/* Main Content */}
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header and Contact Form in single column */}
          <div className="space-y-8">
            {/* Header section */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
                Let's <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Connect</span>
              </h1>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-white max-w-2xl opacity-90">
                  I am currently available for photography and videography projects.
                  Whether you're looking for captivating visuals for your brand, event, or personal project, or
                  interested in discussing potential collaborations, feel free to reach out.
                </p>
                <p className="text-sm text-white max-w-2xl opacity-90">
                  Use the form below to inquire about rates, availability, or just to say hello. Let's create something amazing together!
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-black p-5 px-0 md:px-0 rounded-xl">
              <h2 className="text-xl md:text-2xl font-light text-white mb-6 text-left">
                Send a <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Message</span>
              </h2>

              <form className="space-y-4 max-w-sm w-full text-left" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-white mb-1 font-medium text-sm"></label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your Name *"
                      className="w-full px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400 text-sm"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white mb-1 font-medium text-sm"></label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Your Email *"
                      className="w-full px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400 text-sm"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white mb-1 font-medium text-sm"></label>
                  <textarea
                    id="message"
                    rows="5"
                    placeholder="Your Message *"
                    className="w-full px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-transparent text-white placeholder-gray-400 text-sm"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={contactStatus === 'loading'}
                    className={`py-2 px-4 rounded-lg font-medium transition-all border ${
                      contactStatus === 'loading'
                        ? 'bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF6F61] to-[#FF9933] text-white hover:from-[#FF5F51] hover:to-[#E58929]'
                    } text-sm`}
                  >
                    {contactStatus === 'loading' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-1 inline" /> Send
                      </>
                    )}
                  </button>
                </div>

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
        </div>
      </main>
    </div>
  );
};

export default ContactPage;