export type LanguageCode = 'en' | 'hi' | 'bn';

export interface TranslationKeys {
  appName: string;
  tagline: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  forgotPasswordLink: string;
  loginButton: string;
  loggingIn: string;
  noAccountText: string;
  signUpLink: string;
  badge1Title: string;
  badge1Subtitle: string;
  badge2Title: string;
  badge2Subtitle: string;
  badge3Title: string;
  badge3Subtitle: string;
  usernameRequired: string;
  passwordRequired: string;
  passwordMinLength: string;
  createAccountTitle: string;
  createAccountSubtitle: string;
  fullNamePlaceholder: string;
  emailPhonePlaceholder: string;
  passwordRegisterPlaceholder: string;
  signUpButton: string;
  alreadyAccountText: string;
  loginLink: string;
  fullNameRequired: string;
  emailRequired: string;
  validEmailRequired: string;
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendResetInstructions: string;
  recoverySentTitle: string;
  recoverySentText: string;
  backToLogin: string;
  langEnglish: string;
  langHindi: string;
  langBangla: string;
  securityNotice?: string;
  rememberPasswordText?: string;
  termsNotice?: string;
  passwordStrengthNotice?: string;
  strongText?: string;
  mediumText?: string;
  weakText?: string;
  perfectText?: string;
}

