// app.js
let db;
let currentUser = null;

// التحقق من وجود عناصر قبل استخدامها
function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

// التحقق من وجود عنصر قبل التعديل
function safeSetTextContent(selector, text) {
    const element = safeQuerySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

// التحقق من وجود عنصر قبل إضافة class
function safeAddClass(selector, className) {
    const element = safeQuerySelector(selector);
    if (element) {
        element.classList.add(className);
    }
}

// التحقق من وجود عنصر قبل إزالة class
function safeRemoveClass(selector, className) {
    const element = safeQuerySelector(selector);
    if (element) {
        element.classList.remove(className);
    }
}

// ===== تهيئة النظام =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App initialized');
    
    // تهيئة الترجمة
    if (typeof Translator !== 'undefined') {
        Translator.init();
    }
    
    // تهيئة قاعدة البيانات
    if (typeof FirebaseDB !== 'undefined') {
        db = new FirebaseDB();
    }
    
    // استعادة جلسة المستخدم
    await restoreSession();
    
    // تهيئة الصفحة
    initPage();
    
    // تحميل البيانات
    loadData();
});

// ===== إدارة الجلسة =====
async function restoreSession() {
    try {
        // التحقق من تسجيل الدخول باستخدام Firebase Auth
        if (db && db.auth) {
            db.onAuthStateChanged(async (user) => {
                if (user) {
                    const userStr = localStorage.getItem('currentUser');
                    if (userStr) {
                        currentUser = JSON.parse(userStr);
                        showCorrectPage();
                    } else {
                        // إذا لم يكن هناك بيانات في localStorage، نأخذها من Firebase Auth
                        const username = user.email.split('@')[0];
                        const userData = await db.getUser(username);
                        
                        if (userData) {
                            currentUser = {
                                id: username,
                                name: userData.name,
                                age: userData.age,
                                email: user.email,
                                isAdmin: user.email === 'admin@medication.com'
                            };
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            showCorrectPage();
                        }
                    }
                } else {
                    // إذا لم يكن هناك مستخدم مسجل، نذهب لصفحة تسجيل الدخول
                    if (!window.location.href.includes('login.html')) {
                        window.location.href = 'login.html';
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error restoring session:', error);
    }
}

function showCorrectPage() {
    if (!currentUser) {
        safeRemoveClass('#userPage', 'active');
        safeRemoveClass('#adminPage', 'active');
        return;
    }
    
    if (currentUser.isAdmin) {
        safeAddClass('#adminPage', 'active');
        safeRemoveClass('#userPage', 'active');
    } else {
        safeAddClass('#userPage', 'active');
        safeRemoveClass('#adminPage', 'active');
    }
}

function initPage() {
    // تحديث التاريخ
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);
    
    // تحميل السمة
    loadTheme();
    
    // إعداد معالجات الأحداث
    setupEventHandlers();
}

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const dateElements = document.querySelectorAll('#currentDate');
    dateElements.forEach(element => {
        element.textContent = now.toLocaleDateString(
            Translator.currentLang === 'ar' ? 'ar-SA' : 'en-US', 
            options
        );
    });
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeButtons = document.querySelectorAll('.theme-toggle');
        themeButtons.forEach(btn => {
            if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
        });
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach(btn => {
        if (btn) {
            btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    });
}

function setupEventHandlers() {
    // زر تسجيل الخروج
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', logout);
        }
    });
    
    // زر تبديل السمة
    const themeBtns = document.querySelectorAll('.theme-toggle');
    themeBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }
    });
}

