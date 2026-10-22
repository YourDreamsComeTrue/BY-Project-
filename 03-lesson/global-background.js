
/* =========================================================
   نظام إدارة وتغيير الخلفيات الديناميكي عبر الصفحات
   الملف: 03-lesson/global-background.js
   ========================================================= */

(function () {
    'use strict';

    const BG_KEY = 'app_selected_background';

    // قائمة الخلفيات المتاحة
    const availableBackgrounds = [
        {
            name: 'خلفية بيضاء',
            type: 'color',
            value: '#ffffff'
        },
        {
            name: 'خلفية 1',
            type: 'image',
            path: 'images/background-01.gif'
        }
    ];

    // تطبيق الخلفية المحفوظة
    function applySavedBackground() {
        const savedIndex = localStorage.getItem(BG_KEY);
        const indexToUse =
            savedIndex !== null ? parseInt(savedIndex, 10) : 0;

        if (
            Number.isInteger(indexToUse) &&
            availableBackgrounds[indexToUse]
        ) {
            setBackground(indexToUse, false);
        } else {
            setBackground(0, false);
        }
    }

    // تحديد مسار صورة الخلفية
    function getBackgroundPath(path) {
        const pathname = window.location.pathname;

        if (
            pathname.includes('/02-index/') ||
            pathname.includes('/03-lesson/') ||
            pathname.includes('/07-favorites/')
        ) {
            return '../01-core/assets/' + path;
        }

        return '01-core/assets/' + path;
    }

    // تغيير الخلفية
    function setBackground(index, save = true) {
        const bg = availableBackgrounds[index];

        if (!bg) return;

        const container = document.getElementById('mainContainer');
        const videoEl = document.getElementById('bg-video-element');

        if (!container) return;

        // إيقاف الفيديو السابق إن وُجد
        if (videoEl) {
            videoEl.pause();
            videoEl.style.display = 'none';
        }

        // إزالة خصائص الخلفية السابقة
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = '';
        container.style.backgroundSize = '';
        container.style.backgroundPosition = '';
        container.style.backgroundRepeat = '';

        // -----------------------------------------
        // الخلفية البيضاء
        // -----------------------------------------
        if (bg.type === 'color') {
            container.style.background = bg.value;

            container.classList.remove('dark-theme');
            container.classList.add('light-theme');
        }

        // -----------------------------------------
        // خلفية صورة أو GIF متحرك
        // -----------------------------------------
        else if (bg.type === 'image') {
            const imagePath = getBackgroundPath(bg.path);

            // عرض الصورة مباشرة دون تدرج داكن فوقها
            container.style.backgroundImage =
                `url("${imagePath}")`;

            container.style.backgroundColor = 'transparent';
            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundPosition = 'center center';
            container.style.backgroundSize = 'cover';

            container.classList.remove('light-theme');
            container.classList.add('dark-theme');
        }

        // -----------------------------------------
        // خلفية فيديو مستقبلية
        // -----------------------------------------
        else if (bg.type === 'video') {
            if (videoEl) {
                videoEl.src = bg.path;
                videoEl.style.display = 'block';

                videoEl.play().catch(function (error) {
                    console.log(
                        'تعذر تشغيل الفيديو تلقائيًا:',
                        error
                    );
                });
            }

            container.style.background =
                'linear-gradient(rgba(15, 23, 42, 0.4), ' +
                'rgba(15, 23, 42, 0.4))';

            container.classList.remove('light-theme');
            container.classList.add('dark-theme');
        }

        // حفظ اختيار المستخدم
        if (save) {
            localStorage.setItem(BG_KEY, String(index));
        }
    }

    // -----------------------------------------
    // تهيئة النظام بعد تحميل الصفحة
    // -----------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        applySavedBackground();

        const btnOpenBg =
            document.getElementById('btnOpenBgModal');

        const bgModal =
            document.getElementById('bgModal');

        const closeBgModal =
            document.getElementById('closeBgModal');

        const optionsContainer =
            document.getElementById('bg-options-container');

        // فتح قائمة الخلفيات
        btnOpenBg?.addEventListener('click', function (e) {
            e.stopPropagation();

            if (bgModal) {
                const currentDisplay =
                    window.getComputedStyle(bgModal).display;

                bgModal.style.display =
                    currentDisplay === 'none'
                        ? 'block'
                        : 'none';
            }
        });

        // إغلاق القائمة
        closeBgModal?.addEventListener('click', function () {
            if (bgModal) {
                bgModal.style.display = 'none';
            }
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function (e) {
            if (
                bgModal &&
                bgModal.style.display === 'block' &&
                !bgModal.contains(e.target) &&
                !btnOpenBg?.contains(e.target)
            ) {
                bgModal.style.display = 'none';
            }
        });

        // إنشاء أزرار الخلفيات
        if (optionsContainer) {
            let html = '';

            availableBackgrounds.forEach(function (bg, idx) {
                let icon = '🖼️';

                if (bg.type === 'video') {
                    icon = '🎬';
                } else if (bg.type === 'color') {
                    icon = '⬜';
                }

                html += `
                    <button
                        type="button"
                        class="top-action-btn bg-option-btn"
                        data-index="${idx}"
                        style="
                            width: 100%;
                            justify-content: center;
                            margin-bottom: 4px;
                        "
                    >
                        ${icon} ${bg.name}
                    </button>
                `;
            });

            optionsContainer.innerHTML = html;

            // التعامل مع اختيار الخلفية
            optionsContainer
                .querySelectorAll('.bg-option-btn')
                .forEach(function (btn) {
                    btn.addEventListener('click', function (e) {
                        const idx = parseInt(
                            e.currentTarget.getAttribute('data-index'),
                            10
                        );

                        setBackground(idx, true);

                        if (bgModal) {
                            bgModal.style.display = 'none';
                        }
                    });
                });
        }
    });
})();
                
