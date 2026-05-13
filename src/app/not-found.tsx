import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4">
      <style>{`
        .arabic-text {
          font-family: 'Almarai', sans-serif;
        }
      `}</style>

      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* English Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h1 className="text-5xl font-bold mb-2 text-[#0066cc]">404</h1>
          <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for does not exist.
          </p>

          {/* English Action Button */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0066cc] hover:bg-[#0071e3] text-white font-medium rounded-lg transition-colors"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* Arabic Section */}
        <div dir="rtl" className="arabic-text">
          <h1 className="text-5xl font-bold mb-2 text-[#0066cc]">404</h1>
          <h2 className="text-2xl font-semibold mb-3">الصفحة غير موجودة</h2>
          <p className="text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة.
          </p>

          {/* Arabic Action Button */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0066cc] hover:bg-[#0071e3] text-white font-medium rounded-lg transition-colors"
          >
            <Home size={18} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
