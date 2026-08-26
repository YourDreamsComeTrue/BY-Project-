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
    // يستدعي صفحة exercise.html مع تمرير المتغيرات لها لتفتح التمرين بتصميمه الأصلي
    return `../05-exercise/exercise.html?lesson=${lesson}&title=${title}&ex=${file}`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    loadExerciseIframe();
});

// 3. إدارة التبويبات للأقسام الأربعة
function setupTabNavigation() {
    const buttons = document.querySelectorAll(".icon-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.getAttribute("data-tab");
            renderTabSection(tab);
        });
    });

    const defaultBtn = document.getElementById("btn-watch");
    if (defaultBtn) defaultBtn.click();
}

function renderTabSection(tab) {
    const container = document.getElementById("tab-content-area");
    if (!container) return;

    container.innerHTML = "";

    switch (tab) {
        case "watch":
            container.innerHTML = `<div class="content-box"><p>قسم المشاهدة جاهز لعرض الفيديو.</p></div>`;
            break;
        case "explain":
            container.innerHTML = `<div class="content-box"><p>محتوى الشرح والتوضيح للدرس.</p></div>`;
            break;
        case "summary":
            container.innerHTML = `<div class="content-box"><p>ملخص النقاط الأساسية للعنوان.</p></div>`;
            break;
        case "rituels":
            const iframeSrc = getRitualPath(ritualType);
            container.innerHTML = `
                <iframe 
                    src="${iframeSrc}" 
                    class="rituels-frame"
                    style="width:100%; height:500px; border:none; border-radius:12px;">
                </iframe>
            `;
            break;
    }
}

// 4. تحميل صفحة التمرين الأصلي داخل iframe للحفاظ على التصميم 100%
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