export const translations: Record<LanguageCode, TranslationKeys> = {
  en: {
    appName: 'EasyBuy',
    tagline: 'Smart Shopping, Easy Living 💚',
    welcomeHeading: 'Welcome Back! 👋',
    welcomeSubtitle: 'Login to continue shopping with EasyBuy',
    usernamePlaceholder: 'Email ID',
    passwordPlaceholder: 'Password',
    forgotPasswordLink: 'Forgot Password?',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    noAccountText: "Don't have an account?",
    signUpLink: 'Sign Up ›',
    badge1Title: '100% Secure',
    badge1Subtitle: 'Payments',
    badge2Title: 'Fast Delivery',
    badge2Subtitle: 'At Doorstep',
    badge3Title: 'Best Quality',
    badge3Subtitle: 'Products',
    usernameRequired: 'Email ID is required',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    createAccountTitle: 'Create Account ✨',
    createAccountSubtitle: 'Join EasyBuy for smart shopping & instant deals.',
    fullNamePlaceholder: 'Full Name',
    emailPhonePlaceholder: 'Email ID',
    passwordRegisterPlaceholder: 'Password (min 6 chars)',
    signUpButton: 'Sign Up →',
    alreadyAccountText: 'Already have an account?',
    loginLink: 'Login',
    fullNameRequired: 'Full name is required',
    emailRequired: 'Email ID is required',
    validEmailRequired: 'Please enter a valid email address',
    forgotPasswordTitle: 'Forgot your password? 🔒',
    forgotPasswordSubtitle: "No worries. Enter your email ID and we'll send you a secure recovery link.",
    sendResetInstructions: 'Send Recovery Link →',
    recoverySentTitle: 'Recovery Sent!',
    recoverySentText: 'We sent password recovery instructions to your email.',
    backToLogin: 'Back to Login',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langBangla: 'বাংলা',
    securityNotice: 'Your information is securely protected.',
    rememberPasswordText: 'Remember your password?',
    termsNotice: "I agree to EasyBuy's Terms of Service & Privacy Policy",
    passwordStrengthNotice: 'Use 8+ characters with a mix of letters, numbers & symbols.',
    strongText: 'Strong',
    mediumText: 'Medium',
    weakText: 'Weak',
    perfectText: 'Perfect ✨',
  },

  hi: {
    appName: 'EasyBuy',
    tagline: 'स्मार्ट शॉपिंग, आसान जीवन 💚',
    welcomeHeading: 'वापसी पर आपका स्वागत है! 👋',
    welcomeSubtitle: 'EasyBuy के साथ खरीदारी जारी रखने के लिए लॉगिन करें',
    usernamePlaceholder: 'ईमेल आईडी (Email ID)',
    passwordPlaceholder: 'पासवर्ड (Password)',
    forgotPasswordLink: 'पासवर्ड भूल गए?',
    loginButton: 'लॉगिन करें',
    loggingIn: 'लॉगिन हो रहा है...',
    noAccountText: 'खाता नहीं है?',
    signUpLink: 'साइन अप करें ›',
    badge1Title: '100% सुरक्षित',
    badge1Subtitle: 'भुगतान',
    badge2Title: 'तेज़ डिलीवरी',
    badge2Subtitle: 'दरवाजे पर',
    badge3Title: 'सर्वोत्तम गुणवत्ता',
    badge3Subtitle: 'उत्पाद',
    usernameRequired: 'ईमेल आईडी आवश्यक है',
    passwordRequired: 'पासवर्ड आवश्यक है',
    passwordMinLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
    createAccountTitle: 'खाता बनाएं ✨',
    createAccountSubtitle: 'स्मार्ट शॉपिंग और त्वरित ऑफ़र के लिए EasyBuy से जुड़ें।',
    fullNamePlaceholder: 'पूरा नाम',
    emailPhonePlaceholder: 'ईमेल आईडी (Email ID)',
    passwordRegisterPlaceholder: 'पासवर्ड (न्यूनतम 6 अक्षर)',
    signUpButton: 'साइन अप करें →',
    alreadyAccountText: 'क्या आपके पास पहले से एक खाता है?',
    loginLink: 'लॉगिन करें',
    fullNameRequired: 'पूरा नाम आवश्यक है',
    emailRequired: 'ईमेल आईडी आवश्यक है',
    validEmailRequired: 'कृपया एक वैध ईमेल पता दर्ज करें',
    forgotPasswordTitle: 'पासवर्ड भूल गए? 🔒',
    forgotPasswordSubtitle: 'कोई बात नहीं। अपना ईमेल आईडी दर्ज करें और हम आपको एक सुरक्षित रिकवरी लिंक भेजेंगे।',
    sendResetInstructions: 'रिकवरी लिंक भेजें →',
    recoverySentTitle: 'रिकवरी भेज दी गई!',
    recoverySentText: 'हमने आपके ईमेल पर पासवर्ड रीसेट निर्देश भेज दिए हैं।',
    backToLogin: 'लॉगिन पर वापस जाएं',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langBangla: 'বাংলা',
    securityNotice: 'आपकी जानकारी सुरक्षित रूप से सुरक्षित है।',
    rememberPasswordText: 'अपना पासवर्ड याद आया?',
    termsNotice: 'मैं EasyBuy की सेवा की शर्तों और गोपनीयता नीति से सहमत हूं',
    passwordStrengthNotice: 'अक्षरों, संख्याओं और प्रतीकों के मिश्रण के साथ 8+ वर्णों का उपयोग करें।',
    strongText: 'मजबूत',
    mediumText: 'मध्यम',
    weakText: 'कमजोर',
    perfectText: 'परफेक्ट ✨',
  },

  bn: {
    appName: 'EasyBuy',
    tagline: 'স্মার্ট কেনাকাটা, সহজ জীবন 💚',
    welcomeHeading: 'স্বাগতম! 👋',
    welcomeSubtitle: 'EasyBuy-এ কেনাকাটা চালিয়ে যেতে লগইন করুন',
    usernamePlaceholder: 'ইউজারনেম (Username)',
    passwordPlaceholder: 'পাসওয়ার্ড (Password)',
    forgotPasswordLink: 'পাসওয়ার্ড ভুলে গেছেন?',
    loginButton: 'লগইন করুন',
    loggingIn: 'লগইন হচ্ছে...',
    noAccountText: 'অ্যাকাউন্ট নেই?',
    signUpLink: 'সাইন আপ করুন ›',
    badge1Title: '১০০% নিরাপদ',
    badge1Subtitle: 'পেমেন্ট',
    badge2Title: 'দ্রুত ডেলিভারি',
    badge2Subtitle: 'দরজায়',
    badge3Title: 'সেরা মানের',
    badge3Subtitle: 'পণ্য',
    usernameRequired: 'ইউজারনেম আবশ্যক',
    passwordRequired: 'পাসওয়ার্ড আবশ্যক',
    passwordMinLength: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে',
    createAccountTitle: 'অ্যাকাউন্ট তৈরি করুন ✨',
    createAccountSubtitle: 'স্মার্ট কেনাকাটা ও দারুণ অফারের জন্য EasyBuy-এ যোগ দিন।',
    fullNamePlaceholder: 'সম্পূর্ণ নাম',
    emailPhonePlaceholder: 'ইমেল আইডি (Email ID)',
    passwordRegisterPlaceholder: 'পাসওয়ার্ড (নূন্যতম ৬ অক্ষর)',
    signUpButton: 'সাইন আপ করুন →',
    alreadyAccountText: 'ইতিমধ্যেই একটি অ্যাকাউন্ট আছে?',
    loginLink: 'লগইন করুন',
    fullNameRequired: 'সম্পূর্ণ নাম আবশ্যক',
    emailRequired: 'ইমেল আইডি আবশ্যক',
    validEmailRequired: 'একটি সঠিক ইমেল ঠিকানা লিখুন',
    forgotPasswordTitle: 'পাসওয়ার্ড ভুলে গেছেন? 🔒',
    forgotPasswordSubtitle: 'চিন্তা করবেন না। আপনার ইমেল আইডি লিখুন এবং আমরা আপনাকে একটি সুরক্ষিত পুনরুদ্ধার লিঙ্ক পাঠাব।',
    sendResetInstructions: 'রিকভারি লিঙ্ক পাঠান →',
    recoverySentTitle: 'পুনরুদ্ধার ইমেল পাঠানো হয়েছে!',
    recoverySentText: 'আমরা আপনার ইমেলে পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠিয়েছি।',
    backToLogin: 'লগইনে ফিরে যান',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langBangla: 'বাংলা',
    securityNotice: 'আপনার তথ্য নিরাপদে সুরক্ষিত।',
    rememberPasswordText: 'পাসওয়ার্ড মনে আছে?',
    termsNotice: 'আমি EasyBuy-এর পরিষেবার শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত',
    passwordStrengthNotice: 'অক্ষর, সংখ্যা এবং চিহ্নের মিশ্রণ সহ ৮+ টি অক্ষর ব্যবহার করুন।',
    strongText: 'শক্তিশালী',
    mediumText: 'মাঝারি',
    weakText: 'দুর্বল',
    perfectText: 'পারফেক্ট ✨',
  },
};
