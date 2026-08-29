let saveTimer = null;
let currentExerciseData = null;

const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

// 1. تحديد رقم المحاولة تلقائياً (من الـ URL أو آخر محاولة وصل لها المستخدم)
let currentAttempt = parseInt(urlParams.get('attempt') || getLastAttempt(exerciseId), 10);

const getStorageKey = (exId, attemptNum) => `${exId}_attempt_${attemptNum}`;

function getLastAttempt(exId) {
  const lastSaved = localStorage.getItem(`${exId}_latest_attempt`);
  return lastSaved ? parseInt(lastSaved, 10) : 1;
}

function setLastAttempt(exId, attemptNum) {
  localStorage.setItem(`${exId}_latest_attempt`, attemptNum);
}

function sendHeightToParent() {
  const textarea = document.getElementById("userAnswer");
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  
  const container = document.querySelector(".exercise-card") || document.body;
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

function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  if (!textarea) return;
  textarea.classList.remove("bg-green", "bg-red");
  
  if (color === "green") textarea.classList.add("bg-green");
  if (color === "red") textarea.classList.add("bg-red");
}

function autoSaveData(latestText) {
  const key = getStorageKey(exerciseId, currentAttempt);
  const payload = {
    exerciseId: exerciseId,
    attempt: currentAttempt,
    content: latestText,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(key, JSON.stringify(payload));
  setLastAttempt(exerciseId, currentAttempt);
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

// 2. إدارة وتحديث أزرار المحاولات داخل العنصر #attempt-controls المحدد في HTML
function renderAttemptControls() {
  const controlsWrapper = document.getElementById("attempt-controls");
  if (!controlsWrapper) return;
  
  controlsWrapper.innerHTML = "";

  // أ) زر فتح محاولة جديدة فارغة
  const newAttemptBtn = document.createElement("button");
  newAttemptBtn.type = "button";
  newAttemptBtn.className = "btn-attempt-control";
  newAttemptBtn.textContent = `➕ محاولة جديدة (${currentAttempt + 1})`;
  newAttemptBtn.onclick = () => {
    currentAttempt += 1;
    setLastAttempt(exerciseId, currentAttempt);

    const txt = document.getElementById("userAnswer");
    if (txt) txt.value = "";
    
    renderAttemptControls();
    sendHeightToParent();
  };
  controlsWrapper.appendChild(newAttemptBtn);

  // ب) زر نسخ المحاولة السابقة (يظهر بداية من المحاولة 2)
  if (currentAttempt > 1) {
    const copyPrevBtn = document.createElement("button");
    copyPrevBtn.type = "button";
    copyPrevBtn.className = "btn-attempt-control btn-copy";
    copyPrevBtn.textContent = `📋 نسخ المحاولة (${currentAttempt - 1})`;
    copyPrevBtn.onclick = () => {
      const prevKey = getStorageKey(exerciseId, currentAttempt - 1);
      const raw = localStorage.getItem(prevKey);
      if (raw) {
        const prevSaved = JSON.parse(raw);
        const txt = document.getElementById("userAnswer");
        if (txt) {
          txt.value = prevSaved.content || "";
          autoSaveData(txt.value);
          sendHeightToParent();
        }
      }
    };
    controlsWrapper.appendChild(copyPrevBtn);
  }
                   }
                          
