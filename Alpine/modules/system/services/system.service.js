// services/system.service.js (ทำหน้าที่เหมือน Angular Service)
const SystemService = {


    async login(domain, username, password) {
        // ดึง URL ตัวหลักมาจากไฟล์ตั้งค่าระบบกลาง (เช่น https://yourdomain.com)
      //  const baseUrl = window.SystemConfig.getApiBaseUrl();

        try {
            // const response = await fetch(`${baseUrl}/auth/login`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'X-Tenant-Domain': domain // ส่งระบุบริษัทลูก (Tenant) ไปที่ Header
            //     },
            //     body: JSON.stringify({
            //         username: username,
            //         password: password
            //     })
            // });

            // // เคสที่ 1: ถ้ารหัสผ่านไม่ถูกต้อง หรือบัญชีโดนระงับ
            // if (!response.ok) {
            //     const errorData = await response.json().catch(() => ({}));
            //     throw new Error(errorData.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            // }

            // // เคสที่ 2: ล็อกอินผ่านฉลุย ดึงข้อมูลดิบออกมา
            // const result = await response.json();

             await new Promise(resolve => setTimeout(resolve, 200));
            return [
            {
                "token": "eyJhbGciOiJIUzI1NiIsInR5...",
                "current_role": "mechanic",
                "roles": [
                    { "id": "mechanic", "title": "ช่างเทคนิคหน้างาน" },
                    { "id": "qa_supervisor", "title": "หัวหน้าผู้ควบคุมงาน (QA)" }
                ],
                "menus" :   [
                        { "id": "dashboard", "title": "ภาพรวมระบบ", "icon": "📊", "path": "dashboard.html" },
                        { "id": "defect", "title": "ใบงาน Defect", "icon": "📋", "path": "modules/transaction/defect.html" },
                         { "id": "defect1", "title": "Defect_log", "icon": "📋", "path": "modules/transaction/defect_log.html" },
                        { "id": "tx_checklist", "title": "ใบงาน Checklist (Tx)", "icon": "📋", "path": "modules/transaction/transaction.css" }
                    
                       ,
                        {
                            "id": "qa_group1",
                            "title": "จัดการข้อมูลส่วนกลาง",
                            "icon": "🛡️",
                            "path": null,
                            "children": [
                                { "id": "profile", "title": "profile บริษัท", "icon": "⚠️", "path": "/modules/master/project-setup.html" },
                                { "id": "building", "title": "จักการโครงสร้างอาคาร", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typetask", "title": "จักการตำแหน่งประเภทงาน", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typechecking", "title": "จักการแบบฟอร์มข้อสอบ", "icon": "✅", "path": "modules/qa/approve.css" }
                            ]
                        },
                        {
                            "id": "qa_group2",
                            "title": "ระบบบริหารบุคคลและเวลา",
                            "icon": "🛡️",
                            "path": null,
                            "children": [
                                { "id": "profile", "title": "จัดการผู้ใช้งานระบบ", "icon": "⚠️", "path": "/modules/master/project-setup.html" },
                                { "id": "building", "title": "จัดการตารางงานปกติ", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typetask", "title": "จักการตำแหน่งประเภทงาน", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typechecking", "title": "จักการแบบฟอร์มข้อสอบ", "icon": "✅", "path": "modules/qa/approve.css" }
                            ]
                        },

                          {
                            "id": "qa_task3",
                            "title": "ระบบปฏิบัติงานและการติดตาม",
                            "icon": "🛡️",
                            "path": null,
                            "children": [
                                { "id": "profile", "title": "ติดตามงานประจำ", "icon": "⚠️", "path": "/modules/master/project-setup.html" },
                                { "id": "building", "title": "วางแผนและมอบหมายงาน", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typetask", "title": "ใบงานวิกฤต", "icon": "✅", "path": "modules/qa/approve.css" },
                                { "id": "typechecking", "title": "ปฏิบัติหน้าท่", "icon": "✅", "path": "modules/qa/approve.css" }
                            ]
                        },
                        { "id": "report_pdf", "title": "ออกรายงาน PDF", "icon": "📄", "path": "modules/report/report.css" }
                    ]
                
            }
        ];




            // 🎯 บันทึกรหัส Token ลับประจำตัวช่างลงในหน่วยความจำเครื่องปลอดภัย (เซฟแยกตระกร้าตามโดเมน)
            localStorage.setItem(`${domain}_auth_token`, result.token);

            return {
                success: true,
                menus: result.menus
            };

        } catch (error) {
            window.SystemConfig.log('การล็อกอินขัดข้อง:', error.message);

            // 🚫 Fallback Mode: ข้อมูลจำลองสำหรับให้ทีมโปรแกรมเมอร์เปิดทดสอบระบบได้ทันทีแม้หลังบ้านยังไม่เสร็จ
            if (window.SystemConfig.ENVIRONMENT === 'development') {
                console.warn("⚠️ ใช้บัญชีทดสอบระบบภายในโหมด Development");
                localStorage.setItem(`${domain}_auth_token`, "MOCK_TOKEN_FOR_DEV_12345");
                return {
                    success: true,
                    menus: [
                        { id: 'overview', title: 'ภาพรวมระบบ (Dev)', icon: '📊', path: null },
                        { id: 'tx_checklist', title: 'ใบงาน Checklist (Dev)', icon: '📋', path: 'modules/transaction/transaction.css' }
                    ]
                };
            }

            // ถ้าเป็นหน้างานจริง (Production) ให้ส่งข้อความแจ้งเตือนสีแดงออกไป
            return {
                success: false,
                message: error.message
            };
        }
    },

    async refreshSession(domain, username) {
        const baseUrl = window.SystemConfig.getApiBaseUrl();
        // ดึงรหัส Bearer Token ที่เคยบันทึกแยกถังตาม Tenant ออกมาใช้ผูกความปลอดภัย
        const token = this.getStoredToken(domain);

        try {
            const response = await fetch(`${baseUrl}/auth/refresh-session?domain=${domain}&username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-Domain': domain,
                    'Authorization': `Bearer ${token}` // แนบตั๋วความปลอดภัยไปที่ Header หลังบ้าน
                }
            });

            if (!response.ok) {
                throw new Error('เซสชันหมดอายุ กรุณาล็อกอินใหม่');
            }

            const result = await response.json();
            return {
                success: true,
                rawData: result
            };

        } catch (error) {
            window.SystemConfig.log('การรีเฟรชเซสชันขัดข้อง:', error.message);
            
            // 🚫 Fallback Mode: ส่งข้อมูลจำลองกรณี Dev Mode ช่างเดินเข้าจุดไม่มีเน็ตตอนเปิดแอป
            return {
                success: window.SystemConfig.ENVIRONMENT === 'development', // ถ้าอยู่ช่วงพัฒนาให้ผ่านฉลุย
                message: error.message,
                rawData: {
                    current_role: 'mechanic',
                    roles: [{ id: 'mechanic', title: 'ช่างเทคนิค' }, { id: 'qa_supervisor', title: 'หัวหน้า QA' }],
                    menus_by_role: {
                        mechanic: [{ id: 'overview', title: 'ภาพรวมระบบ', icon: '📊', path: null }, { id: 'tx_checklist', title: 'ใบงาน Checklist', icon: '📋', path: 'modules/transaction/transaction.css' }],
                        qa_supervisor: [{ id: 'overview', title: 'ภาพรวมระบบ', icon: '📊', path: null }, { id: 'qa_approve', title: 'อนุมัติงาน', icon: '✅', path: 'modules/qa/approve.css' }]
                    }
                }
            };
        }
    },

    getStoredToken(domain) {
        return localStorage.getItem(`${domain}_auth_token`) || '';
    },
    // 💡 ฟังก์ชัน Get Menu Role ที่ดึงออกมาจากหน้าจอหลัก
    async getUserMenuRole(domain, username) {
        try {
            let response = await fetch(`/api/user/menus?domain=${domain}&username=${username}`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง');
        } catch (error) {
            console.warn("ใช้เมนูจำลองตามสิทธิ์ระดับช่างหน้างาน (Offline/Fallback Mode)");
            // ส่งค่าข้อมูลสำรองกลับไปหากเน็ตล้มเหลว
            return [
                { id: 'overview', title: 'ภาพรวมระบบ', icon: '📊', path: null },
                { id: 'tx_checklist', title: 'ใบงาน Checklist (Tx)', icon: '📋', path: 'modules/transaction/transaction.css' }
            ];
        }
    },

    // 💡 คุณสามารถย้ายพวก API โหลด Config ของ Tenant มาเก็บไว้ที่นี่ร่วมกันได้ด้วย
    async getTenantConfig(domain) {
        // ==========================================
    // 🔴 [โหมดใช้งานจริง] ยิง API ไปที่หลังบ้าน (Server)
    // ==========================================
    /* -- เอาคอมเมนต์บล็อกนี้ออก เมื่อต้องการใช้ API จริง --
    let response = await fetch(`/api/tenant/config?domain=${domain}`);
    
    // เช็กสถานะจากเซิร์ฟเวอร์ ถ้าตอบกลับมาไม่สำเร็จ (เช่น 404, 500) ให้โยน Error ทันที
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // แปลงข้อมูลผลลัพธ์ JSON ส่งกลับไป
    return await response.json();
    ---------------------------------------------------- */


    // ==========================================
    // 🟡 [โหมดพัฒนา/ทดสอบ] จำลองข้อมูล (Mock Data)
    // ==========================================
    // 1. จำลองความหน่วงของเน็ตให้หน้าจอหมุนโหลด 0.5 วินาที
    await new Promise(resolve => setTimeout(resolve, 500));

    // 💡 สวิตช์ทดสอบระบบพัง: เปลี่ยนเป็น true เพื่อเช็กว่าหน้าเว็บตอนติด Error (catch บล็อก) แสดงผลถูกต้องไหม
    const simulateError = false; 
    if (simulateError) {
        throw new Error("500 Internal Server Error (Simulated)");
    }

    // 2. คลังข้อมูลจำลองแยกตามชื่อ Domain ที่พิมพ์บน Browser URL
    const mockTenants = {
        'localhost': {
            tenantId: 'tenant_001',
            companyName: 'Local Development Corp',
            theme: 'dark',
            VERSION: '1.0.0-dev',
            defaultPageHtml: '<h1>ยินดีต้อนรับสู่ระบบ Local (Dev)</h1>'
        },
        '127.0.0.1': {
            tenantId: 'tenant_001_ip',
            companyName: 'Local IP Enterprise',
            theme: 'dark',
            VERSION: '1.0.0-ip',
            defaultPageHtml: '<h1>ยินดีต้อนรับผ่าน IP 127.0.0.1</h1>'
        },
        'fastcheck.com': {
            tenantId: 'tenant_002',
            companyName: 'Fast Check Co., Ltd.',
            theme: 'light',
            VERSION: '2.4.1',
            defaultPageHtml: '<h1>ยินดีต้อนรับสู่ระบบ Fast Check</h1>'
        }
    };

    // 3. ค้นหาข้อมูลตามโดเมนที่ส่งมา (หากไม่เจอบนรายการ ให้ดึงค่าของ localhost มาเป็นค่าเริ่มต้น)
    const config = mockTenants[domain] || mockTenants['localhost'];
    
    return config;
    }
};

// ส่งออกโครงสร้างบริการให้ไฟล์อื่นเรียกใช้งานผ่านระบบ Global หรือ ES Modules
window.SystemService = SystemService;
