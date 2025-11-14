import React, { useState } from 'react';
import { FiMail, FiInstagram, FiFacebook, FiSend, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../utils/api';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
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
          subject: '',
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
      <header className="pt-20 pb-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
            Get In <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto opacity-90">
            Have a project in mind? Let's create something amazing together.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-lg mx-auto space-y-16"> {/* max-w-lg is approximately 30% of screen width on larger screens */}
          {/* Contact Form First */}
          <div>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-8">
              Send a <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Message</span>
            </h2>

            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div>
                <label htmlFor="name" className="block text-white mb-2 font-medium">Name *</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your Name *"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-gray-800 text-white placeholder-gray-400"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-gray-800 text-white placeholder-gray-400"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-white mb-2 font-medium">Subject</label>
                <input
                  type="text"
                  id="subject"
                  placeholder="Subject"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-gray-800 text-white placeholder-gray-400"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white mb-2 font-medium">Message *</label>
                <textarea
                  id="message"
                  rows="6"
                  placeholder="Your Message *"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] bg-gray-800 text-white placeholder-gray-400"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactStatus === 'loading'}
                className={`w-full py-4 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center ${
                  contactStatus === 'loading'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
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
                    <FiSend className="mr-2" /> Send Message
                  </>
                )}
              </button>

              {contactStatus === 'success' && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
                  Message sent successfully! Thank you for contacting me. I'll get back to you as soon as possible.
                </div>
              )}

              {contactStatus === 'error' && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                  Error sending message. Please try again or contact me directly at hello@photography.com
                </div>
              )}
            </form>
          </div>

          {/* Contact Information Second */}
          <div>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-8">
              Contact <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Information</span>
            </h2>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center mr-5 flex-shrink-0">
                  <FiMail className="text-[#FF6F61] text-xl" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg mb-1">Email</h3>
                  <p className="text-white/80">hello@photography.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center mr-5 flex-shrink-0">
                  <FiPhone className="text-[#FF6F61] text-xl" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg mb-1">Phone</h3>
                  <p className="text-white/80">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center mr-5 flex-shrink-0">
                  <FiMapPin className="text-[#FF6F61] text-xl" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg mb-1">Location</h3>
                  <p className="text-white/80">New York, NY</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-[#A8E6CF]/30 flex items-center justify-center mr-5 flex-shrink-0">
                  <FiInstagram className="text-[#FF6F61] text-xl" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg mb-1">Instagram</h3>
                  <p className="text-white/80">@photographer</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-medium text-white mb-4">Follow Me</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-[#708090]/30 shadow-sm hover:shadow-md transition-shadow">
                  <FiInstagram className="text-white" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-[#708090]/30 shadow-sm hover:shadow-md transition-shadow">
                  <FiFacebook className="text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;