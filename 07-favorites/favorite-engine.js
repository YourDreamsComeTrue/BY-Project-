import { lessonsConfig } from '../03-lesson/lessons-config.js';

const STORAGE_KEY = 'user_custom_favorites_v1';
let customLists = [];
let activeListId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadListsFromStorage();
    setupEventListeners();
    renderListsTabs();
    if (customLists.length > 0) {
        setActiveList(customLists[0].id);
    } else {
        renderActiveListItems();
    }
});

// 1. تحميل القوائم من LocalStorage
function loadListsFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    customLists = saved ? JSON.parse(saved) : [];
}

// 2. حفظ التغييرات في LocalStorage
function saveListsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customLists));
}

// 3. إعداد المستمعين للأحداث
function setupEventListeners() {
    document.getElementById("create-list-btn")?.addEventListener("click", createNewList);
    document.getElementById("delete-list-btn")?.addEventListener("click", deleteActiveList);
    
    // دعم الإنشاء عند الضغط على Enter في حقل النص
    document.getElementById("new-list-input")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") createNewList();
    });
}

// 4. إنشاء قائمة جديدة
function createNewList() {
    const input = document.getElementById("new-list-input");
    const name = input?.value.trim();
    if (!name) return;

    const newList = {
        id: "list_" + Date.now(),
        name: name,
        createdAt: new Date().toLocaleDateString('ar-EG'),
        items: []
    };

    customLists.push(newList);
    saveListsToStorage();
    input.value = "";
    
    renderListsTabs();
    setActiveList(newList.id);
}

// 5. تعيين القائمة النشطة
function setActiveList(listId) {
    activeListId = listId;
    renderListsTabs();
    renderActiveListItems();
}

// 6. حذف القائمة النشطة
function deleteActiveList() {
    if (!activeListId) return;
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذه القائمة بالكامل؟")) return;

    customLists = customLists.filter(l => l.id !== activeListId);
    saveListsToStorage();
    
    activeListId = customLists.length > 0 ? customLists[0].id : null;
    renderListsTabs();
    renderActiveListItems();
}

// 7. عرض أزرار تبويب القوائم
function renderListsTabs() {
    const container = document.getElementById("lists-tabs");
    if (!container) return;

    if (customLists.length === 0) {
        container.innerHTML = `<p class="no-lists-msg">لا توجد قوائم مفضلة حالياً. أنشئ قائمتك الأولى أعلاه!</p>`;
        return;
    }

    container.innerHTML = customLists.map(list => `
        <button class="list-tab ${list.id === activeListId ? 'active' : ''}" onclick="window.selectList('${list.id}')">
            📁 ${list.name} <span class="count">(${list.items.length})</span>
        </button>
    `).join("");

    // إتاحة الدالة للنافذة العامة لتعمل مع onclick
    window.selectList = setActiveList;
}

// 8. عرض عناصر القائمة النشطة
function renderActiveListItems() {
    const grid = document.getElementById("favorites-items-grid");
    const titleHeader = document.getElementById("active-list-title");
    const deleteBtn = document.getElementById("delete-list-btn");
    if (!grid) return;

    const currentList = customLists.find(l => l.id === activeListId);

    if (!currentList) {
        if (titleHeader) titleHeader.textContent = "لا توجد قائمة محددة";
        deleteBtn?.classList.add("hidden");
        grid.innerHTML = `<div class="empty-state">يرجى اختيار أو إنشاء قائمة جديدة.</div>`;
        return;
    }

    if (titleHeader) titleHeader.textContent = currentList.name;
    deleteBtn?.classList.remove("hidden");

    if (currentList.items.length === 0) {
        grid.innerHTML = `<div class="empty-state">هذه القائمة فارغة حالياً. أضف إليها دروساً أو عناوين أو تمارين من الفهرس أو صفحة الدرس.</div>`;
        return;
    }

    const typeBadges = {
        lesson: { label: "درس كامل", class: "badge-lesson" },
        title: { label: "عنوان مخصص", class: "badge-title" },
        exercise: { label: "تمرين", class: "badge-exercise" }
    };

    grid.innerHTML = currentList.items.map(item => {
        const badge = typeBadges[item.type] || { label: item.type, class: "" };
        const itemUrl = getItemUrl(item);

        return `
            <article class="item-card">
                <div class="card-top">
                    <span class="badge ${badge.class}">${badge.label}</span>
                    <button class="btn-remove" title="حذف من القائمة" onclick="window.removeItemFromList('${item.id}')">✕</button>
                </div>
                <h3 class="item-title">${item.title}</h3>
                ${item.subtitle ? `<p class="item-subtitle">${item.subtitle}</p>` : ''}
                <a href="${itemUrl}" class="btn-open-item">فتح المحتوى ←</a>
            </article>
        `;
    }).join("");

    window.removeItemFromList = removeItemFromList;
}

// 9. تكوين مسار الانتقال بناءً على نوع العنصر
function getItemUrl(item) {
    if (item.type === 'lesson') {
        return `../03-lesson/lesson.html?id=${item.lessonId}`;
    } else if (item.type === 'title') {
        return `../03-lesson/lesson.html?id=${item.lessonId}#title-${item.targetId}`;
    } else if (item.type === 'exercise') {
        return `../03-lesson/lesson.html?id=${item.lessonId}#exercise-${item.targetId}`;
    }
    return '#';
}

// 10. حذف عنصر محدد من القائمة النشطة
function removeItemFromList(itemId) {
    const currentList = customLists.find(l => l.id === activeListId);
    if (!currentList) return;

    currentList.items = currentList.items.filter(i => i.id !== itemId);
    saveListsToStorage();
    renderListsTabs();
    renderActiveListItems();
}

