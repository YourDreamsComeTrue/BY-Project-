// نظام إدارة الموسيقى العامة عبر الصفحات
(function() {
    const AUDIO_KEY_SRC = 'app_bg_music_src';
    const AUDIO_KEY_TIME = 'app_bg_music_time';
    const AUDIO_KEY_PLAYING = 'app_bg_music_playing';

    // مسارات الملفات الصوتية المطلوبة
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

    // استرجاع الحالة الحالية من التخزين المحلي
    const savedSrc = localStorage.getItem(AUDIO_KEY_SRC);
    const savedTime = parseFloat(localStorage.getItem(AUDIO_KEY_TIME) || '0');
    const isPlaying = localStorage.getItem(AUDIO_KEY_PLAYING) === 'true';

    if (savedSrc && isPlaying) {
        if (globalAudio.src !== window.location.origin + '/' + savedSrc && !globalAudio.src.includes(savedSrc)) {
            globalAudio.src = savedSrc;
            globalAudio.currentTime = savedTime;
        }
        globalAudio.play().catch(e => console.log("Autoplay blocked or waiting interaction", e));
    }

    // حفظ الوقت الحالي باستمرار لتجنب انقطاعه عند التنقل
    setInterval(() => {
        if (!globalAudio.paused) {
            localStorage.setItem(AUDIO_KEY_TIME, globalAudio.currentTime);
        }
    }, 1000);

    // ربط الأزرار في صفحة الفهرس عند تحميل المستند
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
            alert("تم إيقاف الموسيقى.");
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
            console.error("Error playing audio:", err);
        });
    }
})();
                  
