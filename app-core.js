// app-core.js - القلب الرئيسي للتطبيق
if (typeof window.MedicationApp === 'undefined') {
    window.MedicationApp = {
        currentUser: null,
        editingMedicationId: null,
        
        init: function() {
            console.log('MedicationApp initialized');
            
            // تهيئة الترجمة
            if (window.MedicationTranslator) {
                window.MedicationTranslator.init();
            }
            
            // استعادة جلسة المستخدم
            this.restoreSession();
            
            // تهيئة الصفحة
            this.initPage();
            
            // تحميل البيانات
            this.loadData();
        },
        
        restoreSession: function() {
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) {
                    this.currentUser = JSON.parse(userStr);
                    this.showCorrectPage();
                    
                    // التحقق من حالة المصادقة Firebase
                    if (window.AuthSystem && firebase.auth().currentUser === null) {
                        // المستخدم غير مسجل في Firebase، توجيه للتسجيل
                        localStorage.removeItem('currentUser');
                        window.location.href = 'login.html';
                    }
                } else {
                    // لا يوجد مستخدم، توجيه للتسجيل
                    if (!window.location.pathname.includes('login.html')) {
                        window.location.href = 'login.html';
                    }
                }
            } catch (error) {
                console.error('Error restoring session:', error);
                localStorage.removeItem('currentUser');
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
        },
        
        showCorrectPage: function() {
            if (!this.currentUser) return;
            
            if (this.currentUser.isAdmin) {
                this.showElement('#adminPage');
                this.hideElement('#userPage');
            } else {
                this.showElement('#userPage');
                this.hideElement('#adminPage');
            }
        },
        
        showElement: function(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('active');
            }
        },
        
        hideElement: function(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.remove('active');
            }
        },
        
        initPage: function() {
            // تحديث التاريخ
            this.updateCurrentDate();
            setInterval(() => this.updateCurrentDate(), 60000);
            
            // تحميل السمة
            this.loadTheme();
            
            // إعداد معالجات الأحداث
            this.setupEventHandlers();
        },
        
        updateCurrentDate: function() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const dateElements = document.querySelectorAll('#currentDate');
            dateElements.forEach(element => {
                if (element) {
                    const lang = window.MedicationTranslator?.currentLang || 'ar';
                    element.textContent = now.toLocaleDateString(
                        lang === 'ar' ? 'ar-SA' : 'en-US', 
                        options
                    );
                }
            });
        },
        
        loadTheme: function() {
            const theme = localStorage.getItem('theme') || 'light';
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                const themeButtons = document.querySelectorAll('.theme-toggle');
                themeButtons.forEach(btn => {
                    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
                });
            }
        },
        
        toggleTheme: function() {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            const themeButtons = document.querySelectorAll('.theme-toggle');
            themeButtons.forEach(btn => {
                if (btn) {
                    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                }
            });
        },
        
        setupEventHandlers: function() {
            // إعدادات الإشعارات
            this.setupNotificationSettings();
        },
        
        setupNotificationSettings: function() {
            const settingsDiv = document.getElementById('notificationSettings');
            if (settingsDiv) {
                settingsDiv.innerHTML = `
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">إشعارات Push</span>
                            <span class="setting-desc">إشعارات على شاشة هاتفك حتى عند إغلاق الموقع</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="pushNotificationsToggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">التنبيهات الصوتية</span>
                            <span class="setting-desc">تشغيل صوت عند وقت الدواء</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="soundNotificationsToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <button class="btn test-notification-btn" onclick="window.MedicationApp.testNotification()">
                        <i class="fas fa-bell"></i> اختبار الإشعار
                    </button>
                `;
            }
        },
        
        // ===== دوال متاحة للاستخدام من HTML =====
        openAddMedicationModal: function() {
            if (!this.currentUser || this.currentUser.isAdmin) return;
            
            this.editingMedicationId = null;
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة دواء جديد';
            
            // إعادة تعيين الحقول
            const fields = ['medName', 'medType', 'medDosage', 'medStartDate', 'medStartTime', 'medDuration', 'medFrequency', 'medFoodRelation'];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    if (field === 'medStartDate') {
                        element.value = new Date().toISOString().split('T')[0];
                    } else if (field === 'medStartTime') {
                        const now = new Date();
                        const hours = now.getHours().toString().padStart(2, '0');
                        const minutes = now.getMinutes().toString().padStart(2, '0');
                        element.value = `${hours}:${minutes}`;
                    } else if (field === 'medDuration') {
                        element.value = '7';
                    } else if (field === 'medFrequency') {
                        element.value = '3';
                    } else if (field === 'medFoodRelation') {
                        element.value = 'before';
                    } else if (field === 'medType') {
                        element.value = 'pill';
                    } else {
                        element.value = '';
                    }
                }
            });
            
            const medicationModal = document.getElementById('medicationModal');
            if (medicationModal) medicationModal.classList.add('active');
        },
        
        saveMedication: async function() {
            if (!this.currentUser || this.currentUser.isAdmin) return;

            const name = document.getElementById('medName')?.value?.trim() || '';
            const type = document.getElementById('medType')?.value || 'pill';
            const dosage = document.getElementById('medDosage')?.value?.trim() || '';
            const startDate = document.getElementById('medStartDate')?.value || '';
            const startTime = document.getElementById('medStartTime')?.value || '';
            const duration = parseInt(document.getElementById('medDuration')?.value || '7');
            const frequency = parseInt(document.getElementById('medFrequency')?.value || '3');
            const foodRelation = document.getElementById('medFoodRelation')?.value || 'before';

            if (!name || !startDate || !startTime || !duration || !frequency) {
                this.showToast('يرجى ملء جميع الحقول', 'error');
                return;
            }

            try {
                const medication = {
                    name: name,
                    type: type,
                    dosage: dosage,
                    startDate: startDate,
                    startTime: startTime,
                    duration: duration,
                    frequency: frequency,
                    foodRelation: foodRelation,
                    doses: this.generateDosesForMedication(startDate, startTime, duration, frequency),
                    createdAt: new Date().toISOString()
                };

                if (window.FirebaseDB) {
                    if (this.editingMedicationId) {
                        await window.FirebaseDB.updateMedication(this.currentUser.id, this.editingMedicationId, medication);
                        this.showToast('تم تعديل الدواء بنجاح', 'success');
                    } else {
                        await window.FirebaseDB.saveMedication(this.currentUser.id, medication);
                        this.showToast('تم إضافة الدواء بنجاح', 'success');
                    }
                } else {
                    this.showToast('خطأ في الاتصال بقاعدة البيانات', 'error');
                }

                this.closeModal('medicationModal');
                this.loadData();
            } catch (error) {
                console.error('Error saving medication:', error);
                this.showToast('حدث خطأ أثناء حفظ الدواء', 'error');
            }
        },
        
        generateDosesForMedication: function(startDate, startTime, duration, frequency) {
            const doses = [];
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startDateTime = new Date(startDate + 'T' + startTime + ':00');
            const intervalHours = 24 / frequency;

            for (let day = 0; day < duration; day++) {
                for (let i = 0; i < frequency; i++) {
                    const doseDateTime = new Date(startDateTime);
                    doseDateTime.setHours(startDateTime.getHours() + (day * 24) + (i * intervalHours));

                    doses.push({
                        id: 'dose-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        dateTime: doseDateTime.toISOString(),
                        taken: false,
                        takenTime: null,
                        note: ''
                    });
                }
            }

            doses.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            return doses;
        },
        
        deleteMedication: async function(medicationId) {
            if (!this.currentUser || !medicationId) return;
            
            if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
            
            try {
                if (window.FirebaseDB) {
                    await window.FirebaseDB.deleteMedication(this.currentUser.id, medicationId);
                    this.showToast('تم حذف الدواء', 'success');
                    this.loadData();
                }
            } catch (error) {
                console.error('Error deleting medication:', error);
                this.showToast('حدث خطأ أثناء حذف الدواء', 'error');
            }
        },
        
        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
            this.editingMedicationId = null;
        },
        
        logout: function() {
            if (window.AuthSystem) {
                window.AuthSystem.logout();
            } else {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        },
        
        openSchedulePage: function() {
            if (!this.currentUser) return;
            
            window.open('schedule.html?user=' + encodeURIComponent(this.currentUser.id), '_blank');
        },
        
        printSchedule: function() {
            if (!this.currentUser) return;
            
            const printWindow = window.open('schedule.html?user=' + encodeURIComponent(this.currentUser.id) + '&print=true', '_blank');
            
            if (printWindow) {
                setTimeout(() => {
                    printWindow.print();
                }, 1000);
            }
        },
        
        testNotification: function() {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('اختبار الإشعار', {
                    body: 'هذا إشعار اختبار من نظام متابعة الأدوية',
                    icon: 'https://cdn-icons-png.flaticon.com/512/206/206875.png'
                });
                this.showToast('تم إرسال إشعار اختبار', 'success');
            } else {
                this.showToast('يرجى تفعيل الإشعارات أولاً', 'error');
            }
        },
        
        showToast: function(message, type = 'success') {
            if (window.AuthSystem) {
                window.AuthSystem.showToast(message, type);
            } else {
                alert(message);
            }
        },
        
        loadData: async function() {
            if (!this.currentUser) return;
            
            try {
                if (this.currentUser.isAdmin) {
                    await this.loadAdminData();
                } else {
                    await this.loadUserData();
                }
            } catch (error) {
                console.error('Error loading data:', error);
                this.showToast('خطأ في تحميل البيانات', 'error');
            }
        },
        
        loadAdminData: async function() {
            try {
                if (window.FirebaseDB) {
                    const users = await window.FirebaseDB.getAllUsers();
                    this.renderAdminUserList(users);
                }
            } catch (error) {
                console.error('Error loading admin data:', error);
            }
        },
        
        loadUserData: async function() {
            try {
                if (window.FirebaseDB) {
                    const medications = await window.FirebaseDB.getUserMedications(this.currentUser.id);
                    this.renderUserMedications(medications);
                    this.renderUserInfo();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        },
        
        renderUserInfo: function() {
            if (!this.currentUser) return;
            
            const userInfoDiv = document.getElementById('userInfo');
            if (!userInfoDiv) return;
            
            userInfoDiv.innerHTML = `
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <div class="user-name">${this.currentUser.name}</div>
                    <div class="user-age">${this.currentUser.age ? 'العمر: ' + this.currentUser.age : ''}</div>
                    <div style="margin-top: 10px; color: #666;">
                        <i class="fas fa-envelope"></i> ${this.currentUser.email}
                    </div>
                </div>
                ${this.currentUser.id !== 'admin' ? `
                    <button class="btn btn-danger delete-user-btn" onclick="window.MedicationApp.deleteUserAccount()">
                        <i class="fas fa-trash"></i> حذف حسابي
                    </button>
                ` : ''}
            `;
        },
        
        renderUserMedications: function(medications) {
            const container = document.getElementById('medicationsList');
            if (!container) return;

            if (!medications || medications.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>لا توجد أدوية. قم بإضافة دواء جديد</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = medications.map(med => {
                const totalDoses = med.doses ? med.doses.length : 0;
                const takenDoses = med.doses ? med.doses.filter(d => d.taken).length : 0;
                const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

                const foodText = {
                    'before': 'قبل الأكل',
                    'after': 'بعد الأكل',
                    'none': 'لا علاقة بالطعام'
                };

                const typeLabels = {
                    'pill': 'حبوب',
                    'capsule': 'كبسولات',
                    'syrup': 'شراب',
                    'drops': 'قطرة',
                    'injection': 'حقن',
                    'cream': 'كريم',
                    'inhaler': 'بخاخ',
                    'other': 'أخرى'
                };

                return `
                    <div class="medication-card">
                        <div class="medication-header">
                            <div class="medication-name-wrapper">
                                <span class="medication-name">${med.name}</span>
                                <span class="medication-type type-${med.type}">
                                    ${typeLabels[med.type] || 'أخرى'}
                                </span>
                            </div>
                            <div class="medication-actions">
                                <button class="btn btn-info" onclick="window.MedicationApp.openEditMedicationModal('${med.id}')">
                                    <i class="fas fa-edit"></i> تعديل
                                </button>
                                <button class="btn btn-danger" onclick="window.MedicationApp.deleteMedication('${med.id}')">
                                    <i class="fas fa-trash"></i> حذف
                                </button>
                            </div>
                        </div>
                        <div class="medication-info">
                            <div class="info-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>البدء: ${med.startDate}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>أول جرعة: ${this.formatTimeTo12Hour(med.startTime)}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-hourglass-half"></i>
                                <span>المدة: ${med.duration} يوم</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-redo"></i>
                                <span>${med.frequency} جرعات/يوم</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-utensils"></i>
                                <span>${foodText[med.foodRelation]}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-prescription-bottle-alt"></i>
                                <span>الجرعة: ${med.dosage || 'غير محدد'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-chart-line"></i>
                                <span>الالتزام: ${adherence}%</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },
        
        renderAdminUserList: function(users) {
            const container = document.getElementById('adminUserList');
            if (!container) return;

            const filteredUsers = Object.entries(users).filter(([key]) => key !== 'admin');

            if (filteredUsers.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>لا توجد حسابات مستخدمين</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filteredUsers.map(([username, user]) => {
                return `
                    <div class="admin-user-card">
                        <div class="admin-user-info">
                            <div class="admin-user-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="admin-user-details">
                                <h3>${user.name}</h3>
                                <div>اسم المستخدم: ${username}</div>
                                ${user.age ? `<div>العمر: ${user.age} سنة</div>` : ''}
                                <div><i class="fas fa-envelope"></i> ${user.email}</div>
                            </div>
                        </div>
                        <button class="btn btn-danger" onclick="window.MedicationApp.adminDeleteUser('${username}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
            }).join('');
        },
        
        formatTimeTo12Hour: function(timeStr) {
            if (!timeStr) return '';
            
            const [hours, minutes] = timeStr.split(':').map(Number);
            const ampm = hours >= 12 ? 'م' : 'ص';
            let hours12 = hours % 12;
            hours12 = hours12 ? hours12 : 12;
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
    };
    
    // جعل الدوال متاحة للاستخدام من HTML
    window.toggleTheme = () => window.MedicationApp.toggleTheme();
    window.logout = () => window.MedicationApp.logout();
    window.openAddMedicationModal = () => window.MedicationApp.openAddMedicationModal();
    window.saveMedication = () => window.MedicationApp.saveMedication();
    window.deleteMedication = (id) => window.MedicationApp.deleteMedication(id);
    window.closeModal = (id) => window.MedicationApp.closeModal(id);
    window.openSchedulePage = () => window.MedicationApp.openSchedulePage();
    window.printSchedule = () => window.MedicationApp.printSchedule();
    
    // تهيئة التطبيق عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.MedicationApp.init();
        });
    } else {
        window.MedicationApp.init();
    }
}
