// firebase-db.js
class FirebaseDB {
    constructor() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase is not loaded');
            return;
        }
        
        try {
            this.db = firebase.database();
            this.auth = firebase.auth();
            console.log('FirebaseDB initialized successfully');
        } catch (error) {
            console.error('Error initializing FirebaseDB:', error);
        }
    }

    // ===== إدارة المصادقة =====
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async register(email, password, userData) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // حفظ بيانات المستخدم
            const username = email.split('@')[0];
            await this.db.ref('users/' + username).set({
                ...userData,
                email: email,
                createdAt: new Date().toISOString()
            });
            
            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }

    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }

    // ===== إدارة المستخدمين =====
    async saveUser(username, userData) {
        try {
            await this.db.ref('users/' + username).set(userData);
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }

    async getUser(username) {
        try {
            const snapshot = await this.db.ref('users/' + username).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const snapshot = await this.db.ref('users').once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    async deleteUser(username) {
        try {
            await this.db.ref('users/' + username).remove();
            await this.db.ref('medications/' + username).remove();
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // ===== إدارة الأدوية =====
    async saveMedication(username, medication) {
        try {
            const medRef = this.db.ref('medications/' + username).push();
            medication.id = medRef.key;
            await medRef.set(medication);
            return medication;
        } catch (error) {
            console.error('Error saving medication:', error);
            throw error;
        }
    }

    async updateMedication(username, medicationId, medication) {
        try {
            await this.db.ref(`medications/${username}/${medicationId}`).update(medication);
            return true;
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    }

    async getUserMedications(username) {
        try {
            const snapshot = await this.db.ref('medications/' + username).once('value');
            const medications = [];
            
            snapshot.forEach(childSnapshot => {
                const medication = childSnapshot.val();
                medication.id = childSnapshot.key;
                medications.push(medication);
            });
            
            return medications;
        } catch (error) {
            console.error('Error getting medications:', error);
            return [];
        }
    }

    async deleteMedication(username, medicationId) {
        try {
            await this.db.ref(`medications/${username}/${medicationId}`).remove();
            return true;
        } catch (error) {
            console.error('Error deleting medication:', error);
            throw error;
        }
    }

    // ===== تحديث جرعة معينة =====
    async updateDoseStatus(username, medicationId, doseId, taken, note = '') {
        try {
            const dosePath = `medications/${username}/${medicationId}/doses/${doseId}`;
            const updates = {
                taken: taken,
                takenTime: taken ? new Date().toISOString() : null
            };
            
            if (note) {
                updates.note = note;
            }
            
            await this.db.ref(dosePath).update(updates);
            return true;
        } catch (error) {
            console.error('Error updating dose:', error);
            throw error;
        }
    }

    // ===== الاستماع للتحديثات في الوقت الحقيقي =====
    listenToMedications(username, callback) {
        const ref = this.db.ref('medications/' + username);
        
        ref.on('value', (snapshot) => {
            const medications = [];
            snapshot.forEach(childSnapshot => {
                const medication = childSnapshot.val();
                medication.id = childSnapshot.key;
                medications.push(medication);
            });
            callback(medications);
        });

        return () => ref.off();
    }
}

// جعل الكلاس متاحًا عالميًا
window.FirebaseDB = FirebaseDB;
