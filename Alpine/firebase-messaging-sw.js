// firebase-messaging-sw.js

// 1. ✅ นำเข้าไลบรารีของ Google Firebase SDK (เวอร์ชันเสถียรแบบ Compat) ไว้ด้านบนสุด
// ป้องกันปัญหา DOMException จากการโหลดสคริปต์แบบ Async ใน Service Worker บางเบราว์เซอร์
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js');

/**
 * 2. 🚨 แก้ไขจุดสำคัญที่สุด (ดักจับตรงจาก Push Event):
 * ไม่ว่าแอปจะอยู่ Foreground หรือ Background เมื่อมี Push วิ่งเข้าเบราว์เซอร์ 
 * โค้ดส่วนนี้จะแกะเอาข้อมูล Title และ Body ส่งข้ามท่อไปหา Angular Signal ทันที 100%
 */
// 🌟 สร้างท่อสื่อสารข้ามมิติไปยัง Angular หน้าบ้าน (Dashboard)
const bgChannel = new BroadcastChannel('fcm_bg_channel');
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received. Extracting payload...');
  
  if (!event.data) return;

  try {
    // แกะโครงสร้าง JSON ที่ส่งมาจากหลังบ้าน (.NET)
    const payload = event.data.json();
    console.log('[SW] Raw Push Payload:', payload);

    // ดึงค่าข้อความ (รองรับทั้งรูปแบบ notification และ data)
    const notificationTitle = payload.notification?.title || payload.data?.title || 'แจ้งเตือนใหม่';
    const notificationBody = payload.notification?.body || payload.data?.body || '';
    const clickAction = payload.data?.click_action || payload.notification?.click_action || '/';

    // 🚀 ยิงข้อความข้ามช่องทางไปหา Angular Signal ทันที! (แก้ปัญหาหน้าบ้านเงียบ)
    bgChannel.postMessage({
      title: notificationTitle,
      body: notificationBody,
      notification: payload.notification || payload.data
    });

 
    
    console.log('[SW] ยิงข้อมูลข้ามท่อไปหา Angular สำเร็จ:', notificationTitle);

    // สั่งให้ระบบปฏิบัติการแสดงแถบ Notification Banner เด้งมุมจอ
    const notificationOptions = {
      body: notificationBody,
      icon: '/assets/icons/icon-72x72.png',
      data: { click_action: clickAction }
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );

  } catch (err) {
    console.error('[SW Error] Error parsing push data:', err);
  }
});
 

let messaging; // ประกาศตัวแปร messaging ไว้ด้านนอก เพื่อตรวจสอบสถานะการ initialize
// เมื่อมีการติดตั้งสคริปต์ใหม่ ให้บังคับเปิดใช้งานทันที ไม่ต้องรอคิว (Skip Waiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[SW] Installed and skipped waiting.');
});

// เมื่อเปิดทำงาน ให้ยึดสิทธิ์การควบคุมหน้าต่างแท็บทั้งหมดของเว็บทันที (Claim Clients)
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('[SW] Activated and claimed clients.');
});

