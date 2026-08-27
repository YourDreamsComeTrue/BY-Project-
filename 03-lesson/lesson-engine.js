// 03-lesson/lesson-engine.js
import { lessonsIndex } from '../07-content/lesson.js';

async function initEngine() {
  const titleElement = document.getElementById('lesson-title');
  const contentElement = document.getElementById('lesson-content');

  // 1. قراءة المسار الممرر في الرابط (مثل: ?lesson=lesson-00001)
  const urlParams = new URLSearchParams(window.location.search);
  const lessonParam = urlParams.get('lesson') || 'lesson-00001';

  // 2. البحث عن الدرس في الفهرس سواءً بالـ ID أو باسم الملف
  const currentLesson = lessonsIndex.find(item => 
    item.file.includes(lessonParam) || item.id === lessonParam.replace('lesson-', '')
  );

  if (currentLesson) {
    // 3. كتابة العنوان في الأعلى
    if (titleElement) {
      titleElement.textContent = currentLesson.title;
    }

    // 4. استدعاء ملف الدرس التفصيلي (اختياري)
    try {
      const lessonModule = await import(currentLesson.file);
      if (contentElement && lessonModule.default && lessonModule.default.content) {
        contentElement.innerHTML = lessonModule.default.content;
      }
    } catch (err) {
      console.log("تم عرض العنوان بنجاح، ولم يتم العثور على محتوى إضافي.");
    }

  } else {
    if (titleElement) titleElement.textContent = "الدرس غير موجود";
  }
}

initEngine();
