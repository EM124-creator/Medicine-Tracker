// translation.js - FIXED VERSION
// استبدال الكلاس بـ Object بسيط لتجنب المشاكل

if (typeof window.MedicationTranslator === 'undefined') {
    window.MedicationTranslator = {
        translations: {
            ar: {
                appTitle: "نظام متابعة الأدوية",
                appSubtitle: "إدارة أدويتك ومتابعة جرعاتك بدقة",
                email: "البريد الإلكتروني",
                password: "كلمة المرور",
                emailPlaceholder: "أدخل بريدك الإلكتروني",
                passwordPlaceholder: "أدخل كلمة المرور",
                login: "تسجيل الدخول",
                register: "تسجيل جديد",
                fillAllFields: "يرجى ملء جميع الحقول",
                invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                loginError: "حدث خطأ أثناء تسجيل الدخول",
                welcome: "مرحباً بك",
                systemAdmin: "مدير النظام",
                
                adminDashboard: "لوحة تحكم المدير",
                manageUsers: "إدارة حسابات المستخدمين",
                addMedication: "إضافة دواء جديد",
                viewSchedule: "عرض الجدول والإحصائيات",
                printSchedule: "طباعة الجدول",
                medicationList: "قائمة الأدوية",
                notificationManagement: "إدارة الإشعارات والتنبيهات",
                dosage: "الجرعة",
                dosagePlaceholder: "مثال: حبة واحدة، ملعقة صغيرة",
                edit: "تعديل",
                delete: "حذف",
                deleteAccount: "حذف حسابي",
                startDate: "تاريخ البدء",
                firstDose: "أول جرعة",
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
                notSpecified: "غير محدد",
                adherence: "الالتزام",
                timeForMedication: "⏰ وقت الدواء!",
                takeMedication: "تناول الدواء",
                snooze: "تأجيل",
                close: "إغلاق",
                time: "الوقت"
            },
            en: {
                appTitle: "Medication Tracker",
                appSubtitle: "Manage your medications and track doses accurately",
                email: "Email",
                password: "Password",
                emailPlaceholder: "Enter your email",
                passwordPlaceholder: "Enter your password",
                login: "Login",
                register: "Register",
                fillAllFields: "Please fill all fields",
                invalidCredentials: "Invalid email or password",
                loginError: "Login error occurred",
                welcome: "Welcome",
                systemAdmin: "System Administrator",
                
                adminDashboard: "Admin Dashboard",
                manageUsers: "Manage User Accounts",
                addMedication: "Add New Medication",
                viewSchedule: "View Schedule & Statistics",
                printSchedule: "Print Schedule",
                medicationList: "Medications List",
                notificationManagement: "Notifications Management",
                dosage: "Dosage",
                dosagePlaceholder: "Example: One tablet, teaspoon",
                edit: "Edit",
                delete: "Delete",
                deleteAccount: "Delete My Account",
                startDate: "Start Date",
                firstDose: "First Dose",
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
                notSpecified: "Not specified",
                adherence: "Adherence",
                timeForMedication: "⏰ Medication Time!",
                takeMedication: "Take Medication",
                snooze: "Snooze",
                close: "Close",
                time: "Time"
            }
        },

        currentLang: 'ar',

        init: function() {
            this.currentLang = localStorage.getItem('language') || 'ar';
            this.updatePage();
            this.setupLanguageSwitcher();
        },

        translate: function(key) {
            return this.translations[this.currentLang][key] || key;
        },

        updatePage: function() {
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

            // تحديث قيم الـ option
            document.querySelectorAll('option[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                element.textContent = this.translate(key);
            });

            // تغيير اتجاه الصفحة
            document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = this.currentLang;
        },

        setupLanguageSwitcher: function() {
            const langBtn = document.getElementById('langBtn');
            if (langBtn) {
                langBtn.addEventListener('click', () => {
                    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
                    localStorage.setItem('language', this.currentLang);
                    this.updatePage();
                });
            }
        },

        setLanguage: function(lang) {
            if (this.translations[lang]) {
                this.currentLang = lang;
                localStorage.setItem('language', lang);
                this.updatePage();
            }
        }
    };
    
    // للتوافق مع الكود القديم
    window.Translator = window.MedicationTranslator;
}
