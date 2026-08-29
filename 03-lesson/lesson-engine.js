let currentLessonData = null;

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get('id') || 'l000001';

document.addEventListener("DOMContentLoaded", async () => {
    await loadLessonData();
    renderTitles();
});

// 1. تحميل بيانات الدرس
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
        const headingElement = document.getElementById("lesson-heading");
        if (headingElement) {
            headingElement.textContent = "تعذر تحميل الدرس المطلوبة.";
        }
    }
}

// 2. عرض العناوين المندرجة تحت الدرس
function renderTitles() {
    const container = document.getElementById("titles-container");
    if (!container || !currentLessonData || !currentLessonData.titles) return;

    container.innerHTML = "";

    currentLessonData.titles.forEach((titleId, index) => {
        const titleUrl = `../04-title/title.html?id=${titleId}`;
        
        const iframe = document.createElement("iframe");
        iframe.id = `title-iframe-${index}`;
        iframe.src = titleUrl;
        iframe.className = "title-frame";
        iframe.setAttribute("scrolling", "no");
        iframe.style.width = "100%";
        iframe.style.minHeight = "400px";
        iframe.style.border = "none";
        iframe.style.borderRadius = "12px";
        iframe.style.marginBottom = "20px";
        iframe.style.overflow = "hidden";

        container.appendChild(iframe);
    });
          }
