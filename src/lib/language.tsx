"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "ar";

interface Translations {
  nav: {
    pricing: string; contact: string; legal: string;
    terms: string; privacy: string; refund: string;
    login: string; getStarted: string;
  };
  footer: {
    copyright: string; pricing: string; login: string;
    register: string; terms: string; privacy: string;
    refunds: string; contact: string;
  };
  home: {
    badge: string; h1a: string; h1b: string; hero: string; cta: string;
    features: Array<{ title: string; desc: string }>;
  };
  pricing: {
    badge: string; h1a: string; h1b: string; sub: string;
    mostPopular: string; fullyBooked: string; loading: string;
    monthly: string; billedAnnually: string;
    faqTitle: string; faqSub: string;
    slotsLeft: (n: number) => string;
  };
  contact: {
    title: string; emailTitle: string; emailSub: string;
    phoneTitle: string; phoneSub: string; faqTitle: string;
  };
  login: {
    returnHome: string; welcome: string; sub: string;
    email: string; password: string; forgot: string;
    submit: string; noAccount: string; register: string; loggingIn: string;
  };
  forgot: {
    returnHome: string; title: string; sub: string;
    email: string; submit: string; backToLogin: string;
    checkEmail: string; sentTo: string;
  };
  terms:   { title: string; updated: string };
  privacy: { title: string; updated: string };
  refund:  { title: string; updated: string };
  dataDeletion: {
    title: string; whatTitle: string; whatBody: string;
    howTitle: string; howIntro: string;
    opt1Title: string; opt1Body: string;
    opt2Title: string; opt2Body: string;
    fbTitle: string; fbPre: string; fbLink: string; fbPost: string;
    contactTitle: string; contactBody: string;
  };
  dashboard: {
    logOut: string; yourPages: string; edit: string; view: string;
    noPagesYet: string; noPagesBody: string; import: string;
    deleteMyAccount: string; deleteAccountTitle: string; deleteAccountBody: string;
    deleteForever: string; deleteAccount: string; cancel: string;
    save: string; saving: string; saved: string; saveChanges: string;
    previewSite: string; unsavedTitle: string; unsavedBody: string;
    stay: string; discard: string; saveLeave: string;
    deleteAccountWarning: string; deleteConfirmLabel: string;
    nav: {
      branding: string; theme: string; images: string; services: string;
      contact: string; stats: string; hours: string; social: string; reviews: string;
    };
    branding: {
      businessName: string; tagline: string; aboutDescription: string;
      category: string; categoryNote: string; aiFill: string;
    };
    theme: {
      mode: string; light: string; dark: string; accentColor: string;
      cornerRoundness: string; sharp: string; rounded: string; pill: string;
    };
    images: { gallery: string; noGallery: string; aboutImage: string; pasteUrl: string };
    services: {
      noServicesTitle: string; noServicesBody: string; serviceLabel: string;
      serviceName: string; description: string; remove: string;
      addService: string; briefDesc: string;
    };
    contact: { phone: string; email: string; address: string; addressNote: string };
    stats: { years: string; clientsReviews: string; rating: string; autoFetched: string };
    hours: { placeholder: string };
    reviews: { noReviews: string; note: string };
    days: Record<string, string>;
    toasts: {
      loggedOut: string; imported: string; importFailed: string;
      deleted: string; deleteFailed: string; saving: string; saved: string; saveFailed: string;
    };
  };
}

