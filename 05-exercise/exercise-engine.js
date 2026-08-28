                           Let saveTimer = null;
let currentExerciseData = null;

Document.addEventListener("DOMContentLoaded", async () => {
  // 1. قراءة معرّف التمرين من الرابط مع ضبط المعرّف الافتراضي الجديد
  Const urlParams = new URLSearchParams(window.location.search);
  Const exerciseId = urlParams.get('id') || 'l000001-t02-e01';

  // 2. التحميل الديناميكي لملف البيانات من مجلد data بحروف صغيرة
  Try {
    Const exerciseModule = await import(`./data/exercise-${exerciseId}.js`);
    CurrentExerciseData = exerciseModule.default || exerciseModule.exerciseData;

    If (currentExerciseData) {
      Document.getElementById("questionText").textContent = currentExerciseData.question;
      LoadSavedAnswer(currentExerciseData.id || exerciseId);
    }
  } catch (error) {
    Console.error("خطأ في تحميل ملف التمرين:", error);
    Document.getElementById("questionText").textContent = "تعذر تحميل السؤال للمعرّف المحدد.";
  }

  // 3. التوسع التلقائي والحفظ
  Const textarea = document.getElementById("userAnswer");
  Textarea.addEventListener("input", function () {
    This.style.height = "auto";
    This.style.height = this.scrollHeight + "px";

    ClearTimeout(saveTimer);
    SaveTimer = setTimeout(() => {
      AutoSaveData(this.value);
    }, 1200);
  });
});

Function setBgColor(color) {
  Const textarea = document.getElementById("userAnswer");
  Textarea.classList.remove("bg-green", "bg-red");
  
  If (color === "green") textarea.classList.add("bg-green");
  If (color === "red") textarea.classList.add("bg-red");
}

Function autoSaveData(latestText) {
  If (!currentExerciseData) return;

  Const payload = {
    ExerciseId: currentExerciseData.id,
    Content: latestText,
    UpdatedAt: new Date().toISOString()
  };

  If (window.CoreStorage && typeof window.CoreStorage.save === "function") {
    Window.CoreStorage.save(payload);
  } else {
    LocalStorage.setItem(currentExerciseData.id, JSON.stringify(payload));
    Console.log("تم الحفظ في التخزين المحلي:", payload);
  }
}

Function loadSavedAnswer(id) {
  Const textarea = document.getElementById("userAnswer");
  Let saved = null;

  If (window.CoreStorage && typeof window.CoreStorage.get === "function") {
    Saved = window.CoreStorage.get(id);
  } else {
    Const raw = localStorage.getItem(id);
    If (raw) saved = JSON.parse(raw);
  }

  If (saved && saved.content) {
    Textarea.value = saved.content;
    Textarea.style.height = "auto";
    Textarea.style.height = textarea.scrollHeight + "px";
  }
  }
  
