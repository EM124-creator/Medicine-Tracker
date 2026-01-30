// firebase-db.js - مبسط بدون كلاس
if (typeof window.FirebaseDB === 'undefined') {
    window.FirebaseDB = {
        db: null,
        auth: null,
        
        init: function() {
            if (typeof firebase !== 'undefined') {
                this.db = firebase.database();
                this.auth = firebase.auth();
                console.log('FirebaseDB initialized');
            }
        },
        
        // ===== إدارة المستخدمين =====
        saveUser: async function(username, userData) {
            try {
                await this.db.ref('users/' + username).set(userData);
                return true;
            } catch (error) {
                console.error('Error saving user:', error);
                return false;
            }
        },
        
        getUser: async function(username) {
            try {
                const snapshot = await this.db.ref('users/' + username).once('value');
                return snapshot.val();
            } catch (error) {
                console.error('Error getting user:', error);
                return null;
            }
        },
        
        getAllUsers: async function() {
            try {
                const snapshot = await this.db.ref('users').once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting users:', error);
                return {};
            }
        },
        
        deleteUser: async function(username) {
            try {
                await this.db.ref('users/' + username).remove();
                await this.db.ref('medications/' + username).remove();
                return true;
            } catch (error) {
                console.error('Error deleting user:', error);
                return false;
            }
        },
        
        // ===== إدارة الأدوية =====
        saveMedication: async function(username, medication) {
            try {
                const medRef = this.db.ref('medications/' + username).push();
                medication.id = medRef.key;
                await medRef.set(medication);
                return medication;
            } catch (error) {
                console.error('Error saving medication:', error);
                throw error;
            }
        },
        
        updateMedication: async function(username, medicationId, medication) {
            try {
                await this.db.ref(`medications/${username}/${medicationId}`).update(medication);
                return true;
            } catch (error) {
                console.error('Error updating medication:', error);
                throw error;
            }
        },
        
        getUserMedications: async function(username) {
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
        },
        
        deleteMedication: async function(username, medicationId) {
            try {
                await this.db.ref(`medications/${username}/${medicationId}`).remove();
                return true;
            } catch (error) {
                console.error('Error deleting medication:', error);
                throw error;
            }
        }
    };
    
    // تهيئة قاعدة البيانات عند تحميل Firebase
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        window.FirebaseDB.init();
    } else {
        // انتظر حتى يتم تحميل Firebase
        const checkFirebase = setInterval(() => {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                window.FirebaseDB.init();
                clearInterval(checkFirebase);
            }
        }, 100);
    }
}
