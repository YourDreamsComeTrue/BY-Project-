let saveTimer = null;
let currentExerciseData = null;

// دالة حساب الارتفاع وإرسال الرسالة إلى الحاوية الرئيسية (title-engine)
function sendHeightToParent() {
  const textarea = document.getElementById("userAnswer");
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  
  // حساب الارتفاع الإجمالي للمستند وإرساله للأب
  const fullHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  window.parent.postMessage({ type: "RESIZE_EXERCISE", height: fullHeight + 20 }, "*");
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. قراءة المعرّف من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

  // 2. ربط أزرار الألوان
  document.getElementById("btnGreen")?.addEventListener("click", () => setBgColor("green"));
  document.getElementById("btnRed")?.addEventListener("click", () => setBgColor("red"));
  document.getElementById("btnReset")?.addEventListener("click", () => setBgColor("default"));

  // 3. التحميل الديناميكي للبيانات
  try {
    const exerciseModule = await import(`./data/exercise-${exerciseId}.js`);
    currentExerciseData = exerciseModule.default || exerciseModule.exerciseData;

    if (currentExerciseData && currentExerciseData.question) {
      document.getElementById("questionText").textContent = currentExerciseData.question;
      loadSavedAnswer(currentExerciseData.id || exerciseId);
    } else {
      document.getElementById("questionText").textContent = "الملف موجود ولكن لم يتم العثور على نص السؤال.";
    }
  } catch (error) {
    console.error("خطأ في تحميل ملف التمرين:", error);
    document.getElementById("questionText").textContent = "تعذر تحميل السؤال للمعرّف المحدد.";
  }

  // 4. الحفظ التلقائي وتحديث الارتفاع للأب عند الكتابة
  const textarea = document.getElementById("userAnswer");
  textarea?.addEventListener("input", function () {
    sendHeightToParent(); // تحديث الارتفاع لحظياً مع كل سطر جديد

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 1200);
  });

  // إرسال الارتفاع الأولي بعد استقرار العناصر في الصفحة
  setTimeout(sendHeightToParent, 300);
});

function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  if (!textarea) return;
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
  if (!textarea) return;
  let saved = null;

  if (window.CoreStorage && typeof window.CoreStorage.get === "function") {
    saved = window.CoreStorage.get(id);
  } else {
    const raw = localStorage.getItem(id);
    if (raw) saved = JSON.parse(raw);
  }

  if (saved && saved.content) {
    textarea.value = saved.content;
    sendHeightToParent(); // ضبط الارتفاع بناءً على النص المسترجع
  }
                          }
    
