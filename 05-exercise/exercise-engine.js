let saveTimer = null;
let currentExerciseData = null;

const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

// 1. استخراج سياق الاستخدام (context) مع اختيار 'standalone' في حال عدم وجود سياق
const contextId = urlParams.get('context') || 'standalone';

// 2. تحديد رقم المحاولة الحالية بناءً على السياق الحالي والتمرين
let currentAttempt = parseInt(urlParams.get('attempt') || getLastAttempt(contextId, exerciseId), 10);

// تركيب مفتاح التخزين الفريد المركب: [السياق]_[التمرين]_[المحاولة]
const getStorageKey = (ctx, exId, attemptNum) => `${ctx}_${exId}_attempt_${attemptNum}`;

function getLastAttempt(ctx, exId) {
  const lastSaved = localStorage.getItem(`${ctx}_${exId}_latest_attempt`);
  return lastSaved ? parseInt(lastSaved, 10) : 1;
}

function setLastAttempt(ctx, exId, attemptNum) {
  localStorage.setItem(`${ctx}_${exId}_latest_attempt`, attemptNum);
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
  setupModalEvents();

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
  const key = getStorageKey(contextId, exerciseId, currentAttempt);
  const payload = {
    contextId: contextId,
    exerciseId: exerciseId,
    attempt: currentAttempt,
    content: latestText,
    updatedAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
  };

  localStorage.setItem(key, JSON.stringify(payload));
  setLastAttempt(contextId, exerciseId, currentAttempt);
}

function loadSavedAnswer() {
  const textarea = document.getElementById("userAnswer");
  if (!textarea) return;

  const key = getStorageKey(contextId, exerciseId, currentAttempt);
  const raw = localStorage.getItem(key);
  
  if (raw) {
    const saved = JSON.parse(raw);
    textarea.value = saved.content || "";
  } else {
    textarea.value = "";
  }
  sendHeightToParent();
}

function setupModalEvents() {
  const modal = document.getElementById("historyModal");
  const btnOpen = document.getElementById("btnOpenHistory");
  const btnClose = document.getElementById("btnCloseModal");
  const btnNew = document.getElementById("btnNewAttempt");

  btnOpen?.addEventListener("click", () => {
    renderHistoryList();
    if (modal) modal.style.display = "flex";
  });

  btnClose?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnNew?.addEventListener("click", () => {
    const maxAttempt = getLastAttempt(contextId, exerciseId);
    currentAttempt = maxAttempt + 1;
    setLastAttempt(contextId, exerciseId, currentAttempt);
    loadSavedAnswer();
  });
}

function renderHistoryList() {
  const listContainer = document.getElementById("modalHistoryList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const totalAttempts = getLastAttempt(contextId, exerciseId);

  for (let i = totalAttempts; i >= 1; i--) {
    const key = getStorageKey(contextId, exerciseId, i);
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const item = JSON.parse(raw);
    
    const card = document.createElement("div");
    card.className = `history-item-card ${i === currentAttempt ? 'active' : ''}`;

    card.innerHTML = `
      <div class="history-item-header">
        <span class="history-title">المحاولة رقم (${item.attempt}) ${i === currentAttempt ? '<b>(الحالية)</b>' : ''}</span>
        <span class="history-date">${item.updatedAt || 'بدون تاريخ'}</span>
      </div>
      <div class="history-item-body">${item.content || '<i>محتوى فارغ</i>'}</div>
      <div class="history-item-actions">
        <button type="button" class="btn-history-action btn-copy-act">📋 نسخ المحتوى للمحاولة الحالية</button>
        <button type="button" class="btn-history-action btn-switch-act">👁️ فتح هذه المحاولة</button>
      </div>
    `;

    // زر نسخ المحتوى
    card.querySelector(".btn-copy-act").onclick = () => {
      const txt = document.getElementById("userAnswer");
      if (txt) {
        txt.value = item.content || "";
        autoSaveData(txt.value);
        sendHeightToParent();
        document.getElementById("historyModal").style.display = "none";
      }
    };

    // زر التبديل إلى المحاولة
    card.querySelector(".btn-switch-act").onclick = () => {
      currentAttempt = item.attempt;
      loadSavedAnswer();
      document.getElementById("historyModal").style.display = "none";
    };

    listContainer.appendChild(card);
  }
    }
