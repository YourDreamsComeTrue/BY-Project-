// نظام إدارة وتغيير الخلفيات الديناميكي عبر الصفحات
(function() {
    const BG_KEY = 'app_selected_background';

    // قائمة الخلفيات المتاحة
    const availableBackgrounds = [
        {
            name: 'خلفية 1 (الافتراضية GIF)',
            type: 'image',
            path: 'assets/exercise-background.gif'
        },
        {
            name: 'خلفية 2 (فيديو متحرك)',
            type: 'video',
            path: 'assets/background-video.mp4'
        },
        {
            name: 'خلفية بيضاء',
            type: 'color',
            value: '#ffffff'
        }
    ];

    function applySavedBackground() {
        const savedIndex = localStorage.getItem(BG_KEY);
        const indexToUse = savedIndex !== null ? parseInt(savedIndex) : 0;
        if (availableBackgrounds[indexToUse]) {
            setBackground(indexToUse, false);
        }
    }

    function setBackground(index, save = true) {
        const bg = availableBackgrounds[index];
        if (!bg) return;

        const container = document.getElementById('mainContainer');
        const videoEl = document.getElementById('bg-video-element');

        if (videoEl) {
            videoEl.pause();
            videoEl.style.display = 'none';
        }

        if (!container) return;

        if (bg.type === 'video') {
            if (videoEl) {
                videoEl.src = bg.path;
                videoEl.style.display = 'block';
                videoEl.play().catch(e => console.log("تشغيل الفيديو محظور", e));
            }
            container.style.background = 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4))';
            container.style.color = '#f8fafc';
        } else if (bg.type === 'color') {
            // تطبيق اللون الأبيض المباشر وإلغاء أي صور سابقة
            container.style.backgroundImage = 'none';
            container.style.background = bg.value;
            container.style.color = '#0f172a'; // نص داكن وواضح على الأبيض
        } else {
            container.style.color = '#f8fafc';
            let imagePath = bg.path;
            if (window.location.pathname.includes('/03-lesson/') || window.location.pathname.includes('/07-favorites/')) {
                imagePath = '../02-index/' + bg.path;
            }
            container.style.background = `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('${imagePath}') no-repeat center center`;
            container.style.backgroundSize = 'cover';
        }

        if (save) {
            localStorage.setItem(BG_KEY, index);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        applySavedBackground();

        const btnOpenBg = document.getElementById("btnOpenBgModal");
        const bgModal = document.getElementById("bgModal");
        const closeBgModal = document.getElementById("closeBgModal");
        const optionsContainer = document.getElementById("bg-options-container");

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

        if (optionsContainer) {
            let html = '';
            availableBackgrounds.forEach((bg, idx) => {
                let icon = '🖼️';
                if (bg.type === 'video') icon = '🎬';
                if (bg.type === 'color') icon = '⬜';

                html += `<button type="button" class="top-action-btn bg-option-btn" data-index="${idx}" style="width: 100%; justify-content: center; margin-bottom: 4px;">${icon} ${bg.name}</button>`;
            });
            optionsContainer.innerHTML = html;

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
            
