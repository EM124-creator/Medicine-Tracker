// translation.js
// التحقق من عدم وجود Translator مسبقاً
if (typeof Translator === 'undefined') {
    class Translator {
        static translations = {
            ar: {
                // صفحة تسجيل الدخول
                appTitle: "نظام متابعة الأدوية",
                appSubtitle: "إدارة أدويتك ومتابعة جرعاتك بدقة",
                email: "البريد الإلكتروني",
                password: "كلمة المرور",
                emailPlaceholder: "أدخل بريدك الإلكتروني",
                passwordPlaceholder: "أدخل كلمة المرور",
                login: "تسجيل الدخول",
                register: "تسجيل جديد",
                demoCredentials: "بيانات الدخول للتجربة",
                admin: "المدير",
                testUser: "مستخدم تجريبي",
                copyright: "© 2024 نظام متابعة الأدوية. جميع الحقوق محفوظة.",
                fillAllFields: "يرجى ملء جميع الحقول",
                invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
                loginError: "حدث خطأ أثناء تسجيل الدخول",
                welcome: "مرحباً بك",
                systemAdmin: "مدير النظام",
                registrationSuccess: "تم إنشاء الحساب بنجاح",
                registrationError: "حدث خطأ أثناء التسجيل",
                
                // الصفحة الرئيسية
                adminDashboard: "لوحة تحكم المدير",
                manageUsers: "إدارة حسابات المستخدمين",
                addMedication: "إضافة دواء جديد",
                viewSchedule: "عرض الجدول والإحصائيات",
                printSchedule: "طباعة الجدول",
                medicationList: "قائمة الأدوية",
                notificationManagement: "إدارة الإشعارات والتنبيهات",
                pushNotifications: "إشعارات Push",
                pushNotificationsDesc: "إشعارات على شاشة هاتفك حتى عند إغلاق الموقع",
                soundNotifications: "التنبيهات الصوتية",
                soundNotificationsDesc: "تشغيل صوت عند وقت الدواء",
                autoRepeat: "التكرار التلقائي",
                autoRepeatDesc: "تكرار الإشعار كل 10 دقائق حتى أخذ الدواء",
                muteMode: "وضع الصامت",
                muteModeDesc: "كتم الإشعارات لمدة 10 دقائق عند الطلب",
                testNotification: "اختبار الإشعار",
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
                
                // الإشعارات
                timeForMedication: "⏰ وقت الدواء!",
                takeMedication: "تناول الدواء",
                snooze: "تأجيل",
                close: "إغلاق",
                time: "الوقت"
            },
            en: {
                // Login Page
                appTitle: "Medication Tracker",
                appSubtitle: "Manage your medications and track doses accurately",
                email: "Email",
                password: "Password",
                emailPlaceholder: "Enter your email",
                passwordPlaceholder: "Enter your password",
                login: "Login",
                register: "Register",
                demoCredentials: "Demo Credentials",
                admin: "Admin",
                testUser: "Test User",
                copyright: "© 2024 Medication Tracker. All rights reserved.",
                fillAllFields: "Please fill all fields",
                invalidCredentials: "Invalid email or password",
                loginError: "Login error occurred",
                welcome: "Welcome",
                systemAdmin: "System Administrator",
                registrationSuccess: "Account created successfully",
                registrationError: "Registration error occurred",
                
                // Main Page
                adminDashboard: "Admin Dashboard",
                manageUsers: "Manage User Accounts",
                addMedication: "Add New Medication",
                viewSchedule: "View Schedule & Statistics",
                printSchedule: "Print Schedule",
                medicationList: "Medications List",
                notificationManagement: "Notifications Management",
                pushNotifications: "Push Notifications",
                pushNotificationsDesc: "Notifications on your phone even when the site is closed",
                soundNotifications: "Sound Alerts",
                soundNotificationsDesc: "Play sound at medication time",
                autoRepeat: "Auto Repeat",
                autoRepeatDesc: "Repeat notification every 10 minutes until medication is taken",
                muteMode: "Mute Mode",
                muteModeDesc: "Mute notifications for 10 minutes on demand",
                testNotification: "Test Notification",
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
                
                // Notifications
                timeForMedication: "⏰ Medication Time!",
                takeMedication: "Take Medication",
                snooze: "Snooze",
                close: "Close",
                time: "Time"
            }
        };

        static currentLang = 'ar';

        static init() {
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

            // تحديث قيم الـ option
            document.querySelectorAll('option[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                element.textContent = this.translate(key);
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
}