// ===== تحميل البيانات =====
async function loadData() {
    if (!currentUser || !db) return;
    
    try {
        if (currentUser.isAdmin) {
            await loadAdminData();
        } else {
            await loadUserData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('خطأ في تحميل البيانات', 'error');
    }
}

async function loadAdminData() {
    try {
        const users = await db.getAllUsers();
        renderAdminUserList(users);
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

async function loadUserData() {
    try {
        const medications = await db.getUserMedications(currentUser.id);
        renderUserMedications(medications);
        renderUserInfo();
        
        // الاستماع للتحديثات في الوقت الحقيقي
        if (db.listenToMedications) {
            db.listenToMedications(currentUser.id, (medications) => {
                renderUserMedications(medications);
            });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ===== عرض البيانات =====
function renderUserInfo() {
    if (!currentUser) return;
    
    const userInfoDiv = document.getElementById('userInfo');
    if (!userInfoDiv) return;
    
    userInfoDiv.innerHTML = `
        <div class="user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="user-details">
            <div class="user-name">${currentUser.name}</div>
            <div class="user-age">${currentUser.age ? 'العمر: ' + currentUser.age : ''}</div>
            <div style="margin-top: 10px; color: #666;">
                <i class="fas fa-envelope"></i> ${currentUser.email}
            </div>
        </div>
        ${currentUser.id !== 'admin' ? `
            <button class="btn btn-danger delete-user-btn" onclick="deleteUserAccount()">
                <i class="fas fa-trash"></i> حذف حسابي
            </button>
        ` : ''}
    `;
}

function renderUserMedications(medications) {
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

        return `
            <div class="medication-card">
                <div class="medication-header">
                    <div class="medication-name-wrapper">
                        <span class="medication-name">${med.name}</span>
                        <span class="medication-type type-${med.type}">
                            ${getTypeLabel(med.type)}
                        </span>
                    </div>
                    <div class="medication-actions">
                        <button class="btn btn-info" onclick="openEditMedicationModal('${med.id}')">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn btn-danger" onclick="deleteMedication('${med.id}')">
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
                        <span>أول جرعة: ${formatTimeTo12Hour(med.startTime)}</span>
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
}

function renderAdminUserList(users) {
    const container = document.getElementById('adminUserList');
    if (!container) return;

    // إزالة المستخدم admin من القائمة
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
                <button class="btn btn-danger" onclick="adminDeleteUser('${username}')">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
    }).join('');
}

// ===== دوال إدارة الأدوية =====
let editingMedicationId = null;

function openAddMedicationModal() {
    if (!currentUser || currentUser.isAdmin) return;
    
    editingMedicationId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة دواء جديد';
    
    const medName = document.getElementById('medName');
    if (medName) medName.value = '';
    
    const medType = document.getElementById('medType');
    if (medType) medType.value = 'pill';
    
    const medDosage = document.getElementById('medDosage');
    if (medDosage) medDosage.value = '';
    
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    const medStartDate = document.getElementById('medStartDate');
    if (medStartDate) medStartDate.value = defaultDate;
    
    const defaultTime = new Date(today.getTime() + 5 * 60000);
    const hours = defaultTime.getHours().toString().padStart(2, '0');
    const minutes = defaultTime.getMinutes().toString().padStart(2, '0');
    const medStartTime = document.getElementById('medStartTime');
    if (medStartTime) medStartTime.value = `${hours}:${minutes}`;
    
    const medDuration = document.getElementById('medDuration');
    if (medDuration) medDuration.value = '7';
    
    const medFrequency = document.getElementById('medFrequency');
    if (medFrequency) medFrequency.value = '3';
    
    const medFoodRelation = document.getElementById('medFoodRelation');
    if (medFoodRelation) medFoodRelation.value = 'before';
    
    const medicationModal = document.getElementById('medicationModal');
    if (medicationModal) medicationModal.classList.add('active');
}

async function saveMedication() {
    if (!currentUser || !db || currentUser.isAdmin) return;

    const username = currentUser.id;
    const name = document.getElementById('medName')?.value?.trim() || '';
    const type = document.getElementById('medType')?.value || 'pill';
    const dosage = document.getElementById('medDosage')?.value?.trim() || '';
    const startDate = document.getElementById('medStartDate')?.value || '';
    const startTime = document.getElementById('medStartTime')?.value || '';
    const duration = parseInt(document.getElementById('medDuration')?.value || '7');
    const frequency = parseInt(document.getElementById('medFrequency')?.value || '3');
    const foodRelation = document.getElementById('medFoodRelation')?.value || 'before';

    if (!name || !startDate || !startTime || !duration || !frequency) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }

    try {
        if (editingMedicationId) {
            // تحديث الدواء
            await db.updateMedication(username, editingMedicationId, {
                name: name,
                type: type,
                dosage: dosage,
                startDate: startDate,
                startTime: startTime,
                duration: duration,
                frequency: frequency,
                foodRelation: foodRelation
            });
            showToast('تم تعديل الدواء بنجاح', 'success');
        } else {
            // إضافة دواء جديد
            const medication = {
                name: name,
                type: type,
                dosage: dosage,
                startDate: startDate,
                startTime: startTime,
                duration: duration,
                frequency: frequency,
                foodRelation: foodRelation,
                doses: generateDosesForMedication(startDate, startTime, duration, frequency),
                createdAt: new Date().toISOString()
            };

            await db.saveMedication(username, medication);
            showToast('تم إضافة الدواء بنجاح', 'success');
        }

        closeModal('medicationModal');
        await loadData();
    } catch (error) {
        console.error('Error saving medication:', error);
        showToast('حدث خطأ أثناء حفظ الدواء', 'error');
    }
}

function generateDosesForMedication(startDate, startTime, duration, frequency) {
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
}

async function deleteMedication(medicationId) {
    if (!currentUser || !db || !medicationId) return;
    
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
    
    try {
        await db.deleteMedication(currentUser.id, medicationId);
        showToast('تم حذف الدواء', 'success');
        await loadData();
    } catch (error) {
        console.error('Error deleting medication:', error);
        showToast('حدث خطأ أثناء حذف الدواء', 'error');
    }
}

// ===== دوال مساعدة =====
function formatTimeTo12Hour(timeStr) {
    if (!timeStr) return '';
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'م' : 'ص';
    let hours12 = hours % 12;
    hours12 = hours12 ? hours12 : 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function formatDateTimeTo12Hour(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'م' : 'ص';
    let hours12 = hours % 12;
    hours12 = hours12 ? hours12 : 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getTypeLabel(type) {
    const labels = {
        'pill': 'حبوب',
        'capsule': 'كبسولات',
        'syrup': 'شراب',
        'drops': 'قطرة',
        'injection': 'حقن',
        'cream': 'كريم',
        'inhaler': 'بخاخ',
        'other': 'أخرى'
    };
    return labels[type] || 'أخرى';
}

function showToast(message, type = 'success') {
    // استخدام Toastify.js إذا كان متاحاً
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? "#4CAF50" : "#f44336",
            stopOnFocus: true
        }).showToast();
    } else {
        // بديل بسيط
        alert(message);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    editingMedicationId = null;
}

async function logout() {
    try {
        // تسجيل الخروج من Firebase Auth
        if (db && db.auth) {
            await db.auth.signOut();
        }
        
        // مسح البيانات المحلية
        localStorage.removeItem('currentUser');
        
        // توجيه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

function openSchedulePage() {
    if (!currentUser) return;
    
    window.open('schedule.html?user=' + encodeURIComponent(currentUser.id), '_blank');
}

function printSchedule() {
    if (!currentUser) return;
    
    const printWindow = window.open('schedule.html?user=' + encodeURIComponent(currentUser.id) + '&print=true', '_blank');
    
    if (printWindow) {
        setTimeout(() => {
            printWindow.print();
        }, 1000);
    }
}

// ===== دوال متاحة عالمياً =====
window.toggleTheme = toggleTheme;
window.logout = logout;
window.openAddMedicationModal = openAddMedicationModal;
window.saveMedication = saveMedication;
window.deleteMedication = deleteMedication;
window.closeModal = closeModal;
window.openSchedulePage = openSchedulePage;
window.printSchedule = printSchedule;