const T: Record<Lang, Translations> = {
  en: {
    nav: {
      pricing: "Pricing", contact: "Contact", legal: "Legal",
      terms: "Terms of Service", privacy: "Privacy Policy", refund: "Refund Policy",
      login: "Log in", getStarted: "Get started",
    },
    footer: {
      copyright: "All rights reserved.",
      pricing: "Pricing", login: "Login", register: "Register",
      terms: "Terms", privacy: "Privacy", refunds: "Refunds", contact: "Contact",
    },
    home: {
      badge: "No coding. No Hosting. No Fuss.",
      h1a: "Facebook or Google Maps",
      h1b: "Turn them into a stunning website",
      hero: "Your customers have already told you why they pick you on your Google Business Profile, now turn that feedback into a high converting website starting from just 8.25 AED/month. Zero coding. Zero hosting hassle.",
      cta: "Get started Now",
      features: [
        { title: "Ready in 60 seconds", desc: "Paste your Google Maps link and your website is live instantly. No developers to fight with." },
        { title: "Fetch All Your Data", desc: "We turn real feedback into clear messaging that fits your business automatically." },
        { title: "No Coding Required", desc: "Change any text, image, service, testimonial, or contact detail from your dashboard anytime." },
        { title: "Add or Edit Anything", desc: "Showcase real customer feedback with star ratings. Add or edit as many as you like." },
        { title: "AI Powered Content", desc: "Generate professional headings, taglines, and descriptions instantly with one click. Let Ai write your website content." },
        { title: "Less than 1 Meter Pizza", desc: "You get a proper functional business website for a fraction of the cost. Just 10 AED monthly." },
        { title: "Proper Auto SEO", desc: "Any website created with syrflow.com gets optimized for search engines automatically." },
        { title: "Support Custom Domains", desc: "If you wish to add a custom domain to your website, please contact our support team." },
        { title: "Still in Beta", desc: "We are still in beta. Some great features will be available soon. Stay tuned!" },
      ],
    },
    pricing: {
      badge: "Simple pricing cheaper than 1 meter Pizza",
      h1a: "Save Web Hosting Costs", h1b: "Save development time",
      sub: "With syrflow.com no need a website developer.",
      mostPopular: "Most Popular", fullyBooked: "Fully Booked", loading: "Loading…",
      monthly: "monthly", billedAnnually: "AED/year - Billed Annually",
      faqTitle: "Frequently Asked Questions",
      faqSub: "Everything you need to know about our plans and features",
      slotsLeft: (n) => `Limited · ${n} Slot${n !== 1 ? "s" : ""} Left`,
    },
    contact: {
      title: "Get in touch",
      emailTitle: "Email Us", emailSub: "For general inquiries and support",
      phoneTitle: "Call Us", phoneSub: "Monday to Friday, 9am - 6pm GST",
      faqTitle: "Frequently Asked Questions",
    },
    login: {
      returnHome: "Return to home", welcome: "Welcome back",
      sub: "Log in to manage your business page.",
      email: "Email", password: "Password", forgot: "Forgot password?",
      submit: "Log in", noAccount: "Don't have an account?",
      register: "Register now", loggingIn: "Logging in…",
    },
    forgot: {
      returnHome: "Return to home", title: "Reset your password",
      sub: "Enter your email and we'll send you a reset link.",
      email: "Email", submit: "Send reset link", backToLogin: "Back to login",
      checkEmail: "Check your email", sentTo: "We sent a password reset link to",
    },
    terms:   { title: "Terms of Service",   updated: "Last updated: April 28, 2026" },
    privacy: { title: "Privacy Policy",     updated: "Last updated: April 28, 2026" },
    refund:  { title: "Refund Policy",      updated: "Last updated: April 28, 2026" },
    dataDeletion: {
      title: "Data Deletion Request",
      whatTitle: "What data we store",
      whatBody: "When you connect your Facebook page, syrflow.com only reads your page's public information (name, contact details, photos, reviews) to build your business website. We do not store your Facebook credentials, personal messages, or private data.",
      howTitle: "How to delete your data",
      howIntro: "To delete all your data from syrflow.com, you have two options:",
      opt1Title: "From your dashboard:",
      opt1Body: "Log in to syrflow.com, go to your dashboard, open the menu and click \"Delete account\". This removes all your business data and account immediately.",
      opt2Title: "Via email:",
      opt2Body: "Send a deletion request to support@syrflow.com with the subject \"Data Deletion Request\" and your registered email address. We will process it within 30 days.",
      fbTitle: "Facebook-specific removal",
      fbPre: "To remove syrflow.com's access to your Facebook pages at any time, go to your",
      fbLink: "Facebook App Settings",
      fbPost: "and remove syrflow.com from the list. This immediately revokes our access to your pages.",
      contactTitle: "Contact",
      contactBody: "For any data-related questions, email us at",
    },
    dashboard: {
      logOut: "Log out", yourPages: "Your pages", edit: "Edit", view: "View",
      noPagesYet: "No business pages yet",
      noPagesBody: "Paste your Google Maps link below to import your business.",
      import: "Import", deleteMyAccount: "Delete my account",
      deleteAccountTitle: "Delete account?",
      deleteAccountBody: "This permanently removes your account. Type DELETE to confirm.",
      deleteForever: "Delete forever", deleteAccount: "Delete account", cancel: "Cancel",
      save: "Save", saving: "Saving…", saved: "Saved!", saveChanges: "Save changes",
      previewSite: "Preview site", unsavedTitle: "Unsaved changes",
      unsavedBody: "You have unsaved changes. Save before leaving or discard them?",
      stay: "Stay", discard: "Discard", saveLeave: "Save & leave",
      deleteAccountWarning: "This action cannot be undone. All your business pages and account data will be permanently erased.",
      deleteConfirmLabel: "Type DELETE to confirm",
      nav: {
        branding: "Branding", theme: "Theme", images: "Images", services: "Services",
        contact: "Contact", stats: "Stats", hours: "Hours", social: "Social", reviews: "Reviews",
      },
      branding: {
        businessName: "Business name", tagline: "Tagline", aboutDescription: "About description",
        category: "Category", categoryNote: "Auto-set from Google Places · cannot be changed",
        aiFill: "AI fill",
      },
      theme: {
        mode: "Mode", light: "Light", dark: "Dark", accentColor: "Accent colour",
        cornerRoundness: "Corner roundness", sharp: "Sharp", rounded: "Rounded", pill: "Pill",
      },
      images: { gallery: "Gallery", noGallery: "No gallery images.", aboutImage: "About Us image", pasteUrl: "Or paste any image URL…" },
      services: {
        noServicesTitle: "No services added yet",
        noServicesBody: "Add your services so customers know what you offer.",
        serviceLabel: "Service", serviceName: "Service name", description: "Description",
        remove: "Remove", addService: "Add service", briefDesc: "Brief description...",
      },
      contact: { phone: "Phone", email: "Email", address: "Address", addressNote: "Set during registration · cannot be changed" },
      stats: { years: "Years in business", clientsReviews: "Clients / Reviews", rating: "Rating", autoFetched: "Auto-fetched from Google Places" },
      hours: { placeholder: "9am – 6pm or Closed" },
      reviews: { noReviews: "No reviews imported.", note: "Reviews imported from Google Maps · cannot be modified." },
      days: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" },
      toasts: {
        loggedOut: "Logged out", imported: "Business imported!", importFailed: "Failed to import business",
        deleted: "Account deleted.", deleteFailed: "Failed to delete account",
        saving: "Saving changes…", saved: "Changes saved!", saveFailed: "Failed to save",
      },
    },
  },
  ar: {
    nav: {
      pricing: "الأسعار", contact: "تواصل معنا", legal: "قانوني",
      terms: "شروط الخدمة", privacy: "سياسة الخصوصية", refund: "سياسة الاسترداد",
      login: "تسجيل الدخول", getStarted: "ابدأ الآن",
    },
    footer: {
      copyright: "جميع الحقوق محفوظة.",
      pricing: "الأسعار", login: "تسجيل الدخول", register: "إنشاء حساب",
      terms: "الشروط", privacy: "الخصوصية", refunds: "الاسترداد", contact: "تواصل",
    },
    home: {
      badge: "بدون برمجة. بدون استضافة. بدون تعقيد.",
      h1a: "فيسبوك أو خرائط جوجل",
      h1b: "حوّلهم إلى موقع ويب مذهل",
      hero: "لقد أخبرك عملاؤك بالفعل عبر ملفك التجاري على Google لماذا يختارونك، حوّل تلك التقييمات إلى موقع احترافي يحوّل الزوار إلى عملاء بدءاً من 8.25 درهم فقط شهرياً. بدون برمجة. بدون متاعب الاستضافة.",
      cta: "ابدأ الآن",
      features: [
        { title: "جاهز في 60 ثانية", desc: "الصق رابط Google Maps وسيكون موقعك حياً فوراً. بدون الحاجة لمطورين." },
        { title: "جلب جميع بياناتك", desc: "نحوّل التقييمات الحقيقية إلى رسائل واضحة تناسب نشاطك التجاري تلقائياً." },
        { title: "لا برمجة مطلوبة", desc: "غيّر أي نص أو صورة أو خدمة أو شهادة أو معلومات اتصال من لوحة التحكم في أي وقت." },
        { title: "أضف أو عدّل أي شيء", desc: "اعرض آراء العملاء الحقيقية بتقييمات النجوم. أضف أو عدّل ما تشاء." },
        { title: "محتوى بالذكاء الاصطناعي", desc: "أنشئ عناوين وشعارات وأوصافاً احترافية بنقرة واحدة. دع الذكاء الاصطناعي يكتب محتوى موقعك." },
        { title: "أرخص من متر بيتزا", desc: "تحصل على موقع تجاري احترافي بتكلفة زهيدة. 10 درهم فقط شهرياً." },
        { title: "تحسين آلي لمحركات البحث", desc: "أي موقع يُنشأ عبر syrflow.com يُحسَّن لمحركات البحث تلقائياً." },
        { title: "دعم النطاقات المخصصة", desc: "إذا رغبت في إضافة نطاق مخصص لموقعك، تواصل مع فريق الدعم." },
        { title: "لا يزال في مرحلة بيتا", desc: "لا نزال في مرحلة بيتا. ميزات رائعة ستكون متاحة قريباً. ترقّب!" },
      ],
    },
    pricing: {
      badge: "أسعار بسيطة أرخص من متر بيتزا",
      h1a: "وفّر تكاليف الاستضافة", h1b: "وفّر وقت التطوير",
      sub: "مع syrflow.com لا تحتاج إلى مطوّر موقع.",
      mostPopular: "الأكثر شعبية", fullyBooked: "المقاعد ممتلئة", loading: "جارٍ التحميل…",
      monthly: "شهرياً", billedAnnually: "درهم/سنة - يُحسب سنوياً",
      faqTitle: "الأسئلة الشائعة",
      faqSub: "كل ما تحتاج معرفته عن خططنا وميزاتنا",
      slotsLeft: (n) => `محدود · ${n} مقعد متبقٍ`,
    },
    contact: {
      title: "تواصل معنا",
      emailTitle: "راسلنا", emailSub: "للاستفسارات العامة والدعم",
      phoneTitle: "اتصل بنا", phoneSub: "الاثنين إلى الجمعة، 9 صباحاً - 6 مساءً بتوقيت الخليج",
      faqTitle: "الأسئلة الشائعة",
    },
    login: {
      returnHome: "العودة للرئيسية", welcome: "مرحباً بعودتك",
      sub: "سجّل دخولك لإدارة صفحة أعمالك",
      email: "البريد الإلكتروني", password: "كلمة المرور", forgot: "نسيت كلمة المرور؟",
      submit: "تسجيل الدخول", noAccount: "لا تملك حساباً؟",
      register: "إنشاء حساب", loggingIn: "جارٍ تسجيل الدخول…",
    },
    forgot: {
      returnHome: "العودة للرئيسية", title: "استعادة كلمة المرور",
      sub: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
      email: "البريد الإلكتروني", submit: "إرسال رابط الاستعادة", backToLogin: "العودة لتسجيل الدخول",
      checkEmail: "تحقق من بريدك الإلكتروني", sentTo: "أرسلنا رابط استعادة كلمة المرور إلى",
    },
    terms:   { title: "شروط الخدمة",       updated: "آخر تحديث: 28 أبريل 2026" },
    privacy: { title: "سياسة الخصوصية",   updated: "آخر تحديث: 28 أبريل 2026" },
    refund:  { title: "سياسة الاسترداد",  updated: "آخر تحديث: 28 أبريل 2026" },
    dataDeletion: {
      title: "طلب حذف البيانات",
      whatTitle: "البيانات التي نخزّنها",
      whatBody: "عند ربط صفحة Facebook الخاصة بك، تقرأ syrflow.com فقط المعلومات العامة لصفحتك (الاسم، بيانات الاتصال، الصور، التقييمات) لبناء موقع أعمالك. لا نخزّن بيانات اعتماد Facebook أو رسائلك الخاصة أو أي بيانات شخصية.",
      howTitle: "كيفية حذف بياناتك",
      howIntro: "لحذف جميع بياناتك من syrflow.com، لديك خياران:",
      opt1Title: "من لوحة التحكم:",
      opt1Body: "سجّل دخولك إلى syrflow.com، اذهب إلى لوحة التحكم، افتح القائمة وانقر على «حذف الحساب». سيؤدي ذلك إلى إزالة جميع بيانات أعمالك وحسابك فوراً.",
      opt2Title: "عبر البريد الإلكتروني:",
      opt2Body: "أرسل طلب حذف إلى support@syrflow.com بعنوان «طلب حذف البيانات» وعنوان بريدك الإلكتروني المسجّل. سنعالجه خلال 30 يوماً.",
      fbTitle: "إزالة الوصول من Facebook",
      fbPre: "لإزالة وصول syrflow.com إلى صفحات Facebook في أي وقت، اذهب إلى",
      fbLink: "إعدادات تطبيقات Facebook",
      fbPost: "وأزل syrflow.com من القائمة. سيؤدي ذلك إلى إلغاء وصولنا لصفحاتك فوراً.",
      contactTitle: "التواصل",
      contactBody: "لأي استفسارات تتعلق بالبيانات، راسلنا على",
    },
    dashboard: {
      logOut: "تسجيل الخروج", yourPages: "صفحاتك", edit: "تعديل", view: "عرض",
      noPagesYet: "لا توجد صفحات أعمال بعد",
      noPagesBody: "الصق رابط Google Maps أدناه لاستيراد نشاطك التجاري.",
      import: "استيراد", deleteMyAccount: "حذف حسابي",
      deleteAccountTitle: "حذف الحساب؟",
      deleteAccountBody: "سيؤدي هذا إلى إزالة حسابك نهائياً. اكتب DELETE للتأكيد.",
      deleteForever: "حذف نهائياً", deleteAccount: "حذف الحساب", cancel: "إلغاء",
      save: "حفظ", saving: "جارٍ الحفظ…", saved: "تم الحفظ!", saveChanges: "حفظ التغييرات",
      previewSite: "معاينة الموقع", unsavedTitle: "تغييرات غير محفوظة",
      unsavedBody: "لديك تغييرات غير محفوظة. هل تريد الحفظ قبل المغادرة أم التجاهل؟",
      stay: "البقاء", discard: "تجاهل", saveLeave: "حفظ ومغادرة",
      deleteAccountWarning: "لا يمكن التراجع عن هذا الإجراء. ستُحذف جميع صفحات أعمالك وبيانات حسابك نهائياً.",
      deleteConfirmLabel: "اكتب DELETE للتأكيد",
      nav: {
        branding: "العلامة التجارية", theme: "المظهر", images: "الصور", services: "الخدمات",
        contact: "التواصل", stats: "الإحصائيات", hours: "أوقات العمل",
        social: "التواصل الاجتماعي", reviews: "التقييمات",
      },
      branding: {
        businessName: "اسم النشاط التجاري", tagline: "الشعار", aboutDescription: "وصف من نحن",
        category: "الفئة", categoryNote: "يُضبط تلقائياً من Google Places · لا يمكن تغييره",
        aiFill: "ملء بالذكاء الاصطناعي",
      },
      theme: {
        mode: "الوضع", light: "فاتح", dark: "داكن", accentColor: "لون التمييز",
        cornerRoundness: "استدارة الزوايا", sharp: "حادة", rounded: "مدوّرة", pill: "بيضاوية",
      },
      images: { gallery: "معرض الصور", noGallery: "لا توجد صور في المعرض.", aboutImage: "صورة من نحن", pasteUrl: "أو الصق رابط أي صورة…" },
      services: {
        noServicesTitle: "لم تُضف أي خدمات بعد",
        noServicesBody: "أضف خدماتك حتى يعرف العملاء ما تقدمه.",
        serviceLabel: "الخدمة", serviceName: "اسم الخدمة", description: "الوصف",
        remove: "إزالة", addService: "إضافة خدمة", briefDesc: "وصف مختصر...",
      },
      contact: { phone: "الهاتف", email: "البريد الإلكتروني", address: "العنوان", addressNote: "يُضبط عند التسجيل · لا يمكن تغييره" },
      stats: { years: "سنوات في العمل", clientsReviews: "العملاء / التقييمات", rating: "التقييم", autoFetched: "يُجلب تلقائياً من Google Places" },
      hours: { placeholder: "9ص – 6م أو مغلق" },
      reviews: { noReviews: "لم تُستورد أي تقييمات.", note: "التقييمات مستوردة من Google Maps · لا يمكن تعديلها." },
      days: { Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت", Sunday: "الأحد" },
      toasts: {
        loggedOut: "تم تسجيل الخروج", imported: "تم استيراد النشاط التجاري!", importFailed: "فشل استيراد النشاط التجاري",
        deleted: "تم حذف الحساب.", deleteFailed: "فشل حذف الحساب",
        saving: "جارٍ حفظ التغييرات…", saved: "تم حفظ التغييرات!", saveFailed: "فشل الحفظ",
      },
    },
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: T.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (stored === "ar") {
        setLangState("ar");
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
      }
    } catch {}
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
