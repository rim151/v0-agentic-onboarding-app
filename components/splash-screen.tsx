'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Logo */}
        <div className="animate-fade-in">
          <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-600 shadow-2xl flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="OnboardAI Logo"
              width={96}
              height={96}
              className="rounded-2xl"
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2 animate-fade-in-delayed">
          <h1 className="text-4xl font-bold text-gray-900">OnboardAI</h1>
          <p className="text-lg text-gray-600 font-medium">
            Intelligent Employee Onboarding, Powered by AI Agents
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-teal-600 animate-pulse delay-100"></div>
          <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse delay-200"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInDelayed {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeInDelayed 0.8s ease-out 0.3s backwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
