// services/system.config.js
const SystemConfig = {
    // 💡 1. ระบุเวอร์ชันปัจจุบันของแอปพลิเคชัน (สำคัญมากสำหรับตรวจเช็ก Cache มือถือช่าง)
    VERSION: '1.2.4', 
    
    // 💡 2. ระบุสภาพแวดล้อมการทำงานเพื่อควบคุมพฤติกรรมการแจ้งเตือน (Log) ของโปรแกรมเมอร์
    // ตัวเลือก: 'development' (กำลังพัฒนา) หรือ 'production' (เปิดใช้งานจริงหน้างาน)
    ENVIRONMENT: 'development', 

    // 💡 3. ฟังก์ชันช่วยเลือกปลายทางเซิร์ฟเวอร์หลังบ้านอัตโนมัติ 
    getApiBaseUrl() {
        if (this.ENVIRONMENT === 'development') {
            return 'http://localhost:3000/api'; // คุยกับเครื่องโปรแกรมเมอร์
        }
        // ถ้าเป็นใช้งานจริง ให้ยิงคุยกับ Cloud Server หลังบ้านตรง ๆ
        return 'https://yourdomain.com'; 
    },

    // 💡 4. ฟังก์ชันเปิดระบบ Log ข้อความแจ้งเตือนความผิดพลาด (จะโชว์เฉพาะตอนพัฒนาเท่านั้น)
    log(message, data = null) {
        if (this.ENVIRONMENT === 'development') {
            console.log(`[SYSTEM LOG]: ${message}`, data);
        }
    }
};

// ส่งออกให้ทั้งระบบมองเห็นผ่าน Global Window
window.SystemConfig = SystemConfig;
