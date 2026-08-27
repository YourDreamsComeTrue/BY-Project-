import { lessonsIndex } from '../07-content/lesson.js';

async function initEngine() {
  const mainTitleElement = document.getElementById('lesson-title');
  const contentElement = document.getElementById('lesson-content');

  // 1. قراءة اسم مجلد الدرس من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const lessonFolder = urlParams.get('lesson') || 'lesson-00001';

  // 2. تعيين العنوان الرئيسي فوراً
  const lessonInfo = lessonsIndex ? lessonsIndex.find(item => item.id === lessonFolder) : null;
  if (mainTitleElement) {
    mainTitleElement.textContent = lessonInfo ? lessonInfo.mainTitle : "عنوان الدرس غير محدد";
  }

  // 3. استدعاء ملف lesson2.js
  try {
    const lessonModule = await import(`../07-content/${lessonFolder}/lesson2.js`);
    const titlesList = lessonModule.default;

    if (contentElement && Array.isArray(titlesList)) {
      contentElement.innerHTML = '';

      titlesList.forEach(item => {
        const data = item.titleData || item;

        const titleHeader = document.createElement('h2');
        titleHeader.className = 'sub-title';
        titleHeader.textContent = data.heading || item.title || 'عنوان فرعي';

        const sectionBody = document.createElement('div');
        sectionBody.className = 'title-body';

        const explainContent = data.explain ? data.explain.content : '';
        const summaryContent = data.summary ? data.summary.content : '';
        const fallbackContent = item.content || '';

        sectionBody.innerHTML = (explainContent || summaryContent) 
          ? (explainContent + summaryContent) 
          : fallbackContent;

        contentElement.appendChild(titleHeader);
        contentElement.appendChild(sectionBody);
      });
    }
  } catch (err) {
    console.error("تفاصيل الخطأ:", err);
    if (contentElement) {
      contentElement.innerHTML = `<p style="color:red; direction:ltr; text-align:left; font-family:monospace;">${err.message}</p>`;
    }
  }
}

initEngine();

