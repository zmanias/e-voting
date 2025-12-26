/* script.js - VERSI LENGKAP (DATA DETAIL) */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, get, child } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// KONFIGURASI FIREBASE ANDA
const firebaseConfig = {
  apiKey: "AIzaSyDbcPdFbHbOMTJQ5zYzV5ICuoVLg0cczW0",
  authDomain: "database-987bf.firebaseapp.com",
  databaseURL: "https://database-987bf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "database-987bf",
  storageBucket: "database-987bf.firebasestorage.app",
  messagingSenderId: "40108859176",
  appId: "1:40108859176:web:10d504a191f19cc68b3a1d",
  measurementId: "G-MKH992YEXR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbNims = ref(db, 'nims');
const dbVotes = ref(db, 'votes');

// --- FUNGSI GLOBAL ---

window.checkSession = () => {
    if (!sessionStorage.getItem('isAdminLoggedIn')) {
        alert("⛔ Akses Ditolak! Login dulu.");
        window.location.href = 'index.html';
    }
};

window.loginAdmin = (password) => {
    if (password === 'admin123') { 
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        return true;
    }
    return false;
};

window.logout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'index.html';
};

window.resetAllData = () => {
    if(confirm("Yakin hapus SEMUA data dan reset ke 0?")) {
        set(ref(db, 'nims'), null);
        
        const initialVotes = {};
        const labels = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
        for(let i=1; i<=8; i++) {
            let code = i < 10 ? "0" + i : "" + i;
            initialVotes[code] = { count: 0, name: "No. Urut " + labels[i-1] };
        }
        set(ref(db, 'votes'), initialVotes);
        alert("Database Berhasil Direset!");
    }
};

// --- FUNGSI KELOLA NIM (UPDATE: MENERIMA KAMPUS & JABATAN) ---
window.addNim = (nim, nama, kampus, jabatan) => {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `nims/${nim}`)).then((snapshot) => {
        if (snapshot.exists()) {
            alert("NIM Sudah Terdaftar!");
        } else {
            // SIMPAN 4 DATA INI KE DATABASE
            set(ref(db, 'nims/' + nim), {
                nim: nim,
                nama: nama,
                kampus: kampus,   // Data Baru
                jabatan: jabatan, // Data Baru
                voted: false,
                pilihan: null
            });
            alert("Berhasil tambah data!");
        }
    });
};

window.deleteNim = (nim) => {
    if(confirm(`Hapus NIM ${nim}?`)) {
        set(ref(db, 'nims/' + nim), null);
    }
};

window.submitVote = (nimInput, candidateCode) => {
    const userRef = ref(db, 'nims/' + nimInput);
    
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (userData.voted) {
                alert(`⚠️ Halo ${userData.nama}, Anda sudah memilih sebelumnya!`);
            } else {
                const voteRef = ref(db, `votes/${candidateCode}/count`);
                update(userRef, { voted: true, pilihan: candidateCode });
                
                get(voteRef).then((voteSnap) => {
                    let currentCount = voteSnap.val() || 0;
                    set(voteRef, currentCount + 1);
                    alert(`✅ Sukses! Terima kasih ${userData.nama}.`);
                    
                    if(document.getElementById('nimInput')) document.getElementById('nimInput').value = '';
                    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
                });
            }
        } else {
            alert("⛔ NIM tidak terdaftar di sistem online!");
        }
    }).catch((error) => {
        console.error(error);
        alert("Gagal koneksi internet.");
    });
};

export function listenToData(callback) {
    onValue(dbNims, (snapshot) => {
        const nimsData = snapshot.val() || {}; 
        onValue(dbVotes, (snapVote) => {
            const votesData = snapVote.val() || {};
            const nimsArray = Object.keys(nimsData).map(key => nimsData[key]);
            callback(nimsArray, votesData);
        });
    });
}
