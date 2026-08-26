let saveTimer = null;
let currentExerciseData = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. قراءة متغيرات المسار من الرابط (مع وضع قيم افتراضية تطابق مجلداتك)
  const urlParams = new URLSearchParams(window.location.search);
  const lessonFolder = urlParams.get('lesson') || 'lesson-00001';
  const titleFolder = urlParams.get('title') || 'titile-01';
  const exerciseFile = urlParams.get('ex') || 'exercise01';

  // 2. بناء المسار الديناميكي المباشر للملف من مجلد 07-content
  const scriptPath = `../07-content/${lessonFolder}/${titleFolder}/${exerciseFile}.js`;

  // 3. تحميل ملف التمرين المطلوب ديناميكياً
  const script = document.createElement('script');
  script.src = scriptPath;

  script.onload = () => {
    if (typeof exerciseData !== "undefined") {
      currentExerciseData = exerciseData;
      document.getElementById("questionText").textContent = currentExerciseData.question;
      
      // استرجاع البيانات المحفوظة سابقاً إن وجدت
      loadSavedAnswer(currentExerciseData.id);
    }
  };

  script.onerror = () => {
    document.getElementById("questionText").textContent = "تعذر تحميل السؤال من المسار المحدد.";
  };

  document.head.appendChild(script);

  // 4. التوسع التلقائي لمربع النص والحفظ التلقائي
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

// تغيير خلفية مربع النص
function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  textarea.classList.remove("bg-green", "bg-red");
  
  if (color === "green") textarea.classList.add("bg-green");
  if (color === "red") textarea.classList.add("bg-red");
}

// التوصيل مع طبقة CORE أو التخزين المحلي
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

// جلب الإجابة السابقة عند فتح الصفحة
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
  
