// auth-system.js - نظام المصادقة المنفصل
if (typeof window.AuthSystem === 'undefined') {
    window.AuthSystem = {
        // ===== دوال تسجيل الدخول =====
        login: async function(email, password) {
            if (!email || !password) {
                this.showToast('يرجى ملء جميع الحقول', 'error');
                return;
            }

            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // الحصول على بيانات المستخدم من Realtime Database
                const username = email.split('@')[0];
                const db = firebase.database();
                const userRef = db.ref('users/' + username);
                const snapshot = await userRef.once('value');
                const userData = snapshot.val();

                if (userData) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: username,
                        name: userData.name,
                        age: userData.age,
                        email: email,
                        isAdmin: email === 'admin@medication.com'
                    }));
                    
                    this.showToast('مرحباً بك ' + userData.name, 'success');
                    window.location.href = 'index.html';
                } else if (email === 'admin@medication.com') {
                    // تسجيل دخول المدير
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: 'admin',
                        name: 'مدير النظام',
                        email: email,
                        isAdmin: true
                    }));
                    window.location.href = 'index.html';
                } else {
                    this.showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showToast('حدث خطأ أثناء تسجيل الدخول: ' + error.message, 'error');
            }
        },

        register: async function() {
            const name = prompt('الرجاء إدخال اسمك الكامل:');
            if (!name) return;
            
            const email = prompt('الرجاء إدخال بريدك الإلكتروني:');
            if (!email) return;
            
            const password = prompt('الرجاء إدخال كلمة المرور (6 أحرف على الأقل):');
            if (!password || password.length < 6) {
                alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return;
            }
            
            const age = prompt('الرجاء إدخال عمرك (اختياري):') || '';
            
            try {
                // إنشاء حساب باستخدام Firebase Authentication
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // حفظ بيانات المستخدم في قاعدة البيانات
                const db = firebase.database();
                const username = email.split('@')[0];
                await db.ref('users/' + username).set({
                    name: name,
                    email: email,
                    age: age,
                    createdAt: new Date().toISOString()
                });
                
                // إنشاء قائمة أدوية فارغة للمستخدم
                await db.ref('medications/' + username).set({});
                
                this.showToast('تم إنشاء الحساب بنجاح', 'success');
                
                // تسجيل الدخول تلقائياً
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } catch (error) {
                console.error('Registration error:', error);
                this.showToast('حدث خطأ أثناء التسجيل: ' + error.message, 'error');
            }
        },

        logout: async function() {
            try {
                await firebase.auth().signOut();
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = 'login.html';
            }
        },

        showToast: function(message, type = 'success') {
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
                alert(message);
            }
        },

        checkAuthState: function() {
            firebase.auth().onAuthStateChanged((user) => {
                if (user && window.location.pathname.includes('login.html')) {
                    window.location.href = 'index.html';
                }
            });
        },

        init: function() {
            // التحقق من حالة المصادقة
            this.checkAuthState();
            
            // إعداد معالجات الأحداث لصفحة login.html
            if (window.location.pathname.includes('login.html')) {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const email = document.getElementById('loginEmail')?.value || '';
                        const password = document.getElementById('loginPassword')?.value || '';
                        this.login(email, password);
                    });
                }
                
                const registerBtn = document.getElementById('registerBtn');
                if (registerBtn) {
                    registerBtn.addEventListener('click', () => this.register());
                }
            }
        }
    };
    
    // تهيئة نظام المصادقة عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AuthSystem.init();
        });
    } else {
        window.AuthSystem.init();
    }
}
