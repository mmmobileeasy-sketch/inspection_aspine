// services/system.service.js (ทำหน้าที่เหมือน Angular Service)
const taskLv2Service = {

  async fetchProjects(tenantId) {
        try {
            const baseUrl = window.SystemConfig.getApiBaseUrl();
            // ส่งค่า tenantId ไปที่ Endpoint API ของคุณเพื่อกรองเอาเฉพาะข้อมูลใบงานของเจ้านั้น ๆ
            const response = await fetch(`${baseUrl}/api/projects?tenant_id=${tenantId}`);
            
            if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลจาก Server ได้');
            
            return await response.json();
        } catch (error) {
            console.error('❌ Error ใน fetchProjects:', error);
            
            // 💡 กรณีเน็ตหลุดหรือรัน API หลังบ้านยังไม่ได้ ให้ส่งคืนข้อมูลจำลอง (Mock Data) สไตล์มินิมอลกลับไปก่อน หน้าจอจะได้ไม่พัง
            return [
                { id: '#PJ-001', type: 'ตรวจอย่างเดียว', name: 'คอนโด ABC (ชั้น 12 ห้อง 1204)', status: 'อยู่ระหว่างรอบ 2', statusColor: 'bg-red-500' },
                { id: '#PJ-042', type: 'ตรวจอย่างเดียว', name: 'บ้านเดี่ยว XYZ (แปลง B3)', status: 'ปิดงานแล้ว (รอบ 3)', statusColor: 'bg-green-500' }
            ];
        }
    },

    /**
     * 📤 [เพิ่มใหม่] ฟังก์ชันส่งข้อมูลใบงานชิ้นใหม่ไปบันทึกลงฐานข้อมูลหลังบ้าน
     * @param {string} tenantId - ไอดีรหัสผู้เช่าระบบ
     * @param {Object} formData - ชุดข้อมูลฟอร์มใบงานที่พนักงานกรอกมาจากหน้าจอ Dialog
     * @returns {Promise<boolean>} ส่งกลับเป็น true ถ้าเซฟสำเร็จสำเร็จ
     */
    async saveProject(tenantId, formData) {
        try {
            // แนบข้อมูลผู้เช่า (tenantId) เข้าไปในชุดข้อมูลที่จะเซฟด้วย
            const payload = { ...formData, tenantId };

            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Error ใน saveProject:', error);
            return false;
        }
    }

};

// ส่งออกโครงสร้างบริการให้ไฟล์อื่นเรียกใช้งานผ่านระบบ Global หรือ ES Modules
window.TransactionTasklv2= taskLv2Service;
