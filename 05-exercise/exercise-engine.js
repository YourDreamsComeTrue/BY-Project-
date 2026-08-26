let saveTimer = null;
let currentExerciseData = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. قراءة متغيرات المسار من الرابط (Lesson, Title, Exercise)
  const urlParams = new URLSearchParams(window.location.search);
  const lessonFolder = urlParams.get('lesson') || 'lesson01';
  const titleFolder = urlParams.get('title') || 'title01';
  const exerciseFile = urlParams.get('ex') || 'exercise01';

  // Build dynamic script source for the content file
  const scriptPath = `../CONTENT/${lessonFolder}/${titleFolder}/${exerciseFile}.js`;

  // 2. تحميل ملف التمرين المطلوب ديناميكياً
  const script = document.createElement('script');
  script.src = scriptPath;

  script.onload = () => {
    if (typeof exerciseData !== "undefined") {
      currentExerciseData = exerciseData;
      document.getElementById("questionText").textContent = currentExerciseData.question;
      
      // استرجاع البيانات المحفوظة سابقاً إن وجدت عبر CORE
      loadSavedAnswer(currentExerciseData.id);
    }
  };

  script.onerror = () => {
    document.getElementById("questionText").textContent = "تعذر تحميل السؤال من المسار المحدد.";
  };

  document.head.appendChild(script);

  // 3. التوسع التلقائي وإلغاء شريط التمرير
  const textarea = document.getElementById("userAnswer");
  textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";

    // الحفظ التلقائي للنسخة الأخيرة فقط (Debounce)
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 1200);
  });
});

// تغيير خلفية مربع النص
function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  textarea.classList.remove("bg-green", "bg-red");
  
  if (color === "green") textarea.classList.add("bg-green");
  if (color === "red") textarea.classList.add("bg-red");
}

// التوصيل مع طبقة CORE
function autoSaveData(latestText) {
  if (!currentExerciseData) return;

  const payload = {
    exerciseId: currentExerciseData.id,
    content: latestText,
    updatedAt: new Date().toISOString()
  };

  // استدعاء CORE للتخزين المركزية
  if (window.CoreStorage && typeof window.CoreStorage.save === "function") {
    window.CoreStorage.save(payload);
  } else {
    // تخزين مؤقت لحين ربط ملف CORE/storage.js
    localStorage.setItem(currentExerciseData.id, JSON.stringify(payload));
    console.log("حفظ في CORE (حالة التحدث الأخيرة):", payload);
  }
}

// دالة لجلب الإجابة السابقة من CORE عند فتح الصفحة
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
