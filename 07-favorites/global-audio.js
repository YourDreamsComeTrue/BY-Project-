// نظام إدارة الموسيقى الخلفية (خاص بصفحة الدرس أو الصفحات الفرعية)
(function() {
    const AUDIO_KEY_SRC = 'app_bg_music_src';
    const AUDIO_KEY_TIME = 'app_bg_music_time';
    const AUDIO_KEY_PLAYING = 'app_bg_music_playing';

    // مسارات الملفات الصوتية بالرجوع خطوتين للوراء للوصول إلى 01-core من مجلد فرعي
    const tracks = {
        '1': '../01-core/assets/background1.mp3',
        '2': '../01-core/assets/méditation.mp3'
    };

    let globalAudio = window.__globalAppAudio;
    if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.loop = true;
        window.__globalAppAudio = globalAudio;
    }

    // استعادة حالة التشغيل لضمان استمرار الموسيقى دون انقطاع
    const savedSrc = localStorage.getItem(AUDIO_KEY_SRC);
    const savedTime = parseFloat(localStorage.getItem(AUDIO_KEY_TIME) || '0');
    const isPlaying = localStorage.getItem(AUDIO_KEY_PLAYING) === 'true';

    if (savedSrc && isPlaying) {
        if (!globalAudio.src.includes(savedSrc)) {
            globalAudio.src = savedSrc;
            globalAudio.currentTime = savedTime;
        }
        globalAudio.play().catch(e => console.log("في انتظار تفاعل المستخدم", e));
    }

    // تحديث الوقت الحالي باستمرار
    setInterval(() => {
        if (!globalAudio.paused) {
            localStorage.setItem(AUDIO_KEY_TIME, globalAudio.currentTime);
        }
    }, 1000);

    // ربط الأزرار في حال توفرت في هذه الصفحة أيضاً
    document.addEventListener("DOMContentLoaded", () => {
        const btnOpen = document.getElementById("btnOpenMusicModal");
        const musicModal = document.getElementById("musicModal");
        const btnClose = document.getElementById("closeMusicModal");

        btnOpen?.addEventListener("click", (e) => {
            e.stopPropagation();
            if (musicModal) {
                const currentDisplay = window.getComputedStyle(musicModal).display;
                musicModal.style.display = (currentDisplay === "none" || currentDisplay === "") ? "block" : "none";
            }
        });

        btnClose?.addEventListener("click", () => {
            if (musicModal) musicModal.style.display = "none";
        });

        document.addEventListener("click", (e) => {
            if (musicModal && musicModal.style.display === "block") {
                if (!musicModal.contains(e.target) && !btnOpen?.contains(e.target)) {
                    musicModal.style.display = "none";
                }
            }
        });

        document.getElementById("playMusic1")?.addEventListener("click", () => {
            playTrack(tracks['1']);
        });

        document.getElementById("playMusic2")?.addEventListener("click", () => {
            playTrack(tracks['2']);
        });

        document.getElementById("stopMusic")?.addEventListener("click", () => {
            globalAudio.pause();
            globalAudio.currentTime = 0;
            localStorage.setItem(AUDIO_KEY_PLAYING, 'false');
            localStorage.removeItem(AUDIO_KEY_SRC);
            localStorage.removeItem(AUDIO_KEY_TIME);
            if (musicModal) musicModal.style.display = "none";
        });
    });

    function playTrack(src) {
        globalAudio.src = src;
        globalAudio.currentTime = 0;
        globalAudio.play().then(() => {
            localStorage.setItem(AUDIO_KEY_SRC, src);
            localStorage.setItem(AUDIO_KEY_PLAYING, 'true');
            localStorage.setItem(AUDIO_KEY_TIME, '0');
        }).catch(err => {
            console.error("فشل التشغيل:", err);
        });
    }
})();
  
