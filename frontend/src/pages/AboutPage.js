import React, { useEffect } from 'react';
import { FiCamera, FiAward, FiHeart, FiAperture } from 'react-icons/fi';
import img from '../Images/photographer2.JPG';
const AboutPage = () => {
  useEffect(() => {
    document.title = 'About | Cooked By Lens';
  }, []);
  return (
    <div className="h-screen bg-black text-white selection:bg-[#FF6F61] selection:text-white overflow-hidden relative pt-16">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#001F3F]/10 -skew-x-12 pointer-events-none" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FF6F61]/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#A8E6CF]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Profile Card (Compact) */}
          <div className="lg:col-span-4 animate-slide-up bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6F61]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-4 relative">
                <div className="absolute inset-1 bg-[#0a0a0a] rounded-full flex items-center justify-center border border-white/10">
                  <img src={img} alt="Photographer" className="w-full h-full object-cover" />
                </div>
              </div>

              <h2 className="text-2xl font-light text-white mb-1">Jane Smith</h2>
              <p className="text-[#A8E6CF] text-xs font-medium tracking-[0.2em] uppercase mb-6">Lead Photographer</p>

              {/* Vertical Divider */}
              <div className="w-10 h-[1px] bg-white/10 mb-6"></div>

              <div className="grid grid-cols-3 gap-2 w-full mb-6 text-center">
                <div>
                  <div className="text-xl font-bold text-white">10+</div>
                  <div className="text-[10px] text-white/40 uppercase">Years</div>
                </div>
                <div className="border-l border-white/10">
                  <div className="text-xl font-bold text-white">500+</div>
                  <div className="text-[10px] text-white/40 uppercase">Shoots</div>
                </div>
                <div className="border-l border-white/10">
                  <div className="text-xl font-bold text-white">15</div>
                  <div className="text-[10px] text-white/40 uppercase">Awards</div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Content (Concise) */}
          <div className="lg:col-span-8 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div>
              <h1 className="text-4xl lg:text-6xl font-thin tracking-tight mb-4">
                Visual <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] via-[#FF9933] to-[#A8E6CF]">Storyteller</span>
              </h1>
              <p className="text-lg text-white/60 font-light max-w-2xl leading-relaxed">
                Freezing time through the lens of light, shadow, and raw emotion. My work is an exploration of the unscripted beauty that surrounds us.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                <p className="text-[#FF6F61] mb-2 font-medium flex items-center gap-2">
                  <FiCamera /> Philosophy
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Rooted in authenticity. I strive to capture the genuine, fleeting moments that tell a story for eternity.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                <p className="text-[#A8E6CF] mb-2 font-medium flex items-center gap-2">
                  <FiAperture /> Approach
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Blending natural light with architectural composition to create images that feel breathing and alive.
                </p>
              </div>
            </div>

            {/* Specialties Row */}
            <div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4 pl-1">Specialties</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: FiCamera, label: "Portraiture" },
                  { icon: FiAperture, label: "Landscape" },
                  { icon: FiHeart, label: "Lifestyle" },
                  { icon: FiAward, label: "Editorial" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-[#A8E6CF]/50 hover:bg-white/10 transition-all cursor-default">
                    <item.icon className="text-[#A8E6CF]" />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;