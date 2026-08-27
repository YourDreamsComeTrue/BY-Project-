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
        const fileName = `${titleFolder.replace('-', '')}.js`;
        const dataPath = `../07-content/${lessonFolder}/${titleFolder}/${fileName}`;
        
        const dataModule = await import(dataPath);
        currentExerciseData = dataModule.titleData; // حفظ البيانات للاستخدام

        // تحديث نص العنوان الرئيسي
        const headingElement = document.getElementById("title-heading");
        if (headingElement && currentExerciseData.heading) {
            headingElement.textContent = currentExerciseData.heading;
        }
    } catch (error) {
        console.error("تعذر تحميل ملف البيانات من المسار المحدد:", error);
    }
}

// 5. ربط أزرار التنقل لفتح المحتويات في صفحة العرض الموحدة
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

    if (tab === "rituels") {
        url = getRitualPath(ritualType);
    } else {
        // توجيه الأزرار (watch, explain, summary) إلى صفحة عرض موحدة تعتمد على البيانات
        url = `view.html?type=${tab}&lesson=${lessonFolder}&title=${titleFolder}`;
    }

    if (url) {
        window.open(url, '_blank'); // فتح الرابط في نافذة جديدة
    }
}

// 6. عرض التمرين فقط في الصفحة الحالية
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
