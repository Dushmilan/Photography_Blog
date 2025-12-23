import React from 'react';

const SuccessNotification = ({ message, isVisible, onClose, duration = 3000 }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] pointer-events-none">
      <div className="max-w-md w-full bg-gray-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out animate-slideIn pointer-events-auto overflow-hidden">
        {/* Success progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#A8E6CF] to-[#FF6F61] animate-progress" style={{ animationDuration: `${duration}ms` }}></div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#A8E6CF]/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-[#A8E6CF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white tracking-wide">SUCCESS</h3>
              <p className="mt-0.5 text-sm text-white/70 leading-relaxed font-light">{message}</p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;