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
            headingElement.innerHTML = `
                <span>${currentLessonData.heading}</span>
                <button class="btn-fav-star" title="إضافة الدرس للمفضلة" onclick="window.addToFavorite('lesson', '${lessonId}', '', '${currentLessonData.heading}')">⭐</button>
            `;
        }
    } catch (error) {
        console.error("تعذر تحميل ملف بيانات الدرس:", error);
    }
}

function renderTitles() {
    const container = document.getElementById("titles-container");
    if (!container || !currentLessonData || !currentLessonData.titles) return;

    container.innerHTML = "";

    // قراءة كل العناوين بلا استثناء (سواء كانت 1، 2، 3 أو أكثر)
    currentLessonData.titles.forEach((tItem, index) => {
        const tId = typeof tItem === "string" ? tItem : (tItem.id || `t0${index + 1}`);
        const titleUrl = `../04-title/title.html?id=${tId}&lessonId=${lessonId}`;
        
        const iframe = document.createElement("iframe");
        iframe.id = `title-iframe-${tId}`;
        iframe.setAttribute("data-title-id", tId);
        iframe.src = titleUrl;
        iframe.className = "title-frame";
        iframe.setAttribute("scrolling", "no");
        iframe.style.cssText = "width:100%; min-height:350px; border:none; border-radius:12px; margin-bottom:24px; display:block; overflow:hidden;";

        container.appendChild(iframe);
    });
}

function listenForMessages() {
    window.addEventListener("message", (event) => {
        if (!event.data) return;

        // 1. التكيف مع الارتفاع
        if (event.data.type === "RESIZE_TITLE") {
            const targetId = event.data.titleId;
            let targetIframe = document.getElementById(`title-iframe-${targetId}`);
            
            if (!targetIframe && event.source) {
                const iframes = document.querySelectorAll(".title-frame");
                iframes.forEach(iframe => {
                    if (iframe.contentWindow === event.source) {
                        targetIframe = iframe;
                    }
                });
            }

            if (targetIframe) {
                targetIframe.style.height = event.data.height + "px";
            }
        }

        // 2. قاطع الصوت
        if (event.data.type === "STOP_VIDEO_STREAM") {
            const targetIframe = document.getElementById(`title-iframe-${event.data.titleId}`);
            if (targetIframe) {
                const currentSrc = targetIframe.src;
                targetIframe.src = "about:blank";
                setTimeout(() => {
                    targetIframe.src = currentSrc;
                }, 50);
            }
        }

        // 3. الإضافة للمفضلة
        if (event.data.type === "ADD_TO_FAVORITE") {
            addToFavorite(
                event.data.itemType,
                lessonId,
                event.data.targetId,
                event.data.title,
                event.data.subtitle || ''
            );
        }
    });
}

export function addToFavorite(type, lessonId, targetId, title, subtitle = '') {
    const saved = localStorage.getItem('user_custom_favorites_v1');
    const customLists = saved ? JSON.parse(saved) : [];

    if (customLists.length === 0) {
        alert("لا توجد لديك قوائم مفضلة حالياً! يرجى الانتقال لصفحة المفضلة وإنشاء قائمة أولاً.");
        return;
    }

    const listNames = customLists.map((l, index) => `${index + 1}. ${l.name}`).join("\n");
    const choice = prompt(`اختر رقم القائمة التي تريد إضافة العنصر إليها:\n${listNames}`);
    
    if (!choice) return;

    const selectedIndex = parseInt(choice) - 1;
    if (isNaN(selectedIndex) || !customLists[selectedIndex]) {
        alert("اختيار غير صحيح!");
        return;
    }

    const newItem = {
        id: "item_" + Date.now(),
        type: type,
        lessonId: lessonId,
        targetId: targetId || '',
        title: title,
        subtitle: subtitle
    };

    customLists[selectedIndex].items.push(newItem);
    localStorage.setItem('user_custom_favorites_v1', JSON.stringify(customLists));
    alert(`تمت إضافة "${title}" إلى قائمة "${customLists[selectedIndex].name}" بنجاح! ⭐`);
}

window.addToFavorite = addToFavorite;
