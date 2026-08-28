let currentTitleData = null;

// 1. استخراج المعرّف من الرابط
const urlParams = new URLSearchParams(window.location.search);
const titleId = urlParams.get('id') || 'l000001-t02';

// 2. التحميل عند جاهزية العناصر
document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData();
    setupTabNavigation();
    loadExerciseIframe();
});

// 3. قراءة البيانات ديناميكياً
async function loadTitleData() {
    try {
        const dataModule = await import(`./data/title-${titleId}.js`);
        const data = dataModule.default || dataModule.titleData;
        
        currentTitleData = data.titleData ? data.titleData : data;

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

// 4. ربط الأزرار لعرض المحتوى داخل نفس الصفحة
function setupTabNavigation() {
    const buttons = document.querySelectorAll(".icon-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            
            // فتح الطقوس في نافذة خارجية عند النقر عليها
            if (tab === "rituels") {
                const ritualPath = currentTitleData?.rituelsFile || "../06-rituels/rituels-index.html";
                window.open(ritualPath, '_blank');
                return;
            }

            // عرض بقية الأقسام في الصفحة الحالية
            renderTabContent(tab);
        });
    });
}

function renderTabContent(tab) {
    const contentArea = document.getElementById("tab-content-area");
    if (!contentArea || !currentTitleData) return;

    contentArea.style.display = "block";

    if (tab === "watch" && currentTitleData.watch) {
        const { videoId, startSeconds, endSeconds } = currentTitleData.watch;
        contentArea.innerHTML = `
            <h3 style="margin-top:0;">فيديو المشاهدة</h3>
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}" 
                style="width:100%; height:360px; border:none; border-radius:10px;" 
                allowfullscreen>
            </iframe>
        `;
    } else if (tab === "explain" && currentTitleData.explain) {
        contentArea.innerHTML = `
            <h3 style="margin-top:0;">الشرح</h3>
            <div>${currentTitleData.explain.content}</div>
        `;
    } else if (tab === "summary" && currentTitleData.summary) {
        contentArea.innerHTML = `
            <h3 style="margin-top:0;">الملخص</h3>
            <div>${currentTitleData.summary.content}</div>
        `;
    }
}

// 5. تحميل iframe التمارين
function loadExerciseIframe() {
    const container = document.getElementById("exercises-container");
    if (!container) return;

    let targetExerciseId = "l000001-t02-e01";

    if (currentTitleData && currentTitleData.exercises && currentTitleData.exercises.length > 0) {
        const firstEx = currentTitleData.exercises[0];
        targetExerciseId = typeof firstEx === "string" ? firstEx : (firstEx.id || targetExerciseId);
    }

    const exerciseUrl = `../05-exercise/exercise.html?id=${targetExerciseId}`;

    container.innerHTML = `
        <iframe 
            src="${exerciseUrl}" 
            class="exercise-frame"
            style="width:100%; min-height:350px; border:none; border-radius:12px;">
        </iframe>
    `;
}
