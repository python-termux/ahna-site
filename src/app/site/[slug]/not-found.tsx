import Link from "next/link";
import { Home, LogIn, UserPlus } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* English Section */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-4xl font-bold mb-3">Site Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The site you are looking for either not active or removed by site owner.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            If you are owner of this site, login to activate or register if you wish to take this domain.
          </p>

          {/* English Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="https://app.syrflow.com/auth/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0066cc] hover:bg-[#0071e3] text-white font-medium rounded-lg transition-colors"
            >
              <LogIn size={18} />
              Login to Activate
            </Link>
            <Link
              href="https://app.syrflow.com/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              Register Domain
            </Link>
          </div>
        </div>

        {/* Arabic Section */}
        <div dir="rtl">
          <h1 className="text-4xl font-bold mb-3">الموقع غير موجود</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            الموقع الذي تبحث عنه إما غير نشط أو تم حذفه من قبل مالك الموقع.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            إذا كنت مالك هذا الموقع، قم بتسجيل الدخول لتفعيله أو سجل إذا كنت تريد الحصول على هذا النطاق.
          </p>

          {/* Arabic Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="https://app.syrflow.com/auth/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0066cc] hover:bg-[#0071e3] text-white font-medium rounded-lg transition-colors"
            >
              <LogIn size={18} />
              تسجيل الدخول للتفعيل
            </Link>
            <Link
              href="https://app.syrflow.com/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              تسجيل النطاق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
