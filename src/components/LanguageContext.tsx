"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'ar' | 'en';

const translations = {
  ar: {
    common: {
      currency: 'ر.س',
      loading: 'جاري التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      close: 'إغلاق',
      confirm: 'تأكيد',
      back: 'رجوع',
      search: 'بحث',
      all: 'الكل',
      yes: 'نعم',
      no: 'لا',
      actions: 'الإجراءات',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الجوال',
      status: 'الحالة',
      date: 'التاريخ',
      notes: 'ملاحظات',
      send: 'إرسال',
      print: 'طباعة',
    },
    nav: {
      home: 'الرئيسية',
      apply: 'قدّم طلبك',
      portal: 'بوابة العميل',
      admin: 'لوحة الإدارة',
      login: 'دخول الموظفين',
      logout: 'تسجيل الخروج',
      services: 'خدماتنا',
      about: 'من نحن',
    },
    hero: {
      badge: 'الحل الأمثل للتمويل التجاري',
      title: 'تمويل أعمالك\nبخطوة واحدة',
      subtitle: 'كويك ديل تتيح للمنشآت التجارية الحصول على تمويل مرن وسريع بأقل المتطلبات وأعلى المعايير المهنية.',
      cta: 'قدّم طلبك الآن',
      secondary: 'اعرف أكثر',
    },
    stats: {
      clients: 'عميل راضٍ',
      funded: 'مليون تمويل معتمد',
      time: 'ساعة متوسط الإنجاز',
      success: 'نسبة الموافقة',
    },
    services: {
      title: 'خدماتنا',
      subtitle: 'نقدم حلولاً متكاملة تلبي احتياجات منشأتك',
      finance: {
        title: 'تمويل المنشآت',
        desc: 'حلول تمويلية مرنة للمنشآت التجارية بمختلف أحجامها وقطاعاتها.',
      },
      consulting: {
        title: 'الاستشارات المالية',
        desc: 'فريق من الخبراء لدراسة وضعك المالي وتقديم أفضل الخيارات.',
      },
      fast: {
        title: 'سرعة الإنجاز',
        desc: 'معالجة الطلبات بأسرع وقت ممكن مع الحفاظ على أعلى معايير الجودة.',
      },
      secure: {
        title: 'خصوصية تامة',
        desc: 'بياناتك محمية بأعلى معايير الأمان والسرية المهنية.',
      },
    },
    faq: {
      title: 'الأسئلة الشائعة',
      q1: 'ما هي متطلبات التمويل الأساسية؟',
      a1: 'سجل تجاري ساري المفعول، كشف حساب بنكي، وإثبات هوية المالك.',
      q2: 'كم تستغرق مدة الدراسة؟',
      a2: 'نهدف لإتمام الدراسة والرد خلال 24 إلى 48 ساعة عمل.',
      q3: 'هل يمكن التقديم لمنشأة حديثة؟',
      a3: 'نعم، نقبل المنشآت التي لا يقل عمرها عن 6 أشهر بسجل نشط.',
      q4: 'ما الجهات التمويلية المتاحة؟',
      a4: 'نتعاون مع كبرى المؤسسات المالية المرخصة في المملكة العربية السعودية.',
    },
    apply: {
      title: 'تقديم طلب تمويل',
      steps: ['بياناتك الشخصية', 'معلومات المنشأة', 'الوضع المالي'],
      next: 'التالي',
      prev: 'السابق',
      submit: 'إرسال الطلب',
      success: 'تم إرسال طلبك بنجاح',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      personal: {
        name: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الجوال',
        role: 'صفتك في المنشأة',
        owner: 'مالك',
        employee: 'موظف',
      },
      company: {
        name: 'اسم المنشأة',
        registry: 'رقم السجل التجاري',
        registryAge: 'عمر السجل (سنوات)',
        transferred: 'هل تم نقل السجل خلال 6 أشهر؟',
      },
      financial: {
        daily: 'متوسط الدخل اليومي (ر.س)',
        annual: 'الدخل السنوي التقريبي (ر.س)',
        bank: 'البنك الرئيسي للمنشأة',
        hasObligations: 'هل يوجد التزامات تمويلية قائمة؟',
        totalObligation: 'إجمالي الالتزام (ر.س)',
        fundingEntity: 'جهة التمويل',
        remaining: 'المبلغ المتبقي (ر.س)',
      },
    },
    portal: {
      title: 'بوابة العميل',
      myApp: 'طلبي',
      status: 'حالة الطلب',
      submittedOn: 'تاريخ التقديم',
      timeline: 'مسار الطلب',
      noApp: 'لا يوجد طلب مرتبط بحسابك',
      goApply: 'قدّم طلبًا جديدًا',
    },
    admin: {
      title: 'لوحة الإدارة',
      applicants: 'الطلبات',
      analytics: 'الإحصاءات',
      staff: 'فريق العمل',
      accessRequests: 'طلبات الوصول',
      settings: 'الإعدادات',
      login: {
        title: 'دخول الإدارة',
        email: 'البريد أو اسم المستخدم',
        password: 'كلمة المرور',
        submit: 'دخول',
      },
      status: {
        Pending: 'قيد الانتظار',
        'Under Review': 'قيد الدراسة',
        Completed: 'مكتمل',
        Cancelled: 'ملغي',
      },
      payment: {
        Unpaid: 'غير مدفوع',
        Sent: 'تم الإرسال',
        Paid: 'مدفوع',
      },
      staff: {
        title: 'إدارة فريق العمل',
        addMember: 'إضافة عضو',
        role: 'الصلاحية',
        admin: 'مدير',
        employee: 'موظف',
        noStaff: 'لا يوجد أعضاء في الفريق حالياً',
      },
      accessReq: {
        title: 'طلبات الوصول للبيانات',
        requested: 'طلب الوصول إلى بيانات',
        approve: 'قبول',
        reject: 'رفض',
        pending: 'معلّق',
        approved: 'مقبول',
        rejected: 'مرفوض',
        noRequests: 'لا توجد طلبات وصول حالياً',
      },
      analytics: {
        title: 'الإحصاءات والتقارير',
        totalApps: 'إجمالي الطلبات',
        pending: 'قيد الانتظار',
        completed: 'مكتملة',
        underReview: 'قيد الدراسة',
        cancelled: 'ملغية',
        withObligations: 'لديهم التزامات',
        avgIncome: 'متوسط الدخل السنوي',
        recentActivity: 'آخر النشاطات',
        byStatus: 'توزيع الطلبات حسب الحالة',
        monthly: 'الطلبات الشهرية',
      },
    },
  },
  en: {
    common: {
      currency: 'SAR',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      search: 'Search',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      actions: 'Actions',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      date: 'Date',
      notes: 'Notes',
      send: 'Send',
      print: 'Print',
    },
    nav: {
      home: 'Home',
      apply: 'Apply Now',
      portal: 'Client Portal',
      admin: 'Admin Panel',
      login: 'Staff Login',
      logout: 'Logout',
      services: 'Services',
      about: 'About',
    },
    hero: {
      badge: 'The Optimal Business Financing Solution',
      title: 'Finance Your Business\nin One Step',
      subtitle: 'Quick Deal enables commercial establishments to access flexible, fast financing with minimal requirements and the highest professional standards.',
      cta: 'Apply Now',
      secondary: 'Learn More',
    },
    stats: {
      clients: 'Satisfied Clients',
      funded: 'Million SAR Funded',
      time: 'Avg. Hours to Complete',
      success: 'Approval Rate',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive solutions tailored to your business needs',
      finance: {
        title: 'Business Financing',
        desc: 'Flexible financing solutions for commercial establishments of all sizes and sectors.',
      },
      consulting: {
        title: 'Financial Consulting',
        desc: 'A team of experts to analyze your financial situation and offer the best options.',
      },
      fast: {
        title: 'Fast Processing',
        desc: 'Applications processed at the fastest possible pace while maintaining top quality.',
      },
      secure: {
        title: 'Full Privacy',
        desc: 'Your data is protected by the highest security and professional confidentiality standards.',
      },
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'What are the basic financing requirements?',
      a1: 'A valid commercial registration, bank statement, and owner ID proof.',
      q2: 'How long does evaluation take?',
      a2: 'We aim to complete evaluation and respond within 24 to 48 business hours.',
      q3: 'Can a new business apply?',
      a3: 'Yes, we accept businesses with at least 6 months of active registration.',
      q4: 'What financing entities are available?',
      a4: 'We work with major licensed financial institutions in Saudi Arabia.',
    },
    apply: {
      title: 'Financing Application',
      steps: ['Personal Info', 'Business Info', 'Financial Status'],
      next: 'Next',
      prev: 'Previous',
      submit: 'Submit Application',
      success: 'Application submitted successfully',
      username: 'Username',
      password: 'Password',
      personal: {
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        role: 'Your role in the business',
        owner: 'Owner',
        employee: 'Employee',
      },
      company: {
        name: 'Business Name',
        registry: 'Commercial Registration Number',
        registryAge: 'Registration Age (years)',
        transferred: 'Was registration transferred within 6 months?',
      },
      financial: {
        daily: 'Average Daily Income (SAR)',
        annual: 'Approximate Annual Income (SAR)',
        bank: 'Primary Business Bank',
        hasObligations: 'Do you have existing financing obligations?',
        totalObligation: 'Total Obligation (SAR)',
        fundingEntity: 'Funding Entity',
        remaining: 'Remaining Amount (SAR)',
      },
    },
    portal: {
      title: 'Client Portal',
      myApp: 'My Application',
      status: 'Application Status',
      submittedOn: 'Submitted On',
      timeline: 'Application Timeline',
      noApp: 'No application linked to your account',
      goApply: 'Submit a New Application',
    },
    admin: {
      title: 'Admin Dashboard',
      applicants: 'Applications',
      analytics: 'Analytics',
      staff: 'Staff',
      accessRequests: 'Access Requests',
      settings: 'Settings',
      login: {
        title: 'Admin Access',
        email: 'Email or Username',
        password: 'Password',
        submit: 'Sign In',
      },
      status: {
        Pending: 'Pending',
        'Under Review': 'Under Review',
        Completed: 'Completed',
        Cancelled: 'Cancelled',
      },
      payment: {
        Unpaid: 'Unpaid',
        Sent: 'Sent',
        Paid: 'Paid',
      },
      staff: {
        title: 'Staff Management',
        addMember: 'Add Member',
        role: 'Role',
        admin: 'Admin',
        employee: 'Employee',
        noStaff: 'No staff members found',
      },
      accessReq: {
        title: 'Data Access Requests',
        requested: 'Requested access to data for',
        approve: 'Approve',
        reject: 'Reject',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        noRequests: 'No access requests at this time',
      },
      analytics: {
        title: 'Analytics & Reports',
        totalApps: 'Total Applications',
        pending: 'Pending',
        completed: 'Completed',
        underReview: 'Under Review',
        cancelled: 'Cancelled',
        withObligations: 'With Obligations',
        avgIncome: 'Avg Annual Income',
        recentActivity: 'Recent Activity',
        byStatus: 'Applications by Status',
        monthly: 'Monthly Applications',
      },
    },
  },
};

type Translations = typeof translations.ar;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: translations.ar,
  dir: 'rtl',
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    const stored = (localStorage.getItem('qd-lang') as Lang) || 'ar';
    setLangState(stored);
    document.documentElement.lang = stored;
    document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('qd-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang] as Translations,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
        toggleLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
