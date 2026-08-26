export const titleData = {
    heading: "عنوان الدرس الأول: تفكيك المعتقدات",
    
    // القسم 1: المشاهدة
    watch: {
        videoId: "dQw4w9WgXcQ", 
        startSeconds: 30,       
        endSeconds: 90          
    },
    
    // القسم 2: الشرح
    explain: {
        content: `
            <h3>مفهوم المعتقد المقيد</h3>
            <p>هنا نكتب النص الكامل للشرح التفصيلي للعنوان...</p>
        `
    },
    
    // القسم 3: الملخص
    summary: {
        content: `
            <ul>
                <li>النقطة الأولى: الرصد المباشر.</li>
                <li>النقطة الثانية: التفكيك بالأسئلة.</li>
                <li>النقطة الثالثة: إعادة الصياغة.</li>
            </ul>
        `
    },
    
    // القسم 4: الطقوس
    rituelsFile: "./rituels.js", 
    
    // مساحة التمارين المفتوحة
    exercises: [
        { id: "ex_01", title: "تمرين تفكيك القيد الأول", file: "./exercise01.js" },
        { id: "ex_02", title: "تمرين الإسقاط الذهني", file: "./exercise02.js" }
    ]
};
