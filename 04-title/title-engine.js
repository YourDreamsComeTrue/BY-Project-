        // دالة حساب الارتفاع الإجمالي للعنوان وإرساله لصفحة الدرس
function sendTitleHeightToParent() {
    setTimeout(() => {
        const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({
            type: "RESIZE_TITLE",
            titleId: titleId,
            height: fullHeight + 20
        }, "*");
    }, 150);
}

// أضف استدعاء الدالة في الحالات التالية داخل title-engine.js:

// 1. عند فتح أي تبويب (مشاهدة / شرح / ملخص)
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
    
    sendTitleHeightToParent(); // <-- تحديث الارتفاع عند فتح المحتوى
}

// 2. عند إغلاق زر التبويب الأحادي
function setupCloseButton() {
    const closeBtn = document.getElementById("close-tab-btn");
    const contentArea = document.getElementById("tab-content-area");
    if (closeBtn && contentArea) {
        closeBtn.addEventListener("click", () => {
            contentArea.style.display = "none";
            sendTitleHeightToParent(); // <-- تحديث الارتفاع عند الإغلاق
        });
    }
}

// 3. عند استقبال رسالة تمدد التمرين من الأسفل
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "RESIZE_EXERCISE") {
        const iframe = document.getElementById("exercise-iframe");
        if (iframe) {
            iframe.style.height = event.data.height + "px";
            sendTitleHeightToParent(); // <-- إشعار الدرس بتمدد التمرين
        }
    }
});

               
