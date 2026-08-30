let saveTimer = null;
let currentExerciseData = null;

const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id') || 'l000001-t02-e01';
const contextId = urlParams.get('context') || urlParams.get('titleId') || urlParams.get('lessonId') || 'standalone';

let currentAttempt = parseInt(urlParams.get('attempt') || getLastAttempt(contextId, exerciseId), 10);
let isNewAttemptPending = false; 

const getStorageKey = (ctx, exId, attemptNum) => `ex_data_${ctx}_${exId}_att_${attemptNum}`;

function getLastAttempt(ctx, exId) {
  const lastSaved = localStorage.getItem(`ex_last_${ctx}_${exId}`);
  return lastSaved ? parseInt(lastSaved, 10) : 1;
}

function setLastAttempt(ctx, exId, attemptNum) {
  localStorage.setItem(`ex_last_${ctx}_${exId}`, attemptNum);
}

function sendHeightToParent() {
  const textarea = document.getElementById("userAnswer");
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }
  
  const container = document.querySelector(".exercise-card") || document.body;
  let contentHeight = container.getBoundingClientRect().height;
  
  const modal = document.getElementById("historyModal");
  if (modal && getComputedStyle(modal).display !== "none") {
    contentHeight = Math.max(contentHeight, 550);
  }

  window.parent.postMessage({ 
    type: "RESIZE_EXERCISE", 
    height: Math.ceil(contentHeight) + 20 
  }, "*");
}

document.addEventListener("DOMContentLoaded", async () => {
  setupModalEvents();
  setupFavoriteStar();
  
  document.getElementById("btnGreen")?.addEventListener("click", () => setBgColor("green"));
  document.getElementById("btnRed")?.addEventListener("click", () => setBgColor("red"));
  document.getElementById("btnReset")?.addEventListener("click", () => setBgColor("default"));

  try {
    const exerciseModule = await import(`./data/exercise-${exerciseId}.js`);
    currentExerciseData = exerciseModule.default || exerciseModule.exerciseData;

    if (currentExerciseData && currentExerciseData.question) {
      const qText = document.getElementById("questionText");
      if (qText) qText.textContent = currentExerciseData.question;
    }
  } catch (error) {
    console.error("خطأ في تحميل التمرين:", error);
  }

  loadSavedAnswer();

  const textarea = document.getElementById("userAnswer");
  
  textarea?.addEventListener("input", function () {
    if (isNewAttemptPending) {
      const maxAttempt = getLastAttempt(contextId, exerciseId);
      currentAttempt = maxAttempt + 1;
      isNewAttemptPending = false;
    }

    sendHeightToParent();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      autoSaveData(this.value);
    }, 300);
  });

  textarea?.addEventListener("blur", function () {
    clearTimeout(saveTimer);
    autoSaveData(this.value);
  });

  setTimeout(sendHeightToParent, 200);
});

// إعداد زر المفضلة ⭐ للتمرين
function setupFavoriteStar() {
  const favBtn = document.getElementById("btn-fav-exercise");
  if (!favBtn) return;

  favBtn.addEventListener("click", () => {
    const exTitle = currentExerciseData?.title || currentExerciseData?.question || `تمرين ${exerciseId}`;
    
    window.parent.postMessage({
      type: "ADD_TO_FAVORITE",
      itemType: "exercise",
      targetId: exerciseId,
      lessonId: contextId,
      title: exTitle,
      subtitle: "تمرين تفاعلي"
    }, "*");
  });
}

function setBgColor(color) {
  const textarea = document.getElementById("userAnswer");
  if (!textarea) return;
  textarea.classList.remove("bg-green", "bg-red");
  
  if (color === "green") textarea.classList.add("bg-green");
  if (color === "red") textarea.classList.add("bg-red");
}

function getFormattedEnglishDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${year}/${month}/${day} ${pad(hours)}:${minutes} ${ampm}`;
}

function autoSaveData(latestText) {
  if (!latestText.trim() && isNewAttemptPending) return;

  const key = getStorageKey(contextId, exerciseId, currentAttempt);
  const formattedDate = getFormattedEnglishDate();

  const payload = {
    contextId: contextId,
    exerciseId: exerciseId,
    attempt: currentAttempt,
    content: latestText,
    updatedAt: formattedDate
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

  if (btnNew) btnNew.innerHTML = "+";
  if (btnOpen) btnOpen.innerHTML = "☰";

  btnOpen?.addEventListener("click", (e) => {
    e.preventDefault();
    const textarea = document.getElementById("userAnswer");
    if (textarea) autoSaveData(textarea.value);

    renderHistoryList();
    if (modal) {
      modal.style.display = "flex";
      sendHeightToParent();
    }
  });

  btnClose?.addEventListener("click", (e) => {
    e.preventDefault();
    if (modal) {
      modal.style.display = "none";
      sendHeightToParent();
    }
  });

  btnNew?.addEventListener("click", (e) => {
    e.preventDefault();
    const textarea = document.getElementById("userAnswer");
    if (textarea) {
      textarea.value = "";
      textarea.focus();
    }
    isNewAttemptPending = true;
    if (modal) modal.style.display = "none";
    sendHeightToParent();
  });
}

function renderHistoryList() {
  const listContainer = document.getElementById("modalHistoryList");
  if (!listContainer) return;
  listContainer.innerHTML = "";

  const totalAttempts = getLastAttempt(contextId, exerciseId);
  let foundAny = false;

  for (let i = totalAttempts; i >= 1; i--) {
    const key = getStorageKey(contextId, exerciseId, i);
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const item = JSON.parse(raw);
    if (!item.content || !item.content.trim()) continue;

    foundAny = true;
    const card = document.createElement("div");
    card.className = `history-item-card ${i === currentAttempt ? 'active' : ''}`;

    card.innerHTML = `
      <div class="history-item-header">
        <span class="history-title">المحاولة (${item.attempt}) ${i === currentAttempt ? '<b>(الحالية)</b>' : ''}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="history-date">${item.updatedAt || ''}</span>
          <button type="button" class="btn-delete-attempt" title="حذف المحاولة">✖</button>
        </div>
      </div>
      <div class="history-item-body">${item.content}</div>
      <div class="history-item-actions">
        <button type="button" class="btn-history-action btn-copy-act">📋 نسخ المحتوى</button>
        <button type="button" class="btn-history-action btn-switch-act">👁️ فتح</button>
      </div>
    `;

    card.querySelector(".btn-delete-attempt").onclick = (e) => {
      e.stopPropagation();
      const isConfirmed = confirm("هل أنت متأكد أنك تريد حذف هذه المحاولة؟");
      if (isConfirmed) {
        deleteAndReorderAttempt(i);
      }
    };

    card.querySelector(".btn-copy-act").onclick = () => {
      const txt = document.getElementById("userAnswer");
      if (txt) {
        txt.value = item.content;
        autoSaveData(txt.value);
        sendHeightToParent();
        document.getElementById("historyModal").style.display = "none";
        sendHeightToParent();
      }
    };

    card.querySelector(".btn-switch-act").onclick = () => {
      currentAttempt = item.attempt;
      isNewAttemptPending = false;
      loadSavedAnswer();
      document.getElementById("historyModal").style.display = "none";
      sendHeightToParent();
    };

    listContainer.appendChild(card);
  }

  if (!foundAny) {
    listContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">لا توجد محاولات محفوظة بعد.</div>`;
  }
}

function deleteAndReorderAttempt(attemptToDelete) {
  const total = getLastAttempt(contextId, exerciseId);
  let validItems = [];

  for (let i = 1; i <= total; i++) {
    const key = getStorageKey(contextId, exerciseId, i);
    const raw = localStorage.getItem(key);
    
    if (i !== attemptToDelete && raw) {
      validItems.push(JSON.parse(raw));
    }
    localStorage.removeItem(key);
  }

  validItems.forEach((item, index) => {
    const newAttemptNum = index + 1;
    item.attempt = newAttemptNum;
    const newKey = getStorageKey(contextId, exerciseId, newAttemptNum);
    localStorage.setItem(newKey, JSON.stringify(item));
  });

  const newTotal = validItems.length;
  setLastAttempt(contextId, exerciseId, newTotal > 0 ? newTotal : 1);

  if (currentAttempt >= attemptToDelete) {
    currentAttempt = Math.max(1, currentAttempt - 1);
  }

  loadSavedAnswer();
  renderHistoryList();
}
