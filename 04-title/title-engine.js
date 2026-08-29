let currentTitleData = null;

const urlParams = new URLSearchParams(window.location.search);
const titleId = urlParams.get('id') || 'l000001-t02';

document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData();
    setupTabNavigation();
    setupCloseButton();
    loadExerciseIframe();
});

// دالة حساب الارتفاع الكلي للعنوان وتمريرها فوراً لصفحة الدرس
function sendTitleHeightToParent() {
    // التأكد من أن التمرير يأخذ الارتفاع الفعلي الكلي بدقة
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(
        body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight
    );

    window.parent.postMessage({
        type: "RESIZE_TITLE",
        titleId: titleId,
        height: height + 30 // هامش أمان إضافي يمنع القص
    }, "*");
}

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
        console.error("تعذر تحميل بيانات العنوان:", error);
    }
}

function setupTabNavigation() {
    const buttons = document.querySelectorAll(".icon-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            
            if (tab === "rituels") {
                const ritualPath = currentTitleData?.rituelsFile || "../06-rituels/rituels-index.html";
                window.open(ritualPath, '_blank');
                return;
            }

            renderTabContent(tab);
        });
    });
}

function setupCloseButton() {
    const closeBtn = document.getElementById("close-tab-btn");
    const contentArea = document.getElementById("tab-content-area");
    if (closeBtn && contentArea) {
        closeBtn.addEventListener("click", () => {
            contentArea.style.display = "none";
            setTimeout(sendTitleHeightToParent, 100);
        });
    }
}

function renderTabContent(tab) {
    const contentArea = document.getElementById("tab-content-area");
    const tabBody = document.getElementById("tab-body");
    if (!contentArea || !tabBody || !currentTitleData) return;

    contentArea.style.display = "block";

    if (tab === "watch" && currentTitleData.watch) {
        const { videoId, startSeconds, endSeconds } = currentTitleData.watch;
        tabBody.innerHTML = `
            <h3 style="margin-top:0;">فيديو المشاهدة</h3>
            <iframe 
                src="https://www.youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}" 
                style="width:100%; height:360px; border:none; border-radius:10px;" 
                allowfullscreen>
            </iframe>
        `;
    } else if (tab === "explain" && currentTitleData.explain) {
        tabBody.innerHTML = `
            <h3 style="margin-top:0;">الشرح</h3>
            <div>${currentTitleData.explain.content}</div>
        `;
    } else if (tab === "summary" && currentTitleData.summary) {
        tabBody.innerHTML = `
            <h3 style="margin-top:0;">الملخص</h3>
            <div>${currentTitleData.summary.content}</div>
        `;
    }

    setTimeout(sendTitleHeightToParent, 100);
}

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
            id="exercise-iframe"
            src="${exerciseUrl}" 
            class="exercise-frame"
            scrolling="no"
            style="width:100%; min-height:350px; border:none; border-radius:12px; overflow:hidden;">
        </iframe>
    `;

    // عند استقبال إشارة تمدد التمرين، يتم تعديل إطار التمرين أولاً ثم إبلاغ الدرس فوراً
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "RESIZE_EXERCISE") {
            const iframe = document.getElementById("exercise-iframe");
            if (iframe) {
                iframe.style.height = event.data.height + "px";
                // إبلاغ الدرس بالتمدد الكلي الجديد
                sendTitleHeightToParent();
            }
        }
    });
        }
