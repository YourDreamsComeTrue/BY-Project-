import { lessonsConfig } from '../03-lesson/lessons-config.js';

let activeType = 'all';
let activeTopic = 'all';
let sortOrder = 'asc';

document.addEventListener("DOMContentLoaded", () => {
    generateDynamicTopics();
    setupEventListeners();
    renderLessons();
});

// 1. توليد الموضوعات ديناميكياً لتصفية وترتيب الدروس
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

// 2. إعداد مستمعات الأحداث وإدارة صندوق الترتيب المنسدل
function setupEventListeners() {
    const sortModal = document.getElementById("sortModal");
    const btnOpenSortModal = document.getElementById("btnOpenSortModal");

    // تبديل إظهار وإخفاء صندوق الترتيب عند النقر على الزر
    btnOpenSortModal?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sortModal) {
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

    // أحداث تصفية النوع
    document.getElementById("type-filters")?.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            document.querySelectorAll("#type-filters .chip").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeType = e.target.getAttribute("data-type");
            renderLessons();
        }
    });

    // أحداث تصفية الموضوع
    document.getElementById("topic-filters")?.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            document.querySelectorAll("#topic-filters .chip").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeTopic = e.target.getAttribute("data-topic");
            renderLessons();
        }
    });
}

// 3. تصفية وترتيب وعرض الدروس
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
        grid.innerHTML = `<div class="no-results">لا توجد دروس تطابق خيارات التصفية المحددة.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(lesson => {
        const typeLabels = { video: "فيديو", short: "شورت", lecture: "محاضرة" };

        return `
            <article class="lesson-card" onclick="window.location.href='../03-lesson/lesson.html?id=${lesson.id}'">
                <div class="card-header">
                    <span class="badge type-${lesson.type}">${typeLabels[lesson.type] || lesson.type}</span>
                    <span class="order-num">${lesson.order}</span>
                    <button class="btn-fav-star" title="إضافة للمفضلة" onclick="event.stopPropagation(); window.addToFavorite('lesson', '${lesson.id}', '', '${lesson.title}')">⭐</button>
                </div>
                <h2 class="card-title">${lesson.title}</h2>
                <p class="card-desc">${lesson.description || ''}</p>
            </article>
        `;
    }).join("");
}

// 4. دالة إضافة المحتوى إلى قوائم المفضلة عبر نافذة تفاعلية بالنقر المباشر
export function addToFavorite(type, lessonId, targetId, title, subtitle = '') {
    const saved = localStorage.getItem('user_custom_favorites_v1');
    const customLists = saved ? JSON.parse(saved) : [];

    if (customLists.length === 0) {
        alert("لا توجد لديك قوائم مفضلة حالياً! يرجى الانتقال لصفحة المفضلة وإنشاء قائمة أولاً.");
        return;
    }

    // إنشاء صندوق منسدل تفاعلي مخصص يتيح النقر المباشر على اسم القائمة
    let modal = document.getElementById('fav-selection-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fav-selection-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.8); display: flex;
            justify-content: center; align-items: center; z-index: 1000;
        `;
        document.body.appendChild(modal);
    }

    let listsHtml = customLists.map((l, index) => `
        <button class="fav-modal-list-btn" data-index="${index}" style="
            display: block; width: 100%; padding: 10px 14px; margin-bottom: 8px;
            background: rgba(30, 41, 59, 0.9); color: #f8fafc; border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px; cursor: pointer; font-size: 0.9rem; text-align: right;
            transition: background 0.2s;
        ">📁 ${l.name}</button>
    `).join("");

    modal.innerHTML = `
        <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; padding: 20px; width: 90%; max-width: 320px; text-align: right;">
            <h3 style="color: #f8fafc; font-size: 1rem; margin-top: 0; margin-bottom: 12px;">اختر القائمة لإضافة العنصر إليها:</h3>
            ${listsHtml}
            <button id="close-fav-modal" style="
                display: block; width: 100%; margin-top: 10px; padding: 8px;
                background: rgba(220, 38, 38, 0.8); color: white; border: none;
                border-radius: 8px; cursor: pointer; font-weight: bold;
            ">إلغاء</button>
        </div>
    `;

    modal.style.display = 'flex';

    // تنفيذ الإضافة فور النقر على اسم القائمة في النافذة التفاعلية
    modal.querySelectorAll('.fav-modal-list-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
            const targetList = customLists[selectedIndex];

            const newItem = {
                id: "item_" + Date.now(),
                type: type,
                lessonId: lessonId,
                targetId: targetId || '',
                title: title,
                subtitle: subtitle
            };

            targetList.items.push(newItem);
            localStorage.setItem('user_custom_favorites_v1', JSON.stringify(customLists));
            alert(`تمت إضافة "${title}" إلى قائمة "${targetList.name}" بنجاح! ⭐`);
            modal.style.display = 'none';
        });
    });

    modal.querySelector('#close-fav-modal').onclick = () => {
        modal.style.display = 'none';
    };
}

window.addToFavorite = addToFavorite;
