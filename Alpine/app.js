// app.js



function spaApp() {
    return {
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        username: localStorage.getItem('savedUsername') || '',
        password: '',
        isSubmitting: false,
        currentTab: 'overview',
        checklistData: [],
        isLoading: false,
        appVersion: window.SystemConfig?.VERSION || '1.0.0',

        // ตัวแปรสำหรับเก็บโครงสร้าง HTML ที่ไปดึงมาจากไฟล์อื่น
        pageHtml: '',


        currentDomain: window.location.hostname,
          notifications: [],

        // 🟢 เพิ่ม 2 บรรทัดนี้เข้าไปใน app.js เพื่อแก้เออร์เรอร์สีส้มทั้งหมด
        activeTab: 'dashboard', 
        toast: { show: false, title: '', body: '' },

        isSubmitting: false,

        // คลังเก็บสิทธิ์และเมนูตามแนวคิดหลายบทบาทหน้าที่ (Multiple Roles)
        userRoles: [],       // รายชื่อ Roles ทั้งหมดของช่างคนนี้
        currentRole: '',     // บทบาทงานที่กำลังใช้งานปัจจุบัน 
        menus: [],    // ตัวแปรส่งต่อไปประมวลผลวาด Recursive Menu

           isMenuOpen: true,
        async initApp() {
             Alpine.store('mainApp', this);
            try {

                 
                // ดึงสิทธิ์คอนฟิกของระบบผ่าน Mock Service หรือ API จริง
                let res = await window.SystemService.getTenantConfig(this.currentDomain);
                console.log("ตั้งค่าเวอร์ชันระบบ:", res.VERSION);
                
                // ดักจับและต่อสายรับสัญญาน Firebase FCM ที่ลงทะเบียนไว้ที่จุดสตาร์ทจุดเดียว
                window.addEventListener('fcm-core-received', (e) => {
                    this.handleIncomingFCM(e.detail);
                });

                // หากสถานะล็อกอินเดิมค้างอยู่ ให้พุ่งทะลุไปเปิดหน้าแรกหลังบ้านรอไว้เลย
                if (this.isLoggedIn) {
                    this.loadPage('dashboard.html');
                }
            } catch (error) {
                console.error("ระบบแกนกลางสตาร์ทพัง:", error);
            }
        },

     


         // --- 🔔 ระบบจัดการ Firebase (FCM) ศูนย์กลางประจำตึกหลัก ---
        handleIncomingFCM(payload) {
            console.log("แกนกลางจับสัญญาณ FCM สำเร็จ:", payload);
            
            const title = payload.notification?.title || 'แจ้งเตือนระบบ';
            const body = payload.notification?.body || 'มีข้อมูลอัปเดตใหม่';
            const time = new Date().toLocaleTimeString('th-TH');

            // 1. ยัดข้อมูลใหม่ขึ้นแถวบนสุดในคลังสะสมประวัติ
            this.notifications.unshift({ id: Date.now(), title, body, time });

            // 2. เด้งป้าย Toast ลอยมุมขวาเพื่อแจ้งเตือนให้ผู้ใช้เห็นทันทีไม่ว่าจะอยู่หน้าไหน
            this.toast = { show: true, title, body };
            setTimeout(() => { this.toast.show = false; }, 4000); // ตั้งเวลา 4 วินาทีให้ป้ายหุบเก็บอัตโนมัติ
        },
         // --- 🔄 ฟังก์ชันสลับแผ่นหน้ากาก HTML แบบ Dynamic (Router) ---
        loadPage(pageUrl) {
            const targetDiv = document.getElementById('main-content-layout');
            if (!targetDiv) return;

            // 🧹 ขั้นตอนล้างบ้าน: ตรวจดูว่าหน้าเก่ามีคิวสั่งเคลียร์ตัวเองไหม ถ้ามีให้สั่งงานและระเบิดความจำทิ้งทันที
            if (window.currentPageCleanup) {
                window.currentPageCleanup();
                window.currentPageCleanup = null;
            }

            // จัดการยิงไปดึงรหัส HTML ของหน้าย่อยเป้าหมาย
            alert(pageUrl);
            fetch(pageUrl)
                .then(res => {
                    if (!res.ok) throw new Error("ไฟล์ปลายทางไม่มีอยู่จริง");
                    return res.text();
                })
                .then(html => {
                    // 1. เปลี่ยนผนังห้อง นำรหัส HTML ชิ้นใหม่ยัดใส่กล่องขวาแทนที่ของเดิมทั้งหมด
                    targetDiv.innerHTML = html;

                    // 2. 🔥 ฟังก์ชันบังคับรันสคริปต์ย่อย: ตามไปดึงแท็ก <script> ที่ฝังใต้หน้าย่อยมารันแมนนวลให้ทำงาน
                    const scripts = targetDiv.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        if (oldScript.src) {
                            newScript.src = oldScript.src;
                        } else {
                            newScript.text = oldScript.text;
                        }
                        // บังคับแปะเข้าตึกเพื่อให้เบราว์เซอร์ยอมประมวลผลโค้ด แล้วลบทิ้งเพื่อสุขอนามัยของโค้ดทันที
                        document.head.appendChild(newScript).parentNode.removeChild(newScript);
                    });
                })
                .catch(err => {
                    console.error("โหลดหน้าจอไม่สำเร็จ:", err);
                    targetDiv.innerHTML = `<div class='p-4 bg-rose-50 text-rose-700 rounded-lg'>❌ ไม่สามารถดึงหน้าจอนี้ได้เนื่องจากข้อผิดพลาดของระบบ</div>`;
                });
              //  alert(100);
        },

        async handleLogin() {
            if (!this.username || !this.password) return alert('กรุณากรอกข้อมูลให้ครบ');

           
             if (this.username != 'admin' || this.password != '1234') {
                alert('user pass not correct');
                return;
             }
             let role_menus =   await window.SystemService.login('domain', 'username', 'password');
                 this.menus =       role_menus[0].menus;


                this.isSubmitting = true;

                // จำลองการเช็คสิทธิ์ (คุณสามารถใส่ fetch ต่อ API จริงได้ตรงนี้)
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('savedUsername', this.username);
                this.isLoggedIn = true;



                this.isLoggedIn = true;
                await this.loadPage('dashboard.html');

                // 💡 รันระบบแจ้งเตือนแบบคู่ขนาน (Async Dynamic Import)
                // import('./modules/system/services/notification.js').then(module => {
                //     // ส่งต่อค่าตั้งค่า tenantConfig (ที่เก็บ Firebase Key แยกบริษัท) และชื่อโดเมนเข้าไปในเอนจิน
                //     module.initPushNotification(this.tenantConfig, this.currentDomain);
                // });
                this.isSubmitting = false;
                this.password = '';
            
        },

        setupUserSession(data) {
            this.userRoles = data.roles;
            this.currentRole = data.current_role;
            this.allRoleMenus = data.menus_by_role;
            this.updateActiveMenuByRole();
        },

        updateActiveMenuByRole() {
            this.allowedMenus = this.allRoleMenus[this.currentRole] || [];
            this.currentTab = 'overview';
        },

        async handleLogout() {
            localStorage.removeItem('isLoggedIn');
            this.isLoggedIn = false;
            this.currentTab = 'overview';
            this.checklistData = [];

            // โดดกลับมาโหลดหน้าล็อกอินมาแสดงผลแทน
            await this.loadPage('login.html');
        },

        // ฟังก์ชันดึงข้อมูล Checklist ในหน้า Transaction
        async goToChecklistPage() {
            this.currentTab = 'checklist';
            this.isLoading = true;
            this.checklistData = [];

            // ดึงเฉพาะข้อมูลดิบ (JSON Data) มาจัดเรียง ไม่ต้องโหลดโครงสร้างหน้าจอซ้ำ
            try {
                let response = await fetch('/api/checklists');
                this.checklistData = await response.json();
            } catch (e) {
                this.checklistData = [
                    { id: 1, task_name: 'งานโครงสร้างเสาชั้น 1', is_done: false },
                    { id: 2, task_name: 'งานเดินท่อสายไฟห้องครัว', is_done: true }
                ];
            } finally {
                this.isLoading = false;
            }
        },

        async saveProgress(item) {
            console.log(`บันทึกสถานะงาน ID: ${item.id} -> ${item.is_done}`);
        }


        
    }

    
}
 
