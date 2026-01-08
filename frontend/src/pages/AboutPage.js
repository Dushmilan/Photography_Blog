import  { useEffect } from 'react';
import { FiCamera, FiAperture } from 'react-icons/fi';
import img from '../Images/Photographer6.jpg';

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About | Cooked By Lens';
  }, []);

  return (
    <div className="min-h-screen lg:h-screen bg-black text-white selection:bg-[#FF6F61] selection:text-white overflow-x-hidden lg:overflow-hidden relative pt-24 pb-12 lg:pt-16 lg:pb-0">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#001F3F]/10 -skew-x-12 pointer-events-none" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FF6F61]/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#A8E6CF]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full h-full max-w-7xl mx-auto px-6 flex items-start lg:items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COLUMN: ONLY PHOTO */}
          <div className="lg:col-span-5 animate-slide-up flex justify-center">
            <div className="relative group">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-white/10 rounded-2xl group-hover:border-[#FF6F61]/30 transition-colors duration-500" />
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] w-full max-w-sm shadow-2xl">
                <img
                  src={img}
                  alt="Photographer Profile"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ONLY TEXT & DETAILS */}
          <div className="lg:col-span-7 space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <header>
              <p className="text-[#A8E6CF] text-xs font-medium tracking-[0.3em] uppercase mb-3">Photographer</p>
              <h1 className="text-5xl lg:text-7xl font-thin tracking-tight mb-4 text-white">
                Mithurshan <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] via-[#FF9933] to-[#A8E6CF]">Sen</span>
              </h1>
              <p className="text-xl text-white/60 font-light max-w-xl leading-relaxed">
                From intimate portraits to vast landscapes, I document the diversity of the human spirit and the raw, unscripted beauty of our most meaningful connections.<br /> My lens speaks one message: <b>we are all the same!-yet beautifully different.</b>
              </p>
            </header>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[#FF6F61] font-medium flex items-center gap-2">
                  <FiCamera /> Philosophy
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Rooted in authenticity. Capturing the genuine, fleeting moments that tell a story for eternity.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[#A8E6CF] font-medium flex items-center gap-2">
                  <FiAperture /> Approach
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Blending natural light with architectural composition to create images that feel alive.
                </p>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-3">
              {["Portraiture", "Landscape", "Lifestyle", "Editorial"].map((label, idx) => (
                <span key={idx} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 uppercase tracking-wider">
                  {label}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;