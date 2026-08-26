let saveTimer = null;
let currentExerciseData = null;

// دالة حساب المسار النسبي الصحيح لملف المحتوى
function resolvePath(lesson, title, file) {
    // الخروج من مجلد 04-title والدخول إلى 07-content
    return `../07-content/${lesson}/${title}/${file}.js`;
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. قراءة متغيرات المسار مع القيم الافتراضية المحددة
  const urlParams = new URLSearchParams(window.location.search);
  const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
  const titleFolder = urlParams.get('title') || 'title01';
  const exerciseFile = urlParams.get('ex') || 'title02';

  // 2. بناء المسار الديناميكي
  const scriptPath = resolvePath(lessonFolder, titleFolder, exerciseFile);

  // 3. تحميل ملف التمرين ديناميكياً
  const script = document.createElement('script');
  script.src = scriptPath;

  script.onload = () => {
    if (typeof exerciseData !== "undefined") {
      currentExerciseData = exerciseData;
      document.getElementById("questionText").textContent = currentExerciseData.question;
      
      loadSavedAnswer(currentExerciseData.id);
    }
  };

  script.onerror = () => {
    document.getElementById("questionText").textContent = "تعذر تحميل السؤال من المسار المحدد.";
  };

  document.head.appendChild(script);

  // 4. التوسع التلقائي لمربع النص والحفظ
  const textarea = document.getElementById("userAnswer");
  textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 1200);
  });
});

function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  textarea.classList.remove("bg-green", "bg-red");
  
  if (color === "green") textarea.classList.add("bg-green");
  if (color === "red") textarea.classList.add("bg-red");
}

function autoSaveData(latestText) {
  if (!currentExerciseData) return;

  const payload = {
    exerciseId: currentExerciseData.id,
    content: latestText,
    updatedAt: new Date().toISOString()
  };

  if (window.CoreStorage && typeof window.CoreStorage.save === "function") {
    window.CoreStorage.save(payload);
  } else {
    localStorage.setItem(currentExerciseData.id, JSON.stringify(payload));
    console.log("تم الحفظ في التخزين المحلي:", payload);
  }
}

function loadSavedAnswer(id) {
  const textarea = document.getElementById("userAnswer");
  let saved = null;

  if (window.CoreStorage && typeof window.CoreStorage.get === "function") {
    saved = window.CoreStorage.get(id);
  } else {
    const raw = localStorage.getItem(id);
    if (raw) saved = JSON.parse(raw);
  }

  if (saved && saved.content) {
    textarea.value = saved.content;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
}

