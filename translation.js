// translation.js
class Translator {
    static translations = {
        ar: {
            // صفحة تسجيل الدخول
            appTitle: "نظام متابعة الأدوية المتقدم",
            appSubtitle: "إدارة أدويتك ومتابعة جرعاتك بدقة",
            username: "اسم المستخدم",
            password: "كلمة المرور",
            usernamePlaceholder: "أدخل اسم المستخدم",
            passwordPlaceholder: "أدخل كلمة المرور",
            login: "تسجيل الدخول",
            register: "تسجيل جديد",
            demoCredentials: "بيانات الدخول للتجربة",
            admin: "المدير",
            testUser: "مستخدم تجريبي",
            copyright: "© 2024 نظام متابعة الأدوية. جميع الحقوق محفوظة.",
            fillAllFields: "يرجى ملء جميع الحقول",
            invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
            loginError: "حدث خطأ أثناء تسجيل الدخول",
            welcome: "مرحباً بك",
            systemAdmin: "مدير النظام",
            
            // الصفحة الرئيسية
            addMedication: "إضافة دواء جديد",
            viewSchedule: "عرض الجدول والإحصائيات",
            printSchedule: "طباعة الجدول",
            medicationList: "قائمة الأدوية",
            dosage: "الجرعة",
            dosagePlaceholder: "مثال: حبة واحدة، ملعقة صغيرة",
            edit: "تعديل",
            delete: "حذف",
            startDate: "تاريخ البدء",
            duration: "المدة",
            days: "أيام",
            frequency: "التكرار",
            timesPerDay: "مرات/يوم",
            foodRelation: "العلاقة بالطعام",
            beforeMeal: "قبل الأكل",
            afterMeal: "بعد الأكل",
            none: "لا علاقة",
            medicationType: "نوع الدواء",
            pill: "حبوب",
            capsule: "كبسولات",
            syrup: "شراب",
            drops: "قطرة",
            injection: "حقن",
            cream: "كريم",
            inhaler: "بخاخ",
            other: "أخرى",
            save: "حفظ",
            cancel: "إلغاء",
            deleteConfirmation: "هل أنت متأكد من الحذف؟",
            medicationAdded: "تم إضافة الدواء بنجاح",
            medicationUpdated: "تم تحديث الدواء بنجاح",
            medicationDeleted: "تم حذف الدواء بنجاح",
            
            // الإشعارات
            pushNotifications: "إشعارات Push",
            soundNotifications: "التنبيهات الصوتية",
            autoRepeat: "التكرار التلقائي",
            mute: "وضع الصامت",
            testNotification: "اختبار الإشعار",
            timeForMedication: "⏰ وقت الدواء!",
            takeMedication: "تناول الدواء",
            snooze: "تأجيل",
            close: "إغلاق",
            
            // الجدول
            statistics: "الإحصائيات",
            dosesTaken: "جرعات تم أخذها",
            missedDoses: "جرعات فائتة",
            upcomingDoses: "جرعات قادمة",
            adherenceRate: "نسبة الالتزام",
            monthlySchedule: "جدول الجرعات الشهري",
            printTable: "طباعة الجدول",
            backToMain: "العودة للصفحة الرئيسية"
        },
        en: {
            // Login Page
            appTitle: "Advanced Medication Tracker",
            appSubtitle: "Manage your medications and track doses accurately",
            username: "Username",
            password: "Password",
            usernamePlaceholder: "Enter username",
            passwordPlaceholder: "Enter password",
            login: "Login",
            register: "Register",
            demoCredentials: "Demo Credentials",
            admin: "Admin",
            testUser: "Test User",
            copyright: "© 2024 Medication Tracker. All rights reserved.",
            fillAllFields: "Please fill all fields",
            invalidCredentials: "Invalid username or password",
            loginError: "Login error occurred",
            welcome: "Welcome",
            systemAdmin: "System Administrator",
            
            // Main Page
            addMedication: "Add New Medication",
            viewSchedule: "View Schedule & Statistics",
            printSchedule: "Print Schedule",
            medicationList: "Medications List",
            dosage: "Dosage",
            dosagePlaceholder: "Example: One tablet, 5ml, etc.",
            edit: "Edit",
            delete: "Delete",
            startDate: "Start Date",
            duration: "Duration",
            days: "days",
            frequency: "Frequency",
            timesPerDay: "times/day",
            foodRelation: "Food Relation",
            beforeMeal: "Before Meal",
            afterMeal: "After Meal",
            none: "None",
            medicationType: "Medication Type",
            pill: "Pills",
            capsule: "Capsules",
            syrup: "Syrup",
            drops: "Drops",
            injection: "Injection",
            cream: "Cream",
            inhaler: "Inhaler",
            other: "Other",
            save: "Save",
            cancel: "Cancel",
            deleteConfirmation: "Are you sure you want to delete?",
            medicationAdded: "Medication added successfully",
            medicationUpdated: "Medication updated successfully",
            medicationDeleted: "Medication deleted successfully",
            
            // Notifications
            pushNotifications: "Push Notifications",
            soundNotifications: "Sound Alerts",
            autoRepeat: "Auto Repeat",
            mute: "Mute Mode",
            testNotification: "Test Notification",
            timeForMedication: "⏰ Medication Time!",
            takeMedication: "Take Medication",
            snooze: "Snooze",
            close: "Close",
            
            // Schedule
            statistics: "Statistics",
            dosesTaken: "Doses Taken",
            missedDoses: "Missed Doses",
            upcomingDoses: "Upcoming Doses",
            adherenceRate: "Adherence Rate",
            monthlySchedule: "Monthly Schedule",
            printTable: "Print Table",
            backToMain: "Back to Main Page"
        }
    };

    static currentLang = 'ar';

    static init() {
        // الحصول على اللغة المحفوظة
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.updatePage();
        this.setupLanguageSwitcher();
    }

    static translate(key) {
        return this.translations[this.currentLang][key] || key;
    }

    static updatePage() {
        // تحديث النصوص
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // تحديث مكانات النصوص
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            element.placeholder = this.translate(key);
        });

        // تغيير اتجاه الصفحة
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang;

        // تحديث زر اللغة
        const langBtn = document.getElementById('langBtn');
        if (langBtn) {
            langBtn.innerHTML = this.currentLang === 'ar' ? 
                '<i class="fas fa-language"></i> English' : 
                '<i class="fas fa-language"></i> العربية';
        }
    }

    static setupLanguageSwitcher() {
        const langBtn = document.getElementById('langBtn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
                localStorage.setItem('language', this.currentLang);
                this.updatePage();
                
                // إعادة تحميل البيانات إذا لزم الأمر
                if (typeof window.loadData === 'function') {
                    window.loadData();
                }
            });
        }
    }

    static setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updatePage();
        }
    }
}

// جعل الكلاس متاحًا عالميًا
window.Translator = Translator;