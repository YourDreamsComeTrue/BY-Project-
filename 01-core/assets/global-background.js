// نظام إدارة وتغيير الخلفيات الديناميكي عبر الصفحات
(function() {
    const BG_KEY = 'app_selected_background';

    // قائمة الخلفيات المتاحة (يمكنك إضافة أي خلفية جديدة هنا مستقبلاً بسهولة تامة)
    const availableBackgrounds = [
        {
            name: 'خلفية 1 (الافتراضية GIF)',
            type: 'image', // تدعم jpg, png, gif
            path: 'assets/exercise-background.gif' // ملاحظة المسار بالنسبة للفهرس
        },
        {
            name: 'خلفية 2 (فيديو متحرك)',
            type: 'video', // تدعم mp4
            path: 'assets/background-video.mp4'
        },
        {
            name: 'خلفية بيضاء',
            type: 'color', // نوع خاص باللون السادة
            value: '#ffffff'
        }
        // أضف أي خلفية جديدة هنا مستقبلاً بهذا الشكل:
        // { name: 'خلفية 3', type: 'image', path: 'assets/my-new-image.jpg' }
    ];

    // تطبيق الخلفية المخزنة فور تحميل الصفحة
    function applySavedBackground() {
        const savedIndex = localStorage.getItem(BG_KEY);
        const indexToUse = savedIndex !== null ? parseInt(savedIndex) : 0; // الافتراضية هي الأولى
        if (availableBackgrounds[indexToUse]) {
            setBackground(indexToUse, false);
        }
    }

    function setBackground(index, save = true) {
        const bg = availableBackgrounds[index];
        if (!bg) return;

        const container = document.getElementById('mainContainer');
        const videoEl = document.getElementById('bg-video-element');

        // إيقاف الفيديو افتراضياً عند التغيير
        if (videoEl) {
            videoEl.pause();
            videoEl.style.display = 'none';
        }

        if (bg.type === 'video') {
            if (videoEl) {
                videoEl.src = bg.path;
                videoEl.style.display = 'block';
                videoEl.play().catch(e => console.log("تشغيل الفيديو تلقائياً محظور من المتصفح", e));
            }
            if (container) {
                container.style.background = 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4))';
                container.style.color = '#f8fafc';
            }
        } else if (bg.type === 'color') {
            // معالجة الخلفية البيضاء السادة
            if (container) {
                container.style.background = bg.value;
                container.style.color = '#0f172a'; // جعل النصوص داكنة لتكون واضحة على الخلفية البيضاء
            }
        } else {
            if (container) {
                container.style.color = '#f8fafc';
                // ضبط مسار الصورة أو الـ GIF مع مراعاة مسار الصفحة الحالية
                let imagePath = bg.path;
                if (window.location.pathname.includes('/03-lesson/') || window.location.pathname.includes('/07-favorites/')) {
                    imagePath = '../02-index/' + bg.path;
                }
                container.style.background = `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('${imagePath}') no-repeat center center`;
                container.style.backgroundSize = 'cover';
            }
        }

        if (save) {
            localStorage.setItem(BG_KEY, index);
        }
    }

    // بناء واجهة الأزرار تلقائياً داخل النافذة المنسدلة
    document.addEventListener("DOMContentLoaded", () => {
        applySavedBackground();

        const btnOpenBg = document.getElementById("btnOpenBgModal");
        const bgModal = document.getElementById("bgModal");
        const closeBgModal = document.getElementById("closeBgModal");
        const optionsContainer = document.getElementById("bg-options-container");

        // فتح وإغلاق نافذة الخلفيات
        btnOpenBg?.addEventListener("click", (e) => {
            e.stopPropagation();
            if (bgModal) {
                const currentDisplay = window.getComputedStyle(bgModal).display;
                bgModal.style.display = (currentDisplay === "none" || currentDisplay === "") ? "block" : "none";
            }
        });

        closeBgModal?.addEventListener("click", () => {
            if (bgModal) bgModal.style.display = "none";
        });

        document.addEventListener("click", (e) => {
            if (bgModal && bgModal.style.display === "block") {
                if (!bgModal.contains(e.target) && !btnOpenBg?.contains(e.target)) {
                    bgModal.style.display = "none";
                }
            }
        });

        // توليد خيارات الأزرار بناءً على مصفوفة الخلفيات المتاحة وتحديد الأيقونة المناسبة
        if (optionsContainer) {
            let html = '';
            availableBackgrounds.forEach((bg, idx) => {
                let icon = '🖼️'; // افتراضي للصور
                if (bg.type === 'video') icon = '🎬';
                if (bg.type === 'color') icon = '⬜';

                html += `<button type="button" class="top-action-btn bg-option-btn" data-index="${idx}" style="width: 100%; justify-content: center;">${icon} ${bg.name}</button>`;
            });
            optionsContainer.innerHTML = html;

            // تفعيل الأحداث عند النقر على أي خلفية
            optionsContainer.querySelectorAll('.bg-option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                    setBackground(idx, true);
                    if (bgModal) bgModal.style.display = 'none';
                });
            });
        }
    });
})();
                                  
