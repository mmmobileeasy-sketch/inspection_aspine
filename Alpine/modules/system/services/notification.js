// modules/system/notification.js
import { initializeApp, getApps } from "https://gstatic.com";
import { getMessaging, getToken, onMessage } from "https://gstatic.com";

export async function initPushNotification(tenantConfig, currentDomain) {
    try {
        // 1. ส่งค่า Firebase Config ไปฝังและเปิดเอนจินของ Service Worker เบื้องหลังก่อน
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SET_FIREBASE_CONFIG',
                config: tenantConfig.firebase_config // โหลดค่า Config แยกตามบริษัทจากหลังบ้าน
            });
        }

        // 2. ขออนุญาตเปิดการแจ้งเตือนบนมือถือช่าง
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("ช่างไม่อนุญาตให้แจ้งเตือน");
            return;
        }

        // 3. เริ่มเอนจิน Firebase บนหน้าบ้าน (ตรวจเช็กไม่ให้สร้างซ้ำ)
        let app;
        if (getApps().length === 0) {
            app = initializeApp(tenantConfig.firebase_config);
        } else {
            app = getApps()[0];
        }
        const messaging = getMessaging(app);

        // 4. รับรหัส FCM Token ประจำเครื่องมือถือช่าง
        const currentToken = await getToken(messaging, { 
            serviceWorkerRegistration: registration,
            vapidKey: tenantConfig.firebase_config.vapidKey // รหัส VAPID Key ประจำโปรเจกต์ของแต่ละบริษัท
        });

        if (currentToken) {
            console.log("FCM Token ของเครื่องนี้คือ:", currentToken);
            // 🎯 ยิงส่งค่า Token ของเครื่องนี้ + ชื่อโดเมนไปเก็บในฐานข้อมูลหลังบ้าน
            await sendTokenToBackend(currentToken, currentDomain);
        }

        // 5. ดักจับเคสแจ้งเตือนเด้งเข้าตอนช่างกำลังเปิดหน้าแอปทำงานอยู่ (Foreground)
        onMessage(messaging, (payload) => {
            console.log("มีแจ้งเตือนด่วนเข้ามา:", payload);
            // แสดงผลเป็นกล่องสไตล์ Alert สวยๆ บนหน้าจอ Alpine SPA ของเรา
            alert(`📢 ${payload.notification.title}\n${payload.notification.body}`);
        });

    } catch (error) {
        console.error("ระบบเปิดรับการแจ้งเตือนขัดข้อง:", error);
    }
}

// ฟังก์ชันยิง API บันทึก Token ลงฐานข้อมูลหลังบ้าน
async function sendTokenToBackend(token, currentDomain) {
    try {
        await fetch('/api/save-fcm-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token: token, 
                domain: currentDomain,
                username: localStorage.getItem('savedUsername') // เก็บผูกเข้าบัญชีช่างคนนี้
            })
        });
    } catch (err) {
        console.log("เซิร์ฟเวอร์หลังบ้านยังไม่เปิดรัน แต่รับ Token ในเครื่องช่างเรียบร้อย");
    }
}
