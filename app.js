// app.js
// ===== تهيئة التطبيق =====
let db;
let notificationSystem;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة الترجمة
    Translator.init();
    
    // تهيئة قاعدة البيانات
    db = new FirebaseDB();
    
    // استعادة جلسة المستخدم
    await restoreSession();
    
    // تهيئة النظام
    initSystem();
    
    // تهيئة نظام الإشعارات
    initNotificationSystem();
    
    // تحميل البيانات
    loadData();
});

// ===== إدارة الجلسة =====
async function restoreSession() {
    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            // إذا لم يكن هناك مستخدم، ارجع لصفحة تسجيل الدخول
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        currentUser = JSON.parse(userStr);
        
        // التحقق من صحة المستخدم
        if (currentUser.id === 'admin') {
            // المدير ليس في قاعدة البيانات، لا داعي للتحقق
            return;
        }
        
        // التحقق من وجود المستخدم في قاعدة البيانات
        const userData = await db.getUser(currentUser.id);
        if (!userData) {
            // المستخدم غير موجود، احذف الجلسة
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function saveSession() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function clearSession() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ===== تهيئة النظام =====
function initSystem() {
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
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        });
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    
    const themeButtons = document.querySelectorAll('.theme-toggle');
    themeButtons.forEach(btn => {
        btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

function setupEventHandlers() {
    // زر تسجيل الخروج
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', logout);
    });
    
    // زر تبديل السمة
    const themeBtns = document.querySelectorAll('.theme-toggle');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
}

// ===== تحميل البيانات =====
async function loadData() {
    if (!currentUser) return;
    
    try {
        if (currentUser.id === 'admin') {
            // تحميل بيانات المدير
            await loadAdminData();
        } else {
            // تحميل بيانات المستخدم العادي
            await loadUserData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification(Translator.translate('loadError'), 'error');
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
        // تحميل الأدوية
        const medications = await db.getUserMedications(currentUser.id);
        renderUserMedications(medications);
        
        // تحميل معلومات المستخدم
        renderUserInfo();
        
        // الاستماع للتحديثات في الوقت الحقيقي
        db.listenToMedications(currentUser.id, (medications) => {
            renderUserMedications(medications);
        });
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
            <div class="user-age">${currentUser.age ? Translator.translate('age') + ': ' + currentUser.age : ''}</div>
            <div style="margin-top: 10px; color: #666;">
                <i class="fas fa-bell"></i> 
                ${notificationSystem ? 
                    (notificationSystem.pushEnabled ? Translator.translate('pushEnabled') : Translator.translate('localOnly')) : 
                    Translator.translate('initializing')}
            </div>
        </div>
        ${currentUser.id !== 'admin' ? `
            <button class="btn btn-danger delete-user-btn" onclick="openDeleteUserModal()">
                <i class="fas fa-trash"></i> ${Translator.translate('delete')}
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
                <p>${Translator.translate('noMedications')}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = medications.map(med => {
        const totalDoses = med.doses ? med.doses.length : 0;
        const takenDoses = med.doses ? med.doses.filter(d => d.taken).length : 0;
        const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

        const foodText = {
            'before': Translator.translate('beforeMeal'),
            'after': Translator.translate('afterMeal'),
            'none': Translator.translate('none')
        };

        return `
            <div class="medication-card">
                <div class="medication-header">
                    <div class="medication-name-wrapper">
                        <span class="medication-name">${med.name}</span>
                        <span class="medication-type type-${med.type}">
                            ${Translator.translate(med.type)}
                        </span>
                    </div>
                    <div class="medication-actions">
                        <button class="btn btn-info" onclick="openEditMedicationModal('${med.id}')">
                            <i class="fas fa-edit"></i> ${Translator.translate('edit')}
                        </button>
                        <button class="btn btn-danger" onclick="deleteMedication('${med.id}')">
                            <i class="fas fa-trash"></i> ${Translator.translate('delete')}
                        </button>
                    </div>
                </div>
                <div class="medication-info">
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${Translator.translate('startDate')}: ${med.startDate}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${Translator.translate('firstDose')}: ${formatTimeTo12Hour(med.startTime)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${Translator.translate('duration')}: ${med.duration} ${Translator.translate('days')}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-redo"></i>
                        <span>${med.frequency} ${Translator.translate('timesPerDay')}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-utensils"></i>
                        <span>${foodText[med.foodRelation]}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-prescription-bottle-alt"></i>
                        <span>${Translator.translate('dosage')}: ${med.dosage || Translator.translate('notSpecified')}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chart-line"></i>
                        <span>${Translator.translate('adherence')}: ${adherence}%</span>
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
                <p>${Translator.translate('noUsers')}</p>
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
                        <div>${Translator.translate('username')}: ${username}</div>
                        ${user.age ? `<div>${Translator.translate('age')}: ${user.age}</div>` : ''}
                    </div>
                </div>
                <button class="btn btn-danger" onclick="adminDeleteUser('${username}')">
                    <i class="fas fa-trash"></i> ${Translator.translate('delete')}
                </button>
            </div>
        `;
    }).join('');
}

// ===== إدارة الأدوية =====
async function openAddMedicationModal() {
    if (!currentUser || currentUser.id === 'admin') return;
    
    document.getElementById('modalTitle').innerHTML = `<i class="fas fa-plus-circle"></i> ${Translator.translate('addMedication')}`;
    
    // إعادة تعيين النموذج
    document.getElementById('medName').value = '';
    document.getElementById('medType').value = 'pill';
    document.getElementById('medDosage').value = '';
    
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    document.getElementById('medStartDate').value = defaultDate;
    
    // الوقت الحالي + 5 دقائق
    const defaultTime = new Date(today.getTime() + 5 * 60000);
    const hours = defaultTime.getHours().toString().padStart(2, '0');
    const minutes = defaultTime.getMinutes().toString().padStart(2, '0');
    document.getElementById('medStartTime').value = `${hours}:${minutes}`;
    
    document.getElementById('medDuration').value = '7';
    document.getElementById('medFrequency').value = '3';
    document.getElementById('medFoodRelation').value = 'before';
    
    // إظهار النافذة
    document.getElementById('medicationModal').classList.add('active');
}

async function saveMedication() {
    if (!currentUser || currentUser.id === 'admin') return;

    const username = currentUser.id;
    const name = document.getElementById('medName').value.trim();
    const type = document.getElementById('medType').value;
    const dosage = document.getElementById('medDosage').value.trim();
    const startDate = document.getElementById('medStartDate').value;
    const startTime = document.getElementById('medStartTime').value;
    const duration = parseInt(document.getElementById('medDuration').value);
    const frequency = parseInt(document.getElementById('medFrequency').value);
    const foodRelation = document.getElementById('medFoodRelation').value;

    // التحقق من المدخلات
    if (!name || !startDate || !startTime || !duration || !frequency) {
        showNotification(Translator.translate('fillAllFields'), 'error');
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
            doses: generateDosesForMedication(startDate, startTime, duration, frequency),
            createdAt: new Date().toISOString()
        };

        await db.saveMedication(username, medication);
        showNotification(Translator.translate('medicationAdded'), 'success');
        closeModal('medicationModal');
        
        // إعادة جدولة الإشعارات
        if (notificationSystem) {
            notificationSystem.cancelAllAlerts();
            setTimeout(() => {
                notificationSystem.checkScheduledAlerts();
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving medication:', error);
        showNotification(Translator.translate('saveError'), 'error');
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
    if (!currentUser || !medicationId) return;
    
    if (!confirm(Translator.translate('deleteConfirmation'))) return;
    
    try {
        await db.deleteMedication(currentUser.id, medicationId);
        showNotification(Translator.translate('medicationDeleted'), 'success');
        
        // إعادة جدولة الإشعارات
        if (notificationSystem) {
            notificationSystem.cancelAllAlerts();
            setTimeout(() => {
                notificationSystem.checkScheduledAlerts();
            }, 1000);
        }
    } catch (error) {
        console.error('Error deleting medication:', error);
        showNotification(Translator.translate('deleteError'), 'error');
    }
}

// ===== نظام الإشعارات =====
function initNotificationSystem() {
    if ('Notification' in window && Notification.permission === 'granted') {
        console.log('Notifications already granted');
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // تسجيل Service Worker
    registerServiceWorker();
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // التأكد من أننا في بروتوكول HTTP/HTTPS
            if (window.location.protocol === 'file:') {
                console.log('Service Worker لا يعمل مع بروتوكول file://. يرجى استخدام خادم ويب.');
                return;
            }
            
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
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

function showNotification(message, type = 'success') {
    // استخدام Toastify.js للإشعارات
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: Translator.currentLang === 'ar' ? "left" : "right",
        backgroundColor: type === 'success' ? "#4CAF50" : "#f44336",
        stopOnFocus: true
    }).showToast();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ===== دوال متاحة عالمياً =====
window.toggleTheme = toggleTheme;
window.logout = function() {
    clearSession();
};

window.openAddMedicationModal = openAddMedicationModal;
window.saveMedication = saveMedication;
window.deleteMedication = deleteMedication;
window.closeModal = closeModal;

// دالة للتحقق من تسجيل الدخول في كل صفحة
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}