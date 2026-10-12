import { lessonsConfig } from '../03-lesson/lessons-config.js';

let activeType = 'all';
let activeTopic = 'all';
let sortOrder = 'asc';

document.addEventListener("DOMContentLoaded", () => {
    generateDynamicTopics();
    setupEventListeners();
    renderLessons();
});

// 1. توليد الموضوعات ديناميكياً للفلترة والترتيب في الخلفية
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

// 2. إعداد المستمعات للأحداث وإدارة صندوق الترتيب المنسدل بدقة
function setupEventListeners() {
    const sortModal = document.getElementById("sortModal");
    const btnOpenSortModal = document.getElementById("btnOpenSortModal");

    // تبديل إظهار وإخفاء صندوق الترتيب عند النقر على الزر
    btnOpenSortModal?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sortModal) {
            // التحقق من حالة العرض الحالية لتبديلها بسلاسة
            const currentDisplay = window.getComputedStyle(sortModal).display;
            sortModal.style.display = (currentDisplay === "none" || currentDisplay === "") ? "block" : "none";
        }
    });

    // إخفاء الصندوق تلقائياً عند النقر في أي مكان خارج الصندوق أو زر الترتيب
    document.addEventListener("click", (e) => {
        if (sortModal) {
            const currentDisplay = window.getComputedStyle(sortModal).display;
            if (currentDisplay === "block") {
                if (!sortModal.contains(e.target) && !btnOpenSortModal.contains(e.target)) {
                    sortModal.style.display = "none";
                }
            }
        }
    });

    // أحداث أزرار الترتيب
    document.getElementById("sort-filters")?.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            document.querySelectorAll("#sort-filters .chip").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            sortOrder = e.target.getAttribute("data-sort");
            renderLessons();
        }
    });

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
}

// 3. تصفية وترتيب وعرض الدروس (بدون إظهار وسوم الـ topics على البطاقات)
function renderLessons() {
    const grid = document.getElementById("lessons-grid");
    if (!grid) return;

    let filtered = lessonsConfig.filter(lesson => {
        const matchType = (activeType === 'all') || (lesson.type === activeType);
        const matchTopic = (activeTopic === 'all') || (lesson.topics && lesson.topics.includes(activeTopic));
        return matchType && matchTopic;
    });

    filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.order - b.order : b.order - a.order;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results">لا توجد دروس تطابق خيارات الفلترة المحددة.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(lesson => {
        const typeLabels = { video: "فيديو", short: "شورت", lecture: "محاضرة" };

        return `
            <article class="lesson-card" onclick="window.location.href='${lesson.path}'">
                <div class="card-header">
                    <span class="badge type-${lesson.type}">${typeLabels[lesson.type] || lesson.type}</span>
                    <span class="order-num">#${lesson.order}</span>
                    <button class="btn-fav-star" title="إضافة للمفضلة" onclick="event.stopPropagation(); window.addToFavorite('lesson', '${lesson.id}', '', '${lesson.title}')">⭐</button>
                </div>
                <h2 class="card-title">${lesson.title}</h2>
                <p class="card-desc">${lesson.description || ''}</p>
            </article>
        `;
    }).join("");
}

// 4. دالة إضافة المحتوى إلى قوائم المفضلة
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
                                                               
