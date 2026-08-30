export const lessonsConfig = [
  {
    id: "l000001",
    order: 1,
    title: "الدرس الأول: إدارة المال والوعي المالي",
    description: "مقدمة شاملة لتنظيم الموارد المالية الشخصية.",
    type: "video", // video | short | lecture
    topics: ["مال", "تطوير_ذات"],
    path: "./lesson.html?id=l000001" // المسار أصبح مباشر داخل نفس المجلد
  },
  {
    id: "l000002",
    order: 2,
    title: "الدرس الثاني: بناء العلاقات المتوازنة",
    description: "خطوات عملية لبناء بيئة اجتماعية صحية.",
    type: "lecture",
    topics: ["علاقات", "تطوير_ذات"],
    path: "./lesson.html?id=l000002"
  },
  {
    id: "l000003",
    order: 3,
    title: "مفهوم جديد في استثمار الوقت والمال",
    description: "مقطع سريع يوضح العلاقة بين المال والعلاقات.",
    type: "short",
    topics: ["مال", "علاقات"],
    path: "./lesson.html?id=l000003"
  }
];
