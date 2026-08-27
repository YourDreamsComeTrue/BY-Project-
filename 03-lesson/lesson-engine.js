import { lessonsIndex } from '../07-content/lesson.js';

async function initEngine() {
  const mainTitleElement = document.getElementById('lesson-title');
  const contentElement = document.getElementById('lesson-content');

  // 1. قراءة اسم مجلد الدرس من الرابط (الافتراضي: lesson-00001)
  const urlParams = new URLSearchParams(window.location.search);
  const lessonFolder = urlParams.get('lesson') || 'lesson-00001';

  // 2. التثبت من وجود الدرس في الفهرس الرئيسي
  const lessonInfo = lessonsIndex.find(item => item.id === lessonFolder);
  if (lessonInfo && mainTitleElement) {
    mainTitleElement.textContent = lessonInfo.mainTitle;
  }

  // 3. استدعاء ملف lesson2.js الموحد من داخل مجلد الدرس المحدد
  try {
    const lessonModule = await import(`../07-content/${lessonFolder}/lesson2.js`);
    const titlesList = lessonModule.default; // المصفوفة التي تضم كافة العناوين

    if (contentElement && Array.isArray(titlesList)) {
      contentElement.innerHTML = ''; // تفريغ المحتوى البدائي

      // 4. عرض كافة العناوين والمحتويات التابعة للدرس تباعاً
      titlesList.forEach(item => {
        // دعم قراءة titleData أو الكائن المباشر
        const data = item.titleData || item;

        // إنشاء عنصر العنوان الرئيسي للفرع
        const titleHeader = document.createElement('h2');
        titleHeader.className = 'sub-title';
        titleHeader.textContent = data.heading || item.title || 'عنوان بدون اسم';

        // إنشاء حاوي المحتوى (الشرح + الملخص أو المحتوى العادي)
        const sectionBody = document.createElement('div');
        sectionBody.className = 'title-body';
        
        const explainContent = data.explain ? data.explain.content : '';
        const summaryContent = data.summary ? data.summary.content : '';
        const fallbackContent = item.content || '';

        // دمج المحتويات المتاحة
        sectionBody.innerHTML = (explainContent || summaryContent) 
          ? (explainContent + summaryContent) 
          : fallbackContent;

        // إضافتهم لصفحة HTML
        contentElement.appendChild(titleHeader);
        contentElement.appendChild(sectionBody);
      });
    }
  } catch (err) {
    console.error("خطأ أثناء استدعاء عناوين الدرس:", err);
    if (contentElement) {
      contentElement.innerHTML = "<p>تعذر تحميل عناوين هذا الدرس. تأكد من وجود ملف lesson2.js داخل المجلد.</p>";
    }
  }
}

initEngine();
