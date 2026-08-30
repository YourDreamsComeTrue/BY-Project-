import { lessonsConfig } from '../03-lesson/lessons-config.js';

let activeType = 'all';
let activeTopic = 'all';
let sortOrder = 'asc';

document.addEventListener("DOMContentLoaded", () => {
    generateDynamicTopics();
    setupEventListeners();
    renderLessons();
});

// 1. استخراج كل الموضوعات الموجودة في البيانات وتوليد أزرارها ديناميكياً
function generateDynamicTopics() {
    const topicContainer = document.getElementById("topic-filters");
    if (!topicContainer) return;

    const topicsSet = new Set();
    lessonsConfig.forEach(lesson => {
        if (Array.isArray(lesson.topics)) {
            lesson.topics.forEach(t => topicsSet.add(t));
        }
    });

    let html = `<button class="chip active" data-topic="all">الكل</button>`;
    topicsSet.forEach(topic => {
        html += `<button class="chip" data-topic="${topic}">${topic}</button>`;
    });

    topicContainer.innerHTML = html;
}

// 2. إعداد أحداث الفلترة والترتيب
function setupEventListeners() {
    // أحداث فلتر النوع
    document.getElementById("type-filters")?.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            document.querySelectorAll("#type-filters .chip").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeType = e.target.getAttribute("data-type");
            renderLessons();
        }
    });

    // أحداث فلتر الموضوع
    document.getElementById("topic-filters")?.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            document.querySelectorAll("#topic-filters .chip").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeTopic = e.target.getAttribute("data-topic");
            renderLessons();
        }
    });

    // حدث الترتيب
    document.getElementById("sort-select")?.addEventListener("change", (e) => {
        sortOrder = e.target.value;
        renderLessons();
    });
}

// 3. تصفية وترتيب وعرض الدروس
function renderLessons() {
    const grid = document.getElementById("lessons-grid");
    if (!grid) return;

    // تصفية المحتوى بناءً على الجمع بين الفلاتر
    let filtered = lessonsConfig.filter(lesson => {
        const matchType = (activeType === 'all') || (lesson.type === activeType);
        const matchTopic = (activeTopic === 'all') || (lesson.topics && lesson.topics.includes(activeTopic));
        return matchType && matchTopic;
    });

    // تطبيق الترتيب
    filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.order - b.order : b.order - a.order;
    });

    // عرض النتيجة
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results">لا توجد دروس تطابق خيارات الفلترة المحددة.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(lesson => {
        const typeLabels = { video: "فيديو", short: "شورت", lecture: "محاضرة" };
        const topicsTags = lesson.topics.map(t => `<span class="tag">${t}</span>`).join(" ");

        return `
            <article class="lesson-card" onclick="window.location.href='${lesson.path}'">
                <div class="card-header">
                    <span class="badge type-${lesson.type}">${typeLabels[lesson.type] || lesson.type}</span>
                    <span class="order-num">#${lesson.order}</span>
                </div>
                <h2 class="card-title">${lesson.title}</h2>
                <p class="card-desc">${lesson.description || ''}</p>
                <div class="card-footer">
                    <div class="tags-wrapper">${topicsTags}</div>
                </div>
            </article>
        `;
    }).join("");
          }

