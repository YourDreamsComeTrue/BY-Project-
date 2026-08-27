// 07-content/lesson-00001/lesson2.js

async function loadAvailableTitles() {
  const titles = [];

  // محاولة تحميل العنوان الأول
  try {
    const t1 = await import('./title-01/title01.js');
    titles.push(t1.default);
  } catch (e) {
    console.warn("العنوان 1 غير جاهز بعد");
  }

  // محاولة تحميل العنوان الثاني
  try {
    const t2 = await import('./title-02/title02.js');
    titles.push(t2.default);
  } catch (e) {
    console.warn("العنوان 2 غير جاهز بعد");
  }

  return titles;
}

export default await loadAvailableTitles();
  
