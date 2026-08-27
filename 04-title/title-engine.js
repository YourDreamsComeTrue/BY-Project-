let currentExerciseData = null;

// 1. استخراج متغيرات الرابط (URL Parameters)
const urlParams = new URLSearchParams(window.location.search);
const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
const titleFolder = urlParams.get('title') || 'title-02';
const exerciseFile = urlParams.get('ex') || 'exercise01';
const ritualType = urlParams.get('ritual') || 'seed';

// 2. دوال المسارات
function getRitualPath(type) {
    return `../06-rituels/${type}/${type}.html`;
}

function getExerciseIframePath(lesson, title, file) {
    return `../05-exercise/exercise.html?lesson=${lesson}&title=${title}&ex=${file}`;
}

// 3. تحميل البيانات والواجهة عند اكتمال الصفحة
document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData(); // قراءة الملف الديناميكي وتحديث العنوان
    setupTabNavigation();  // إعداد روابط النوافذ الخارجية
    loadExerciseIframe();  // عرض التمرين في الصفحة الحالية
});

// 4. استدعاء ملف البيانات ديناميكياً من مسار 07-content
async function loadTitleData() {
    try {
        // تحويل 'title-02' إلى 'title02.js' لتطابق اسم الملف
        const fileName = `${titleFolder.replace('-', '')}.js`;
        const dataPath = `../07-content/${lessonFolder}/${titleFolder}/${fileName}`;
        
        // استدعاء الملف ديناميكياً
        const dataModule = await import(dataPath);
        const titleData = dataModule.titleData;

        // تحديث نص العنوان الرئيسي
        const headingElement = document.getElementById("title-heading");
        if (headingElement && titleData.heading) {
            headingElement.textContent = titleData.heading;
        }
    } catch (error) {
        console.error("تعذر تحميل ملف البيانات من المسار المحدد:", error);
    }
}

// 5. ربط أزرار التنقل لفتح المحتويات في نوافذ جديدة
function setupTabNavigation() {
    const buttons = document.querySelectorAll(".icon-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            openContentInNewTab(tab);
        });
    });
}

function openContentInNewTab(tab) {
    let url = "";

    switch (tab) {
        case "watch":
            url = `watch.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "explain":
            url = `explain.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "summary":
            url = `summary.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "rituels":
            url = getRitualPath(ritualType);
            break;
    }

    if (url) {
        window.open(url, '_blank'); // فتح الرابط في نافذة/تبويب جديد
    }
}

// 6. عرض التمرين فقط في الصفحة الحالية داخل iframe
function loadExerciseIframe() {
    const container = document.getElementById("exercises-container");
    if (!container) return;

    const exerciseUrl = getExerciseIframePath(lessonFolder, titleFolder, exerciseFile);

    container.innerHTML = `
        <iframe 
            src="${exerciseUrl}" 
            class="exercise-frame"
            style="width:100%; min-height:350px; border:none; border-radius:12px;">
        </iframe>
    `;
                    }
