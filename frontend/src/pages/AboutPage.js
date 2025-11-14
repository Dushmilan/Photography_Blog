import React from 'react';
import { FiMail, FiInstagram, FiFacebook, FiCamera, FiAward } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF5E1' }}>
      {/* Header section */}
      <header className="pt-20 pb-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-[#001F3F] mb-4 tracking-tight">
            About <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Me</span>
          </h1>
          <p className="text-xl text-[#001F3F] max-w-2xl mx-auto opacity-90">
            Discover my journey in photography
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-light text-[#001F3F] mb-6">
                My <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Photography</span> Journey
              </h2>
              <p className="text-lg text-[#001F3F] mb-6 opacity-90 leading-relaxed">
                With over 10 years of experience in photography, I specialize in capturing the essence of life's precious moments.
                My work combines technical precision with emotional storytelling, creating images that resonate with viewers on a
                deeper level.
              </p>
              <p className="text-lg text-[#001F3F] mb-6 opacity-90 leading-relaxed">
                I focus on natural lighting and authentic moments, specializing in environmental portraiture and landscape photography. 
                My approach emphasizes composition and emotion to create timeless images that tell compelling stories.
              </p>
              <p className="text-lg text-[#001F3F] opacity-80 leading-relaxed">
                From intimate portraits to breathtaking landscapes, I am passionate about showcasing the beauty that surrounds us
                every day. My approach is to blend artistic vision with the latest photography techniques to deliver unforgettable
                visual experiences.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#708090]/30 shadow-lg w-full max-w-sm">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#FF6F61] flex items-center justify-center">
                    <FiCamera className="text-white text-5xl" />
                  </div>
                  <h3 className="text-xl font-medium text-[#001F3F] mb-2">Jane Smith</h3>
                  <p className="text-[#001F3F]/80 mb-4">Professional Photographer</p>
                  
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <div className="bg-[#A8E6CF]/30 px-3 py-1 rounded-full text-sm text-[#001F3F]">
                      <FiAward className="inline mr-1" /> 10+ Years Experience
                    </div>
                    <div className="bg-[#A8E6CF]/30 px-3 py-1 rounded-full text-sm text-[#001F3F]">
                      <FiAward className="inline mr-1" /> Awards Winner
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-start">
                      <FiMail className="text-[#FF6F61] mr-3" />
                      <span className="text-[#001F3F]/80">hello@photography.com</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <FiInstagram className="text-[#FF6F61] mr-3" />
                      <span className="text-[#001F3F]/80">@photographer</span>
                    </div>
                    <div className="flex items-center justify-start">
                      <FiFacebook className="text-[#FF6F61] mr-3" />
                      <span className="text-[#001F3F]/80">Photographer Page</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-20">
            <h2 className="text-2xl md:text-3xl font-light text-[#001F3F] mb-8 text-center">
              My <span className="bg-gradient-to-r from-[#FF6F61] to-[#A8E6CF] bg-clip-text text-transparent">Expertise</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-[#708090]/20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A8E6CF]/20 flex items-center justify-center">
                  <FiCamera className="text-[#001F3F] text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-[#001F3F] mb-2">Portrait</h3>
                <p className="text-[#001F3F]/70 text-sm">Capturing the essence of personality and emotion</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-[#708090]/20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A8E6CF]/20 flex items-center justify-center">
                  <FiCamera className="text-[#001F3F] text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-[#001F3F] mb-2">Landscape</h3>
                <p className="text-[#001F3F]/70 text-sm">Showcasing the beauty of natural environments</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-[#708090]/20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A8E6CF]/20 flex items-center justify-center">
                  <FiCamera className="text-[#001F3F] text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-[#001F3F] mb-2">Event</h3>
                <p className="text-[#001F3F]/70 text-sm">Documenting special moments and celebrations</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-[#708090]/20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#A8E6CF]/20 flex items-center justify-center">
                  <FiCamera className="text-[#001F3F] text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-[#001F3F] mb-2">Commercial</h3>
                <p className="text-[#001F3F]/70 text-sm">Professional photography for businesses</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;