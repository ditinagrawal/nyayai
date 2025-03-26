import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="pt-28 pb-20 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Transform Your Workflow with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              AI-Powered Chat
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
            Experience the future of team collaboration with our intelligent chat platform.
            Boost productivity and streamline communication like never before.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in-delay-2">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              Try it Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl animate-fade-in-delay-3">
          <video
            className="w-full"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=2400&q=80"
          >
            <source
              src="https://static.videezy.com/system/resources/previews/000/037/036/original/Simple_Website_Loop.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </div>
  );
}