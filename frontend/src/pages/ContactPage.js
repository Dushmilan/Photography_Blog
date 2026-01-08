import React, { useState, useEffect } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import api from '../utils/api';

const ContactPage = () => {
  useEffect(() => {
    document.title = 'Contact | Cooked By Lens';
    window.scrollTo(0, 0);
  }, []);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [contactStatus, setContactStatus] = useState(null); // null, 'loading', 'success', 'error'

  const handleContactSubmit = async (e) => {
    e.preventDefault();

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
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactStatus(null), 5000);
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
    <div className="min-h-screen pt-48 pb-24 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6F61] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#A8E6CF] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Flex Container: items-center ensures perfect vertical alignment between text and form */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center justify-between">

          {/* Left Column: Text & Info */}
          <div className="space-y-12 animate-fadeInLeft lg:w-1/2">
            <div>
              {/* Heading: Tight leading-[0.8] for high-end scale; added <br /> for better structure */}
              <h1 className="text-7xl md:text-9xl font-extralight text-white tracking-tighter leading-[0.8] mb-10">
                Let's <br />
                <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent font-normal">
                  Connect
                </span>
              </h1>

              {/* Paragraph: Longer, more descriptive content to provide the visual "weight" needed to anchor the design */}
              <p className="text-gray-400 text-lg md:text-xl mt-8 leading-relaxed max-w-2xl font-light tracking-wide">
                I'm always open to discussing photography projects, creative ideas, or unique opportunities
                to bring your visual narratives to life. Whether you're looking to capture a specific moment
                or build a long-term creative partnership, I’m here to help translate your vision into
                compelling imagery that resonates. Let’s collaborate to create something truly exceptional
                that captures the raw essence of your story.
              </p>
            </div>

            {/* Email Contact Block */}
            <div className="pt-4">
              <div className="flex items-center space-x-6 group">
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#FF6F61]/20 transition-all duration-500 border border-white/10 group-hover:border-[#FF6F61]/30">
                  <FiMail className="w-6 h-6 text-[#A8E6CF] group-hover:text-[#FF6F61] transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-white/30 uppercase tracking-[0.2em] text-xs font-bold mb-1">Get in touch</h3>
                  <p className="text-white text-xl font-light group-hover:text-[#A8E6CF] transition-colors duration-300">
                    cookedbylens@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl animate-fadeInRight w-full lg:max-w-lg">
            <h2 className="text-3xl font-light text-white mb-10">
              Send a <span className="text-[#A8E6CF]">Message</span>
            </h2>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Name */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#FF6F61]">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF6F61] focus:border-[#FF6F61] transition-all duration-300"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#A8E6CF]">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A8E6CF] focus:border-[#A8E6CF] transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Message */}
                <div className="group">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-500 mb-2 pl-1 transition-colors group-hover:text-[#FF6F61]">Message</label>
                  <textarea
                    id="message"
                    rows="4"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF6F61] focus:border-[#FF6F61] transition-all duration-300 resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>
              </div>

              {/* Submit Button: Gradient matched to the header text */}
              <button
                type="submit"
                disabled={contactStatus === 'loading'}
                className={`w-full py-5 mt-4 rounded-2xl font-semibold text-lg tracking-wide transition-all duration-500 transform hover:-translate-y-1 ${contactStatus === 'loading'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] text-black hover:shadow-[0_0_30px_rgba(168,230,207,0.3)]'
                  }`}
              >
                {contactStatus === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Message <FiSend className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Status Messages */}
              {contactStatus === 'success' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm text-center animate-fadeIn">
                  Message sent successfully! I'll be in touch soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;