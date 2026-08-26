function renderSection(tabName, data) {
    const container = document.getElementById("tab-content-area");
    container.innerHTML = "";

    switch (tabName) {
        case "watch":
            renderYoutubeVideo(container, data.watch);
            break;

        case "explain":
            container.innerHTML = `<div class="text-content">${data.explain?.content || 'لا يوجد شرح.'}</div>`;
            break;

        case "summary":
            container.innerHTML = `<div class="text-content">${data.summary?.content || 'لا يوجد ملخص.'}</div>`;
            break;

        case "rituels":
            // استدعاء ملف HTML الكامل الموجود داخل مجلد 06-rituels عبر iframe
            const rituelsPath = resolvePath(data.rituelsFile, data.basePath);
            renderRituelsIframe(container, rituelsPath);
            break;
    }
}

// دالة تضمين ملف الطقوس الكامل داخل iframe
function renderRituelsIframe(container, filePath) {
    container.innerHTML = `
        <iframe 
            src="${filePath}" 
            class="rituels-frame"
            frameborder="0"
            width="100%"
            height="500px">
        </iframe>
    `;
}
