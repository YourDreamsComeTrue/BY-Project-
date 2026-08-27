// 03-lesson/lesson-engine.js
import { lessonsIndex } from '../07-content/lesson.js';

async function initEngine() {
  const titleElement = document.getElementById('lesson-title');
  const contentElement = document.getElementById('lesson-content');

  // 1. قراءة Parameter من الرابط (?lesson=lesson-00001 أو ?id=00001)
  const urlParams = new URLSearchParams(window.location.search);
  const rawParam = urlParams.get('lesson') || urlParams.get('id') || 'lesson-00001';

  // تنظيف النص المقروء (استخراج الأرقام فقط مثل 00001)
  const cleanId = rawParam.replace(/[^0-9]/g, '');

  // 2. البحث عن الدرس في الفهرس
  const currentLesson = lessonsIndex.find(item => 
    item.id === cleanId || item.file.includes(rawParam)
  );

  if (currentLesson) {
    // عرض العنوان
    if (titleElement) titleElement.textContent = currentLesson.title;

    // 3. استدعاء المحتوى التفصيلي ديناميكياً من مجلد 07-content
    try {
      // بناء المسار بالنسبة لمكان وجود lesson-engine.js
      const targetFile = currentLesson.file.replace('./', '');
      const lessonModule = await import(`../07-content/${targetFile}`);

      if (contentElement && lessonModule.default && lessonModule.default.content) {
        contentElement.innerHTML = lessonModule.default.content;
      }
    } catch (err) {
      console.error("خطأ في التحميل:", err);
      if (contentElement) {
        contentElement.innerHTML = "<p>تم إيجاد العنوان، لكن لم يتم العثور على ملف الدرس الفرعي.</p>";
      }
    }

  } else {
    if (titleElement) titleElement.textContent = "الدرس غير موجود";
    if (contentElement) contentElement.innerHTML = "<p>يرجى التأكد من رابط الدرس.</p>";
  }
}

initEngine();
