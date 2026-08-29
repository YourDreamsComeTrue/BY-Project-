let saveTimer = null;
let currentExerciseData = null;

function sendHeightToParent() {
  const textarea = document.getElementById("userAnswer");
  if (textarea) {
    // 1. إعادة تعيين الارتفاع مؤقتاً لحساب الانكماش الصحيح عند الحذف
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  
  // 2. إرسال الارتفاع الصافي للتمرين مع هامش بسيط
  const container = document.querySelector(".exercise-container") || document.body;
  const contentHeight = container.getBoundingClientRect().height;
  
  window.parent.postMessage({ 
    type: "RESIZE_EXERCISE", 
    height: Math.ceil(contentHeight) + 10 
  }, "*");
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

  document.getElementById("btnGreen")?.addEventListener("click", () => setBgColor("green"));
  document.getElementById("btnRed")?.addEventListener("click", () => setBgColor("red"));
  document.getElementById("btnReset")?.addEventListener("click", () => setBgColor("default"));

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

  const textarea = document.getElementById("userAnswer");
  textarea?.addEventListener("input", function () {
    sendHeightToParent(); // تحديث وتعديل الارتفاع زيارة أو نقصاناً عند كل تغيير

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 1200);
  });

  setTimeout(sendHeightToParent, 200);
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
    sendHeightToParent();
  }
  }
