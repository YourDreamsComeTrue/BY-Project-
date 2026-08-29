let saveTimer = null;
let currentExerciseData = null;

const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

// 1. تحديد رقم المحاولة تلقائياً (من الـ URL أو معرفة آخر محاولة وصل لها المستخدم)
let currentAttempt = parseInt(urlParams.get('attempt') || getLastAttempt(exerciseId), 10);

const getStorageKey = (exId, attemptNum) => `${exId}_attempt_${attemptNum}`;

// الحصول على رقم آخر محاولة تم حفظها لهذا التمرين
function getLastAttempt(exId) {
  const lastSaved = localStorage.getItem(`${exId}_latest_attempt`);
  return lastSaved ? parseInt(lastSaved, 10) : 1;
}

// تحديث سجل رقم آخر محاولة
function setLastAttempt(exId, attemptNum) {
  localStorage.setItem(`${exId}_latest_attempt`, attemptNum);
}

function sendHeightToParent() {
  const textarea = document.getElementById("userAnswer");
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  
  const container = document.querySelector(".exercise-container") || document.body;
  const contentHeight = container.getBoundingClientRect().height;
  
  window.parent.postMessage({ 
    type: "RESIZE_EXERCISE", 
    height: Math.ceil(contentHeight) + 10 
  }, "*");
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("btnGreen")?.addEventListener("click", () => setBgColor("green"));
  document.getElementById("btnRed")?.addEventListener("click", () => setBgColor("red"));
  document.getElementById("btnReset")?.addEventListener("click", () => setBgColor("default"));

  try {
    const exerciseModule = await import(`./data/exercise-${exerciseId}.js`);
    currentExerciseData = exerciseModule.default || exerciseModule.exerciseData;

    if (currentExerciseData && currentExerciseData.question) {
      document.getElementById("questionText").textContent = currentExerciseData.question;
    }
  } catch (error) {
    console.error("خطأ في تحميل التمرين:", error);
  }

  loadSavedAnswer();
  renderAttemptControls();

  const textarea = document.getElementById("userAnswer");
  textarea?.addEventListener("input", function () {
    sendHeightToParent();

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 1200);
  });

  setTimeout(sendHeightToParent, 200);
});

function autoSaveData(latestText) {
  if (!currentExerciseData) return;

  const key = getStorageKey(exerciseId, currentAttempt);
  const payload = {
    exerciseId: exerciseId,
    attempt: currentAttempt,
    content: latestText,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(key, JSON.stringify(payload));
  setLastAttempt(exerciseId, currentAttempt); // حفظ أن هذه هي المحاولة النشطة حالياً
}

function loadSavedAnswer() {
  const textarea = document.getElementById("userAnswer");
  if (!textarea) return;

  const key = getStorageKey(exerciseId, currentAttempt);
  const raw = localStorage.getItem(key);
  
  if (raw) {
    const saved = JSON.parse(raw);
    textarea.value = saved.content || "";
    sendHeightToParent();
  }
}

// 2. إنشاء أزرار التحكم بالمحاولات تلقائياً داخل التمرين
function renderAttemptControls() {
  const actionContainer = document.querySelector(".exercise-actions") || document.body;
  
  // شريط التحكم بالمتصفح
  let controlsWrapper = document.getElementById("attempt-controls");
  if (!controlsWrapper) {
    controlsWrapper = document.createElement("div");
    controlsWrapper.id = "attempt-controls";
    controlsWrapper.style.cssText = "margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;";
    actionContainer.appendChild(controlsWrapper);
  }
  controlsWrapper.innerHTML = "";

  // أ) زر فتح محاولة جديدة فارغة
  const newAttemptBtn = document.createElement("button");
  newAttemptBtn.type = "button";
  newAttemptBtn.className = "btn-attempt-control";
  newAttemptBtn.textContent = `➕ محاولة جديدة (${currentAttempt + 1})`;
  newAttemptBtn.onclick = () => {
    currentAttempt += 1;
    setLastAttempt(exerciseId, currentAttempt);
    document.getElementById("userAnswer").value = "";
    renderAttemptControls();
    sendHeightToParent();
  };
  controlsWrapper.appendChild(newAttemptBtn);

  // ب) زر نسخ المحاولة السابقة (يظهر فقط إذا كنا في محاولة 2 أو أكثر)
  if (currentAttempt > 1) {
    const copyPrevBtn = document.createElement("button");
    copyPrevBtn.type = "button";
    copyPrevBtn.className = "btn-attempt-control btn-copy";
    copyPrevBtn.textContent = `📋 نسخ إجابة المحاولة (${currentAttempt - 1})`;
    copyPrevBtn.onclick = () => {
      const prevKey = getStorageKey(exerciseId, currentAttempt - 1);
      const raw = localStorage.getItem(prevKey);
      if (raw) {
        const prevSaved = JSON.parse(raw);
        const textarea = document.getElementById("userAnswer");
        textarea.value = prevSaved.content || "";
        autoSaveData(textarea.value);
        sendHeightToParent();
      }
    };
    controlsWrapper.appendChild(copyPrevBtn);
  }
  }
