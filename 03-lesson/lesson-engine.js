import { lessonsIndex } from '../07-content/lesson.js';

async function initEngine() {
  const titleElement = document.getElementById('lesson-title');
  const contentElement = document.getElementById('lesson-content');
  const titlesListElement = document.getElementById('titles-list');

  // 1. عرض قائمة كل العناوين المتاحة في الأعلى مع إمكانية التنقل بينها
  if (titlesListElement) {
    titlesListElement.innerHTML = '';
    lessonsIndex.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `?id=${item.id}`;
      a.textContent = item.title;
      
      // تمييز الدرس الحالي في القائمة
      const currentId = new URLSearchParams(window.location.search).get('id') || "00001";
      if (item.id === currentId) {
        a.classList.add('active');
      }
      
      li.appendChild(a);
      titlesListElement.appendChild(li);
    });
  }

  // 2. قراءة الدرس المطلوب من رابط الصفحات (مثال: lesson.html?id=00001)
  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get('id') || "00001";

  // 3. البحث عن الدرس في الفهرس
  const currentLesson = lessonsIndex.find(item => item.id === activeId);

  if (currentLesson) {
    // عرض عنوان الدرس في الأعلى
    titleElement.textContent = currentLesson.title;

    // 4. استدعاء ملف الدرس التفصيلي dynamically
    try {
      const lessonModule = await import(currentLesson.file);
      if (lessonModule.default && lessonModule.default.content) {
        contentElement.innerHTML = lessonModule.default.content;
      }
    } catch (err) {
      contentElement.innerHTML = "<p>تنبيه: تم عرض العنوان بنجاح، لكن الملف التفصيلي للدرس غير موجود بعد.</p>";
    }
  } else {
    titleElement.textContent = "الدرس غير موجود";
    contentElement.innerHTML = "<p>الرجاء اختيار درس صحيح من القائمة.</p>";
  }
}

initEngine();

