// firebase-db.js
class FirebaseDB {
    constructor() {
        this.db = firebase.database();
        this.auth = firebase.auth();
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
            // حذف المستخدم وأدويته
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

    // ===== إعدادات النظام =====
    async saveSettings(username, settings) {
        try {
            await this.db.ref('settings/' + username).set(settings);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }

    async getSettings(username) {
        try {
            const snapshot = await this.db.ref('settings/' + username).once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    // ===== النسخ الاحتياطي والاستعادة =====
    async backupData(username) {
        try {
            const [medications, settings] = await Promise.all([
                this.getUserMedications(username),
                this.getSettings(username)
            ]);
            
            return {
                medications,
                settings,
                backupTime: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error backing up data:', error);
            throw error;
        }
    }

    async restoreData(username, backupData) {
        try {
            // استعادة الأدوية
            if (backupData.medications) {
                await this.db.ref('medications/' + username).remove();
                
                for (const medication of backupData.medications) {
                    await this.saveMedication(username, medication);
                }
            }
            
            // استعادة الإعدادات
            if (backupData.settings) {
                await this.saveSettings(username, backupData.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Error restoring data:', error);
            throw error;
        }
    }

    // ===== الإحصائيات =====
    async getUserStatistics(username) {
        try {
            const medications = await this.getUserMedications(username);
            let totalDoses = 0;
            let takenDoses = 0;
            let missedDoses = 0;
            const now = new Date();

            medications.forEach(med => {
                med.doses.forEach(dose => {
                    totalDoses++;
                    const doseTime = new Date(dose.dateTime);
                    
                    if (dose.taken) {
                        takenDoses++;
                    } else if (doseTime < now) {
                        missedDoses++;
                    }
                });
            });

            const upcomingDoses = totalDoses - takenDoses - missedDoses;
            const adherence = (takenDoses + missedDoses) > 0 ? 
                Math.round((takenDoses / (takenDoses + missedDoses)) * 100) : 0;

            return {
                totalDoses,
                takenDoses,
                missedDoses,
                upcomingDoses,
                adherence,
                totalMedications: medications.length
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                totalDoses: 0,
                takenDoses: 0,
                missedDoses: 0,
                upcomingDoses: 0,
                adherence: 0,
                totalMedications: 0
            };
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

        // إرجاع دالة لإلغاء الاستماع
        return () => ref.off();
    }

    listenToUserData(username, callback) {
        const userRef = this.db.ref('users/' + username);
        const medsRef = this.db.ref('medications/' + username);

        const handleUpdate = async () => {
            const [userSnapshot, medsSnapshot] = await Promise.all([
                userRef.once('value'),
                medsRef.once('value')
            ]);

            const userData = userSnapshot.val();
            const medications = [];
            
            medsSnapshot.forEach(childSnapshot => {
                const medication = childSnapshot.val();
                medication.id = childSnapshot.key;
                medications.push(medication);
            });

            callback({
                user: userData,
                medications: medications
            });
        };

        userRef.on('value', handleUpdate);
        medsRef.on('value', handleUpdate);

        // إرجاع دالة لإلغاء الاستماع
        return () => {
            userRef.off('value', handleUpdate);
            medsRef.off('value', handleUpdate);
        };
    }
}

// جعل الكلاس متاحًا عالميًا
window.FirebaseDB = FirebaseDB;