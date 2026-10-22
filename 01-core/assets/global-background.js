
/* =========================================================
   نظام إدارة وتغيير الخلفيات الديناميكي عبر الصفحات
   الملف: 01-core/assets/global-background.js
   ========================================================= */

(function () {
    'use strict';

    const BG_KEY = 'app_selected_background';

    // الخلفيات المتاحة
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

    // تحديد مسار الصورة بحسب مكان الصفحة
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

    // تطبيق الخلفية المحفوظة
    function applySavedBackground() {
        const savedIndex = localStorage.getItem(BG_KEY);
        const parsedIndex = savedIndex === null
            ? 0
            : parseInt(savedIndex, 10);

        const indexToUse =
            Number.isInteger(parsedIndex) &&
            availableBackgrounds[parsedIndex]
                ? parsedIndex
                : 0;

        setBackground(indexToUse, false);
    }

    // تغيير الخلفية
    function setBackground(index, save = true) {
        const bg = availableBackgrounds[index];

        if (!bg) return;

        const container = document.getElementById('mainContainer');
        const videoEl = document.getElementById('bg-video-element');

        if (!container) {
            console.warn('لم يتم العثور على العنصر mainContainer');
            return;
        }

        // إيقاف الفيديو السابق إن وُجد
        if (videoEl) {
            videoEl.pause();
            videoEl.style.display = 'none';
            videoEl.removeAttribute('src');
            videoEl.load();
        }

        // إزالة خصائص الخلفية السابقة
        container.style.backgroundImage = 'none';
        container.style.backgroundColor = '';
        container.style.backgroundSize = '';
        container.style.backgroundPosition = '';
        container.style.backgroundRepeat = '';

        // -----------------------------------------
        // الخيار الأول: الخلفية البيضاء
        // -----------------------------------------
        if (bg.type === 'color') {
            container.style.background = bg.value;
            container.classList.remove('dark-theme');
            container.classList.add('light-theme');
        }

        // -----------------------------------------
        // الخيار الثاني: خلفية النجوم المتحركة
        // -----------------------------------------
        else if (bg.type === 'image') {
            const imagePath = getBackgroundPath(bg.path);

            // إزالة أي لون أو تدرج داكن فوق الصورة
            container.style.background = 'transparent';
            container.style.backgroundColor = 'transparent';

            // عرض صورة GIF الأصلية دون طبقة تعتيم
            container.style.backgroundImage =
                `url("${imagePath}")`;

            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundPosition = 'center center';
            container.style.backgroundSize = 'cover';

            container.classList.remove('light-theme');
            container.classList.add('dark-theme');
        }

        // -----------------------------------------
        // خيار الفيديو، إذا أُضيف مستقبلًا
        // -----------------------------------------
        else if (bg.type === 'video') {
            if (videoEl) {
                videoEl.src = bg.path;
                videoEl.style.display = 'block';

                videoEl.play().catch(function (error) {
                    console.log('تعذر تشغيل الفيديو تلقائيًا:', error);
                });
            }

            container.style.background =
                'linear-gradient(rgba(15, 23, 42, 0.4), ' +
                'rgba(15, 23, 42, 0.4))';

            container.classList.remove('light-theme');
            container.classList.add('dark-theme');
        }

        // حفظ الاختيار
        if (save) {
            localStorage.setItem(BG_KEY, String(index));
        }

        // إعلام بقية أجزاء التطبيق بتغيير الخلفية
        document.dispatchEvent(
            new CustomEvent('appBackgroundChanged', {
                detail: {
                    index: index,
                    type: bg.type,
                    name: bg.name
                }
            })
        );
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

        // فتح نافذة اختيار الخلفية
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

        // إغلاق النافذة
        closeBgModal?.addEventListener('click', function () {
            if (bgModal) {
                bgModal.style.display = 'none';
            }
        });

        // إغلاق النافذة عند النقر خارجها
        document.addEventListener('click', function (e) {
            if (
                bgModal &&
                bgModal.style.display !== 'none' &&
                !bgModal.contains(e.target) &&
                !btnOpenBg?.contains(e.target)
            ) {
                bgModal.style.display = 'none';
            }
        });

        // إنشاء أزرار الخلفيات
        if (optionsContainer) {
            optionsContainer.innerHTML = '';

            availableBackgrounds.forEach(function (bg, idx) {
                let icon = '🖼️';

                if (bg.type === 'video') {
                    icon = '🎬';
                } else if (bg.type === 'color') {
                    icon = '⬜';
                }

                const button = document.createElement('button');

                button.type = 'button';
                button.className =
                    'top-action-btn bg-option-btn';

                button.dataset.index = String(idx);

                button.style.width = '100%';
                button.style.justifyContent = 'center';
                button.style.marginBottom = '4px';

                button.textContent = `${icon} ${bg.name}`;

                button.addEventListener('click', function () {
                    setBackground(idx, true);

                    if (bgModal) {
                        bgModal.style.display = 'none';
                    }
                });

                optionsContainer.appendChild(button);
            });
        }
    });
})();
            