// 🌟 ตัวรับสัญญาณแบบ Dynamic Multi-tenant สำหรับตั้งค่า Firebase Config จากหน้าบ้าน
self.addEventListener('message', (event) => {
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'+event.data.type );
  if (event.data && event.data.type === 'SET_FCM_CONFIG') {
    const config = event.data.config;
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log(config);
    event.waitUntil(
      (async () => {
        let success = false;
        let errorMessage = '';

        try {
          if (!messaging) {
            
            // ✅ ทำการ Initialize ด้วยคอนฟิกที่ถูกส่งมาจาก Angular
            firebase.initializeApp(config);
            messaging = firebase.messaging();

            // 🔔 ดักฟังข้อความเมื่อระบบหลังบ้าน (C# API) ยิงเข้ามาในขณะที่แอปอยู่เบื้องหลัง (Background)
                        // 🔔 ดักฟังข้อความเมื่อระบบหลังบ้าน (C# API) ยิงเข้ามาในขณะที่แอปอยู่เบื้องหลัง (Background)
            messaging.onBackgroundMessage((payload) => {
              console.log('[SW] ได้รับข้อความหลังบ้านเรียบร้อย:', payload);

              // 🌟 แก้จุดสำคัญ: ใช้ Bracket Notation แกะค่าป้องกันปัญหาค่า undefined ภาษาไทยไม่ยอมออก
              const notificationTitle = payload.notification?.title || payload.data?.['title'] || payload.data?.title || 'แจ้งเตือนใหม่';
              const notificationBody = payload.notification?.body || payload.data?.['body'] || payload.data?.body || '';
              
              // ดึง click_action ออกมาเก็บไว้ใน data เพื่อส่งต่อให้ระบบคลิก
              const clickAction = payload.data?.['click_action'] || payload.data?.click_action || payload.notification?.click_action || '/';
 console.log('[SW] สั่งเด้งแจ้งเตือน!'+payload.data?.['click_action']);
              self.registration.showNotification(notificationTitle, {
                body: notificationBody,
                icon: '/assets/icons/icon-72x72.png',
                tag: 'fcm-notification-tag', // 🌟 ใส่ Tag เพื่อให้เบราว์เซอร์จัดกลุ่มระบบแจ้งเตือนไม่ให้ทับกัน
                renotify: true,               // สั่งให้สั่นหรือส่งเสียงแจ้งเตือนทุกครั้งที่มีข้อความใหม่เข้า
                data: {
                  click_action: clickAction   // 🌟 ลดรูปก้อน Object ส่งเฉพาะ URL ไปให้ระบบคลิกใช้งานแบบปลอดภัย
                }
              }).then(() => {
                // ส่งข้ามท่อกลับไปพ่น Log ในหน้า Foreground (Angular)
                bgChannel.postMessage({
                  title: notificationTitle,
                  body: notificationBody,
                  notification: payload.notification || payload.data
                });
                console.log('[SW] สั่งเด้งแจ้งเตือนบนหน้าจอคอมพิวเตอร์และส่งข้อมูลหาหน้าบ้านสำเร็จ!');
              }).catch((err) => {
                console.error('[SW Error] สั่งเด้ง Notification ล้มเหลว:', err);
              });
            });

            success = true;
            console.log('[SW] Firebase messaging initialized successfully.');
          } else {
            success = true;
            console.log('[SW] Firebase messaging already initialized.');
          }
        } catch (error) {
          console.error('[SW Error] เกิดข้อผิดพลาดในการโหลดระบบแจ้งเตือน:', error);
          errorMessage = error.message;
          success = false;
        } finally {
          // *** ส่ง response กลับไปยัง client หาก ports มีอยู่ ***
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
              type: 'FCM_CONFIG_RESPONSE',
              success: success,
              error: errorMessage
            });
            console.log('[SW] Sent FCM_CONFIG_RESPONSE via port.');
          } else {
            console.log('[SW] No port available on event.ports to send FCM_CONFIG_RESPONSE.');
          }
        }
      })()
    );
  }
});

// 🌟 ย้ายออกมาอยู่ด้านนอกสุด (Top-level): สำหรับการเปิด URL เมื่อคลิก Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // ดึงค่า URL จากโครงสร้าง data ที่เซ็ตไว้ตอนสร้าง Notification
  const click_redirect_url = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // ตรวจสอบว่ามีหน้าเว็บเดิมเปิดค้างไว้ไหม ถ้ามีให้ Focus ไปที่หน้านั้น
      for (const client of clientList) {
        if (client.url.includes(click_redirect_url) && 'focus' in client) {
          return client.focus();
        }
      }
      // ถ้าไม่มีหน้าเว็บนั้นเปิดอยู่ ให้เปิด Window ใหม่ขึ้นมา
      if (clients.openWindow) {
        return clients.openWindow(click_redirect_url);
      }
      return null;
    })
  );
});
