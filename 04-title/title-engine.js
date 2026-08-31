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

// ✅ دالة فتح وإغلاق حاوية التمارين الإضافية
function toggleExtraExercises() {
    const extraContainer = document.getElementById("extra-exercises-container");
    const toggleBtn = document.getElementById("toggle-extra-btn");

    if (!extraContainer || !toggleBtn) return;

    // فحص ما إذا كانت الحاوية مخفية حالياً
    const isHidden = window.getComputedStyle(extraContainer).display === "none";

    if (isHidden) {
        extraContainer.style.setProperty("display", "flex", "important");
        toggleBtn.innerHTML = "➖ إخفاء التمارين الإضافية";
    } else {
        extraContainer.style.setProperty("display", "none", "important");
        toggleBtn.innerHTML = "➕ عرض التمارين الإضافية";
    }
    
    // إعادة حساب ارتفاع العنوان للصفحة الأم بعد التمدد أو الانكماش
    sendTitleHeightToParent();
}

window.toggleExtraExercises = toggleExtraExercises;

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

// دالة مساعدة لإنشاء عناصر iframe الخاصة بالتمارين
function createExerciseIframe(targetExerciseId, contextParam) {
    const exerciseUrl = `../05-exercise/exercise.html?id=${targetExerciseId}&context=${contextParam}`;
    const iframe = document.createElement("iframe");
    iframe.id = `exercise-iframe-${targetExerciseId}`;
    iframe.setAttribute("data-ex-id", targetExerciseId);
    iframe.src = exerciseUrl;
    iframe.className = "exercise-frame";
    iframe.setAttribute("scrolling", "no");
    iframe.style.cssText = "width:100%; min-height:250px; border:none; border-radius:12px; overflow:hidden; margin-bottom:20px; display:block;";
    return iframe;
}

// ✅ دالة تحميل التمارين وتجهيز الحاويات
function loadExerciseIframe() {
    const mainContainer = document.getElementById("main-exercises-container");
    const extraContainer = document.getElementById("extra-exercises-container");
    const toggleWrapper = document.getElementById("extra-toggle-wrapper");

    if (!mainContainer || !currentTitleData) return;

    mainContainer.innerHTML = "";
    
    if (extraContainer) {
        extraContainer.innerHTML = "";
        // إخفاء حاوية التمارين الإضافية فوراً عند التحميل
        extraContainer.style.setProperty("display", "none", "important");
    }

    // استخراج القوائم سواء بالتصنيف الجديد (Object) أو بالقديم (Array)
    let mainList = [];
    let extraList = [];

    if (Array.isArray(currentTitleData.exercises)) {
        mainList = currentTitleData.exercises;
    } else if (currentTitleData.exercises) {
        mainList = currentTitleData.exercises.main || [];
        extraList = currentTitleData.exercises.extra || [];
    }

    const contextParam = lessonId ? `${lessonId}_${titleId}` : titleId;

    // 1. استدعاء التمارين الرئيسية
    mainList.forEach((exItem, index) => {
        const targetExerciseId = typeof exItem === "string" ? exItem : (exItem.id || `${titleId}-e0${index + 1}`);
        const iframe = createExerciseIframe(targetExerciseId, contextParam);
        mainContainer.appendChild(iframe);
    });

    // 2. استدعاء التمارين الإضافية (إن وجدت)
    if (extraList.length > 0 && extraContainer && toggleWrapper) {
        toggleWrapper.style.display = "block"; // إظهار زر التوسع
        
        const toggleBtn = document.getElementById("toggle-extra-btn");
        if (toggleBtn) {
            toggleBtn.innerHTML = "➕ عرض التمارين الإضافية";
        }

        extraList.forEach((exItem, index) => {
            const targetExerciseId = typeof exItem === "string" ? exItem : (exItem.id || `${titleId}-e0${mainList.length + index + 1}`);
            const iframe = createExerciseIframe(targetExerciseId, contextParam);
            extraContainer.appendChild(iframe);
        });
    } else if (toggleWrapper) {
        toggleWrapper.style.display = "none"; // إخفاء زر التوسع في حال عدم وجود تمارين إضافية
    }

    sendTitleHeightToParent();

    // الاستماع لرسائل ضبط الارتفاع والمفضلة من إطارات التمارين
    window.addEventListener("message", (event) => {
        if (!event.data) return;

        if (event.data.type === "RESIZE_EXERCISE") {
            const iframes = document.querySelectorAll(".exercise-frame");
            
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
            
