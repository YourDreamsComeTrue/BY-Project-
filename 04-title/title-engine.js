let currentExerciseData = null;

// 1. استخراج متغيرات الرابط
const urlParams = new URLSearchParams(window.location.search);
const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
const titleFolder = urlParams.get('title') || 'title-01'; // القيمة الافتراضية
const exerciseFile = urlParams.get('ex') || 'exercise01';
const ritualType = urlParams.get('ritual') || 'seed';

// 2. دوال المسارات
function getRitualPath(type) {
    return `../06-rituels/${type}/${type}.html`;
}

function getExerciseIframePath(lesson, title, file) {
    return `../05-exercise/exercise.html?lesson=${lesson}&title=${title}&ex=${file}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    // تحميل بيانات العنوان ديناميكياً بناءً على متغير title من الرابط
    await loadTitleData();

    setupTabNavigation();
    loadExerciseIframe();
});

// دالة لجلب الملف الخاص بالعنوان (مثلاً title-02.js)
async function loadTitleData() {
    try {
        // استدعاء الملف بنفس الاسم الممرر في الرابط
        const dataModule = await import(`./${titleFolder}.js`);
        const titleData = dataModule.titleData;

        // تحديث عنوان الصفحة بالبيانات القادمة من الملف
        const headingElement = document.getElementById("title-heading");
        if (headingElement && titleData.heading) {
            headingElement.textContent = titleData.heading;
        }
    } catch (error) {
        console.error(`تعذر تحميل الملف: ${titleFolder}.js`, error);
    }
}

// 3. فتح المحتوى في صفحة جديدة عند الضغط على الأزرار
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
        window.open(url, '_blank');
    }
}

// 4. عرض التمرين
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
