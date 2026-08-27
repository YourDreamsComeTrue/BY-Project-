let currentExerciseData = null;

// 1. استخراج متغيرات الرابط
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

document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    loadExerciseIframe();
});

// 3. فتح المحتوى في صفحة/نافذة جديدة عند الضغط على الأزرار
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
            // يمكنك وضع رابط صفحة المشاهدة الخاصة بالدرس هنا
            url = `watch.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "explain":
            // يمكنك وضع رابط صفحة الشرح هنا
            url = `explain.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "summary":
            // يمكنك وضع رابط صفحة الملخص هنا
            url = `summary.html?lesson=${lessonFolder}&title=${titleFolder}`;
            break;
        case "rituels":
            // فتح رابط الطقوس مباشرة في نافذة جديدة
            url = getRitualPath(ritualType);
            break;
    }

    if (url) {
        window.open(url, '_blank'); // يفتح الرابط في تبويب/صفحة جديدة
    }
}

// 4. عرض التمرين فقط داخل الصفحة الحالية
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
