let currentTitleData = null;

const urlParams = new URLSearchParams(window.location.search);
const titleId = urlParams.get('id') || 'l000001-t02'; // مثال: l000001-t02

// استخراج lessonId تلقائياً من بداية العنوان (مثال: l000001)
const lessonId = urlParams.get('lessonId') || titleId.split('-')[0];

document.addEventListener("DOMContentLoaded", async () => {
    await loadTitleData();
    setupTabNavigation();
    setupCloseButton();
    loadExerciseIframe();
});

// دالة إرسال طلب إضافة للمفضلة إلى الصفحة الأم (lesson.html)
function sendToFavorite(itemType, targetId, title, subtitle = '') {
    window.parent.postMessage({
        type: "ADD_TO_FAVORITE",
        itemType: itemType,   // 'title' أو 'exercise'
        targetId: targetId,   // معرف العنوان t02 أو التمرين
        title: title,
        subtitle: subtitle
    }, "*");
}

window.sendToFavorite = sendToFavorite;

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
        // ✅ تحميل الملف المجمع الخاص بالدرس مع إضافة معيار v للتغلب على الكاش
        const dataModule = await import(`./data/title-${lessonId}.js?v=${Date.now()}`);
        const data = dataModule.default || dataModule;
        
        // استخراج خريطة العناوين
        const titlesMap = data.titles || data;

        // قراءة بيانات العنوان المحدد من داخل الملف المجمع
        currentTitleData = titlesMap[titleId];

        if (currentTitleData) {
            const headingElement = document.getElementById("title-heading");
            if (headingElement && currentTitleData.heading) {
                headingElement.innerHTML = `
                    <span>${currentTitleData.heading}</span>
                    <button class="btn-fav-star" title="إضافة هذا العنوان للمفضلة" 
                            onclick="window.sendToFavorite('title', '${titleId}', '${currentTitleData.heading}')">⭐</button>
                `;
            }
        } else {
            console.warn(`لم يتم العثور على العنوان ${titleId} داخل ملف title-${lessonId}.js`);
        }
    } catch (error) {
        console.error("تعذر تحميل بيانات العنوان المجمع:", error);
    }
}

// دالة تفريغ وقتل الفيديو والصوت نهائياً
function stopAndDestroyVideo() {
    const tabBody = document.getElementById("tab-body");
    if (tabBody) {
        const iframes = tabBody.querySelectorAll("iframe");
        iframes.forEach(iframe => {
            iframe.src = "about:blank";
            iframe.remove();
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
            
            stopAndDestroyVideo();
            
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

    container.innerHTML = "";

    const exercisesList = (currentTitleData && currentTitleData.exercises && currentTitleData.exercises.length > 0)
        ? currentTitleData.exercises
        : ["l000001-t02-e01"];

    const contextParam = lessonId ? `${lessonId}_${titleId}` : titleId;

    exercisesList.forEach((exItem, index) => {
        const targetExerciseId = typeof exItem === "string" ? exItem : (exItem.id || `l000001-t02-e0${index + 1}`);
        const exerciseUrl = `../05-exercise/exercise.html?id=${targetExerciseId}&context=${contextParam}`;

        const iframe = document.createElement("iframe");
        iframe.id = `exercise-iframe-${targetExerciseId}`;
        iframe.setAttribute("data-ex-id", targetExerciseId);
        iframe.src = exerciseUrl;
        iframe.className = "exercise-frame";
        iframe.setAttribute("scrolling", "no");
        iframe.style.cssText = "width:100%; min-height:250px; border:none; border-radius:12px; overflow:hidden; margin-bottom:20px; display:block;";

        container.appendChild(iframe);
    });

    window.addEventListener("message", (event) => {
        if (!event.data) return;

        if (event.data.type === "RESIZE_EXERCISE") {
            const iframes = container.querySelectorAll("iframe");
            
            iframes.forEach(iframe => {
                if (iframe.contentWindow === event.source) {
                    iframe.style.height = event.data.height + "px";
                }
            });

            sendTitleHeightToParent();
        }

        if (event.data.type === "ADD_TO_FAVORITE") {
            window.parent.postMessage(event.data, "*");
        }
    });
}
    
