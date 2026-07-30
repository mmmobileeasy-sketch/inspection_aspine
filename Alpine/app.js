// app.js



function spaApp() {
    return {
        _isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        _username: localStorage.getItem('userName') || '',
        _password: '',
        _isSubmitting: false,
        _currentPage: '',
        _currentMenu: '',
        _checklistData: [],
        _deviceType: 1,

        // 2. ฟังก์ชันสมองกลตรวจสเปกและพฤติกรรมหน้าจอ (The Detection Engine)
        checkDevice() {
            const width = window.innerWidth;

            // ตรวจสอบว่าเป็น Mobile หรือไม่ (ขนาดหน้าจอแนวตั้งมาตรฐานเล็กกว่า 768px)
            if (width < 768) {
                _this.deviceType = 1;
            } else {
                // หากขนาดหน้าจอตั้งแต่ 768px ขึ้นไป ตีเป็นกลุ่ม Tablet และ Notebook ทันที
                _this.deviceType = 2;
            }
        },

        _isLoading: false,

        _appVersion: window.SystemConfig?.VERSION || '1.0.0',

        // ตัวแปรสำหรับเก็บโครงสร้าง HTML ที่ไปดึงมาจากไฟล์อื่น
        _pageTitle: '',


        _currentDomain: window.location.hostname,
        notifications: [],

        _toast: { show: false, title: '', body: '' },

        _isSubmitting: false,

        // คลังเก็บสิทธิ์และเมนูตามแนวคิดหลายบทบาทหน้าที่ (Multiple Roles)
        _userRoles: [],       // รายชื่อ Roles ทั้งหมดของช่างคนนี้
        _currentRole: '',     // บทบาทงานที่กำลังใช้งานปัจจุบัน 
        _menus: [],    // ตัวแปรส่งต่อไปประมวลผลวาด Recursive Menu

        _isMenuOpen: true,
        async initApp() {
            Alpine.store('mainApp', this);
            //  alert(1);
            if (this._menus.length == 0) {
                let role_menus = await window.SystemService.login('domain', 'username', 'password');
                this._menus = role_menus[0].menus;
                this._current_menu = role_menus[0].current_menu;

            }


            // วางโค้ดนี้ไว้ในฟังก์ชัน initApp() หรือจุดเริ่มต้นของแอปเพื่อทดสอบ
            setInterval(() => {
                const mockPayload = {
                    notification: {
                        title: "🔔 มีอัปเดตงานใหม่ " + new Date().toLocaleTimeString(),
                        body: "ตรวจพบ Defect ใหม่ในห้อง 405 กรุณาตรวจสอบพิกัด"
                    }
                };

                // เรียกใช้ฟังก์ชันจัดการ FCM ที่คุณเขียนไว้ในหน้าจอ
                this.handleIncomingFCM(mockPayload);
            }, 5000); // ยิงทดสอบทุกๆ 5 วินาที (เปลี่ยนตัวเลขได้)
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
                    this.loadPage(this.current_menu);
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
        loadPage(pageUrl, pageTitle) {
            const targetDiv = document.getElementById('main-content-layout');
            if (!targetDiv) return;

            // 🧹 ขั้นตอนล้างบ้าน: ตรวจดูว่าหน้าเก่ามีคิวสั่งเคลียร์ตัวเองไหม ถ้ามีให้สั่งงานและระเบิดความจำทิ้งทันที
            if (window.currentPageCleanup) {
                window.currentPageCleanup();
                window.currentPageCleanup = null;
            }
            this.pageTitle = pageTitle;
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
            if (!this._username || !this._password) return alert('กรุณากรอกข้อมูลให้ครบ');


            if (this._username != 'admin' || this._password != '1234') {
                alert('user pass not correct');
                return;
            }
            let role_menus = await window.SystemService.login('domain', 'username', 'password');
            this._menus = role_menus[0].menus;


            this.isSubmitting = true;

            // จำลองการเช็คสิทธิ์ (คุณสามารถใส่ fetch ต่อ API จริงได้ตรงนี้)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('savedUsername', this._username);
            this._isLoggedIn = true;



            this._isLoggedIn = true;
            await this.loadPage('dashboard.html');

            // 💡 รันระบบแจ้งเตือนแบบคู่ขนาน (Async Dynamic Import)
            // import('./modules/system/services/notification.js').then(module => {
            //     // ส่งต่อค่าตั้งค่า tenantConfig (ที่เก็บ Firebase Key แยกบริษัท) และชื่อโดเมนเข้าไปในเอนจิน
            //     module.initPushNotification(this.tenantConfig, this.currentDomain);
            // });
            this._isSubmitting = false;
            this._password = '';

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
            this._isLoggedIn = false;
            this._currentTab = '';
            this._checklistData = [];

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
        },
        get menus() {
            // คุณสามารถใส่ตรรกะเช็กเพิ่มตรงนี้ได้ เช่น เช็ก Token ใน localStorage ร่วมด้วย
            return this._menus;
        },
        get isMenuOpen() {
            // คุณสามารถใส่ตรรกะเช็กเพิ่มตรงนี้ได้ เช่น เช็ก Token ใน localStorage ร่วมด้วย
            return this._isMenuOpen;
        },
        get toast() {
            return this._toast;
        },
        get isSubmitting() {
            // คุณสามารถใส่ตรรกะเช็กเพิ่มตรงนี้ได้ เช่น เช็ก Token ใน localStorage ร่วมด้วย
            return this._isSubmitting;
        },
        get isLoggedIn() {
            // คุณสามารถใส่ตรรกะเช็กเพิ่มตรงนี้ได้ เช่น เช็ก Token ใน localStorage ร่วมด้วย
            return this._isLoggedIn;
        },
        _currentPage: localStorage.getItem('currentPage') || 'dashboard',

        get currentPage() {
            return this._currentPage;
        },


        set currentPage(value) {
            // 1. อัปเดตค่าและเซฟลงเครื่องทันที (ไม่ต้องรอ Async)
            this._currentPage = value;
            localStorage.setItem('currentPage', value);

            // 2. 🚀 สั่งเรียกฟังก์ชัน Async เบื้องหลัง (ไม่ต้องใส่ await นำหน้าตรงนี้)
            this.handlePageChangeAsync(value);
        },
    }


}

