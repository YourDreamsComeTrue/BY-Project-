let saveTimer = null;
let currentExerciseData = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. قراءة معرّف التمرين فقط من الرابط (مثال: exercise.html?id=l1-t1-e1)
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseId = urlParams.get('id') || 'l1-t1-e1';

  // 2. التحميل الديناميكي لملف البيانات من مجلد DATA المجاور باستعمال ES Modules
  try {
    const exerciseModule = await import(`./DATA/exercise-${exerciseId}.js`);
    currentExerciseData = exerciseModule.default || exerciseModule.exerciseData;

    if (currentExerciseData) {
      document.getElementById("questionText").textContent = currentExerciseData.question;
      
      // استرجاع البيانات المحفوظة سابقاً إن وجدت
      loadSavedAnswer(currentExerciseData.id || exerciseId);
    }
  } catch (error) {
    console.error("خطأ في تحميل ملف التمرين:", error);
    document.getElementById("questionText").textContent = "تعذر تحميل السؤال للمعرّف المحدد.";
  }

  // 3. التوسع التلقائي لمربع النص والحفظ التلقائي
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
