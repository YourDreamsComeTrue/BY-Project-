let currentTitleData = null;

const urlParams = new URLSearchParams(window.location.search);
const titleId = urlParams.get('id') || 'l000001-t02';
// 1. استخراج معرف الدرس إن وجد (لتمييز السياق)
const lessonId = urlParams.get('lessonId');

document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData();
    setupTabNavigation();
    setupCloseButton();
    loadExerciseIframe();
});

// حساب الارتفاع الحقيقي للحاوية المغلقة
function sendTitleHeightToParent() {
    requestAnimationFrame(() => {
        const container = document.querySelector(".title-container") || document.body;
        const realHeight = container.getBoundingClientRect().height;

        window.parent.postMessage({
            type: "RESIZE_TITLE",
            titleId: titleId,
            height: Math.ceil(realHeight) + 20
        }, "*");
    });
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

// دالة تفريغ وقتل الفيديو والصوت نهائياً
function stopAndDestroyVideo() {
    const tabBody = document.getElementById("tab-body");
    if (tabBody) {
        // إزالة أي إطارات iframe لمنع استمرار تشغيل الصوت في الخلفية
        const iframes = tabBody.querySelectorAll("iframe");
        iframes.forEach(iframe => {
            iframe.src = "about:blank"; // تدمير رابط الفيديو
            iframe.remove(); // حذف العنصر من الـ DOM
        });
        tabBody.innerHTML = "";
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

            // إيقاف أي فيديو يعمل قبل فتح التبويب الجديد
            stopAndDestroyVideo();
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
            
            // 1. تدمير الفيديو وإفراغ الحاوية محلياً
            stopAndDestroyVideo();
            
            // 2. إرسال أمر لصفحة الدرس لإعادة شحن الـ iframe وقطع الصوت تماماً في المتصفحات التي تُبقي الصوت بالخلفية
            window.parent.postMessage({
                type: "STOP_VIDEO_STREAM",
                titleId: titleId
            }, "*");

            sendTitleHeightToParent();
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
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}&enablejsapi=1" 
                    allow="autoplay; encrypted-media"
                    allowfullscreen>
                </iframe>
            </div>
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

    sendTitleHeightToParent();
    setTimeout(sendTitleHeightToParent, 150);
    setTimeout(sendTitleHeightToParent, 400);
}

function loadExerciseIframe() {
    const container = document.getElementById("exercises-container");
    if (!container) return;

    let targetExerciseId = "l000001-t02-e01";

    if (currentTitleData && currentTitleData.exercises && currentTitleData.exercises.length > 0) {
        const firstEx = currentTitleData.exercises[0];
        targetExerciseId = typeof firstEx === "string" ? firstEx : (firstEx.id || targetExerciseId);
    }

    // 2. تجميع السياق: إذا كان هناك lessonId نربطه مع titleId، وإلا نكتفي بـ titleId
    const contextParam = lessonId ? `${lessonId}_${titleId}` : titleId;

    // 3. تمرير المعامل context في رابط التمرين
    const exerciseUrl = `../05-exercise/exercise.html?id=${targetExerciseId}&context=${contextParam}`;

    container.innerHTML = `
        <iframe 
            id="exercise-iframe"
            src="${exerciseUrl}" 
            class="exercise-frame"
            scrolling="no"
            style="width:100%; min-height:200px; border:none; border-radius:12px; overflow:hidden;">
        </iframe>
    `;

    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "RESIZE_EXERCISE") {
            const iframe = document.getElementById("exercise-iframe");
            if (iframe) {
                iframe.style.height = event.data.height + "px";
                sendTitleHeightToParent();
            }
        }
    });
}
