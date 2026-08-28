let currentTitleData = null;

// 1. استخراج المعرّف من الرابط (مثال: title.html?id=l000001-t02)
const urlParams = new URLSearchParams(window.location.search);
const titleId = urlParams.get('id') || 'l000001-t02';

// 2. تحميل البيانات عند اكتمال تحميل عناصر DOM
document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData();
    setupTabNavigation();
    loadExerciseIframe();
});

// 3. التحميل الديناميكي لبيانات العنوان من مجلد data
async function loadTitleData() {
    try {
        // المسار المستقر بناءً على المعرّف
        const dataModule = await import(`./data/title-${titleId}.js`);
        const data = dataModule.default || dataModule.titleData;
        
        // استخراج titleData في حال كان الملف مغلفاً به
        currentTitleData = data.titleData ? data.titleData : data;

        // تحديث نص العنوان الرئيسي
        const headingElement = document.getElementById("title-heading");
        if (headingElement && currentTitleData.heading) {
            headingElement.textContent = currentTitleData.heading;
        }
    } catch (error) {
        console.error("تعذر تحميل ملف بيانات العنوان:", error);
        const headingElement = document.getElementById("title-heading");
        if (headingElement) {
            headingElement.textContent = "تعذر تحميل عنوان الدرس.";
        }
    }
}

// 4. ربط أزرار التنقل (Watch, Explain, Summary, Rituals)
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
        // استدعاء الطقوس بناءً على المسار المحدد في البيانات أو مسار افتراضي
        const ritualPath = currentTitleData?.rituelsFile || "../06-rituels/rituels-index.html";
        url = ritualPath;
    } else {
        // توجيه الأزرار (watch, explain, summary) مع تمرير معرّف العنوان الحالي
        url = `view.html?type=${tab}&id=${titleId}`;
    }

    if (url) {
        window.open(url, '_blank');
    }
}

// 5. عرض التمارين داخل الصفحة بناءً على معرفات التمارين المسجلة
function loadExerciseIframe() {
    const container = document.getElementById("exercises-container");
    if (!container) return;

    // الحصول على أول تمرين في القائمة أو استخدام المعرف التلقائي
    let targetExerciseId = "l000001-t02-e01";

    if (currentTitleData && currentTitleData.exercises && currentTitleData.exercises.length > 0) {
        const firstEx = currentTitleData.exercises[0];
        // التعامل مع التمرين سواء كان المعرّف نصياً أو كائناً (Object)
        targetExerciseId = typeof firstEx === "string" ? firstEx : (firstEx.id || targetExerciseId);
    }

    // بناء رابط التمرين باستخدام المعرّف الديناميكي
    const exerciseUrl = `../05-exercise/exercise.html?id=${targetExerciseId}`;

    container.innerHTML = `
        <iframe 
            src="${exerciseUrl}" 
            class="exercise-frame"
            style="width:100%; min-height:350px; border:none; border-radius:12px;">
        </iframe>
    `;
            }
