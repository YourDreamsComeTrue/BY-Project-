let currentExerciseData = null;
let saveTimer = null;

// 1. استخراج متغيرات الرابط
const urlParams = new URLSearchParams(window.location.search);
const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
const titleFolder = urlParams.get('title') || 'title-02';
const exerciseFile = urlParams.get('ex') || 'exercise01';
const ritualType = urlParams.get('ritual') || 'seed';

// 2. دوال المسارات
function getRitualPath(type) {
    return `../06-rituels/${type}/${type}.html`;
}

function getContentScriptPath(lesson, title, file) {
    return `../07-content/${lesson}/${title}/${file}.js`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    loadContentData();
});

// 3. إدارة التبويبات (الأيقونات الأربعة والـ iframe للطقوس)
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

    const defaultBtn = document.getElementById("btn-watch");
    if (defaultBtn) defaultBtn.click();
}

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

// 4. جلب ملف التمرين وتعبئة العناصر الثابتة في الصفحة
function loadContentData() {
    const scriptPath = getContentScriptPath(lessonFolder, titleFolder, exerciseFile);
    const script = document.createElement("script");
    script.src = scriptPath;

    script.onload = () => {
        if (typeof exerciseData !== "undefined") {
            currentExerciseData = exerciseData;
            
            // وضع السؤال في العنصر المخصص له في الـ HTML الأصلي
            const questionEl = document.getElementById("questionText");
            if (questionEl) {
                questionEl.textContent = currentExerciseData.question;
            }

            // ربط مربع النص بالحفظ والاسترجاع
            const textarea = document.getElementById("userAnswer");
            if (textarea) {
                loadSavedAnswer(currentExerciseData.id, textarea);

                textarea.addEventListener("input", function () {
                    this.style.height = "auto";
                    this.style.height = this.scrollHeight + "px";

                    clearTimeout(saveTimer);
                    saveTimer = setTimeout(() => {
                        autoSaveData(currentExerciseData.id, this.value);
                    }, 1200);
                });
            }
        }
    };

    script.onerror = () => {
        const questionEl = document.getElementById("questionText");
        if (questionEl) {
            questionEl.textContent = "تعذر تحميل السؤال من المسار المحدد.";
        }
    };

    document.head.appendChild(script);
}

// 5. الحفظ والاسترجاع
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
            
