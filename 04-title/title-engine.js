let currentExerciseData = null;
let saveTimer = null;

// 1. تحديد واستخراج متغيرات الرابط (URL Parameters)
const urlParams = new URLSearchParams(window.location.search);
const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
const titleFolder = urlParams.get('title') || 'title-02';
const exerciseFile = urlParams.get('ex') || 'exercise01';
const ritualType = urlParams.get('ritual') || 'seed'; // خيارات: 'seed' أو 'burn'

// 2. دوال بناء المسارات النسبية الصحيحة من مجلد 04-title
function getRitualPath(type) {
    // المسار: الخروج من 04-title والدخول إلى 06-rituels
    return `../06-rituels/${type}/${type}.html`;
}

function getContentScriptPath(lesson, title, file) {
    // المسار: الخروج من 04-title والدخول إلى 07-content
    return `../07-content/${lesson}/${title}/${file}.js`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    loadContentData();
});

// 3. إدارة التبديل بين الأزرار الأربعة (المشاهدة، الشرح، الملخص، الطقوس)
function setupTabNavigation() {
    const buttons = document.querySelectorAll(".icon-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.getAttribute("data-tab");
            renderTabSection(tab);
        });
    });

    // تفعيل التبويب الأول افتراضياً عند التحميل
    const defaultBtn = document.getElementById("btn-watch");
    if (defaultBtn) defaultBtn.click();
}

// 4. عرض المحتوى داخل تبويب tab-content-area
function renderTabSection(tab) {
    const container = document.getElementById("tab-content-area");
    if (!container) return;

    container.innerHTML = "";

    switch (tab) {
        case "watch":
            container.innerHTML = `<div class="content-box"><p>قسم المشاهدة جاهز لعرض الفيديو.</p></div>`;
            break;

        case "explain":
            container.innerHTML = `<div class="content-box"><p>محتوى الشرح والتوضيح للدرس.</p></div>`;
            break;

        case "summary":
            container.innerHTML = `<div class="content-box"><p>ملخص النقاط الأساسية للعنوان.</p></div>`;
            break;

        case "rituels":
            // استدعاء ملف الطقس (seed.html أو burn.html) عبر iframe
            const iframeSrc = getRitualPath(ritualType);
            container.innerHTML = `
                <iframe 
                    src="${iframeSrc}" 
                    class="rituels-frame"
                    style="width:100%; height:500px; border:none; border-radius:12px;">
                </iframe>
            `;
            break;
    }
}

// 5. جلب ملف التمرين من 07-content وتضمينه أسفل الصفحة
function loadContentData() {
    const scriptPath = getContentScriptPath(lessonFolder, titleFolder, exerciseFile);
    const script = document.createElement("script");
    script.src = scriptPath;

    script.onload = () => {
        if (typeof exerciseData !== "undefined") {
            currentExerciseData = exerciseData;
            renderExerciseUI(currentExerciseData);
        }
    };

    script.onerror = () => {
        const exContainer = document.getElementById("exercises-container");
        if (exContainer) {
            exContainer.innerHTML = `<p style="color:red;">تعذر تحميل التمرين من المسار المحدد.</p>`;
        }
    };

    document.head.appendChild(script);
}

// 6. بناء عناصر واجهة التمرين داخل exercises-container
function renderExerciseUI(data) {
    const container = document.getElementById("exercises-container");
    if (!container) return;

    container.innerHTML = `
        <div class="exercise-card">
            <h3 class="exercise-question">${data.question || 'لا يوجد سؤال'}</h3>
            <textarea id="userAnswer" placeholder="اكتب إجابتك هنا..." style="width:100%; min-height:100px; resize:none;"></textarea>
        </div>
    `;

    const textarea = document.getElementById("userAnswer");
    loadSavedAnswer(data.id, textarea);

    textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            autoSaveData(data.id, this.value);
        }, 1200);
    });
}

// 7. حفظ واسترجاع البيانات
function autoSaveData(exerciseId, text) {
    const payload = {
        exerciseId: exerciseId,
        content: text,
        updatedAt: new Date().toISOString()
    };

    if (window.CoreStorage && typeof window.CoreStorage.save === "function") {
        window.CoreStorage.save(payload);
    } else {
        localStorage.setItem(exerciseId, JSON.stringify(payload));
    }
}

function loadSavedAnswer(exerciseId, textareaElement) {
    let saved = null;
    if (window.CoreStorage && typeof window.CoreStorage.get === "function") {
        saved = window.CoreStorage.get(exerciseId);
    } else {
        const raw = localStorage.getItem(exerciseId);
        if (raw) saved = JSON.parse(raw);
    }

    if (saved && saved.content && textareaElement) {
        textareaElement.value = saved.content;
        textareaElement.style.height = "auto";
        textareaElement.style.height = textareaElement.scrollHeight + "px";
    }
}
    
