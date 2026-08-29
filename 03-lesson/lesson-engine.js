let currentLessonData = null;

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get('id') || 'l000001';

document.addEventListener("DOMContentLoaded", async () => {
    await loadLessonData();
    renderTitles();
    listenForMessages();
});

async function loadLessonData() {
    try {
        const dataModule = await import(`./data/lesson-${lessonId}.js`);
        const data = dataModule.default || dataModule.lessonData;
        
        currentLessonData = data.lessonData ? data.lessonData : data;

        const headingElement = document.getElementById("lesson-heading");
        if (headingElement && currentLessonData.heading) {
            headingElement.textContent = currentLessonData.heading;
        }
    } catch (error) {
        console.error("تعذر تحميل ملف بيانات الدرس:", error);
    }
}

function renderTitles() {
    const container = document.getElementById("titles-container");
    if (!container || !currentLessonData || !currentLessonData.titles) return;

    container.innerHTML = "";

    currentLessonData.titles.forEach((tId) => {
        const titleUrl = `../04-title/title.html?id=${tId}`;
        
        const iframe = document.createElement("iframe");
        iframe.id = `title-iframe-${tId}`;
        iframe.src = titleUrl;
        iframe.className = "title-frame";
        iframe.setAttribute("scrolling", "no");
        iframe.style.width = "100%";
        iframe.style.minHeight = "350px";
        iframe.style.border = "none";
        iframe.style.borderRadius = "12px";
        iframe.style.marginBottom = "24px";
        iframe.style.overflow = "hidden";

        container.appendChild(iframe);
    });
}

function listenForMessages() {
    window.addEventListener("message", (event) => {
        if (!event.data) return;

        // 1. التكيف مع الارتفاع
        if (event.data.type === "RESIZE_TITLE") {
            const targetIframe = document.getElementById(`title-iframe-${event.data.titleId}`);
            if (targetIframe) {
                targetIframe.style.height = event.data.height + "px";
            }
        }

        // 2. قاطع الصوت الصارم: تفريغ وإعادة تعيين إطار العنوان عند إغلاق الفيديو
        if (event.data.type === "STOP_VIDEO_STREAM") {
            const targetIframe = document.getElementById(`title-iframe-${event.data.titleId}`);
            if (targetIframe) {
                // إجبار المتصفح على قطع جميع الاتصالات الصوتية والمشغلات داخل الإطار
                const currentSrc = targetIframe.src;
                targetIframe.src = "about:blank";
                setTimeout(() => {
                    targetIframe.src = currentSrc;
                }, 50);
            }
        }
    });
                }
