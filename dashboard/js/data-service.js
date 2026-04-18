

// ============= البيانات الوهمية (Mock Data) =============
function getMockData(subject, month) {
    const subjectsData = {
        'CS303': { students: 124, questions: 158, passRate: 84, attendance: 98, weeklyAttendance: [88,92,95,98] },
        'CS202': { students: 108, questions: 135, passRate: 79, attendance: 85, weeklyAttendance: [76,80,82,85] },
        'CS309': { students: 97, questions: 118, passRate: 89, attendance: 90, weeklyAttendance: [82,86,88,90] }
    };
    const subjectData = subjectsData[subject] || subjectsData['CS303'];
    
    const monthNames = { 
        '2026-01':'January', '2026-02':'February', '2026-03':'March',
        '2026-04':'April', '2026-05':'May', '2026-06':'June'
    };
    
    const recentAttendance = [
        { name: 'Ali Hassan', studentId: '2024001', time: '08:30 AM', status: 'present', date: '2026-04-17' },
        { name: 'Sara Mahmoud', studentId: '2024002', time: '09:00 AM', status: 'late', date: '2026-04-17' },
        { name: 'Khaled Mohamed', studentId: '2024150', time: '--', status: 'absent', date: '2026-04-10' },
        { name: 'Nour Abdelrahman', studentId: '2024103', time: '08:45 AM', status: 'present', date: '2026-04-16' },
        { name: 'Omar Hossam', studentId: '2024003', time: '09:15 AM', status: 'late', date: '2026-04-16' },
        { name: 'Mariam Tarek', studentId: '2024102', time: '08:20 AM', status: 'present', date: '2026-04-15' },
        { name: 'Laila Hassan', studentId: '2024004', time: '08:50 AM', status: 'present', date: '2026-04-15' }
    ];
    
    const studentsStats = {
        '2024001': { present: 22, late: 2, absent: 1, totalDays: 25, attendanceRate: 88 },
        '2024002': { present: 18, late: 4, absent: 3, totalDays: 25, attendanceRate: 72 },
        '2024003': { present: 20, late: 3, absent: 2, totalDays: 25, attendanceRate: 80 },
        '2024004': { present: 23, late: 1, absent: 1, totalDays: 25, attendanceRate: 92 },
        '2024102': { present: 19, late: 3, absent: 3, totalDays: 25, attendanceRate: 76 },
        '2024103': { present: 21, late: 2, absent: 2, totalDays: 25, attendanceRate: 84 },
        '2024105': { present: 15, late: 4, absent: 6, totalDays: 25, attendanceRate: 60 },
        '2024108': { present: 17, late: 3, absent: 5, totalDays: 25, attendanceRate: 68 },
        '2024150': { present: 8, late: 2, absent: 15, totalDays: 25, attendanceRate: 32 }
    };
    
    const absentStudents = [
        { name: 'Khaled Mohamed', id: '2024150' },
        { name: 'Seif Eldin', id: '2024105' },
        { name: 'Rana Wael', id: '2024104' }
    ];
    
    const lastStudents = [
        { name: 'Ali Hassan', id: '2024001' },
        { name: 'Sara Mahmoud', id: '2024002' },
        { name: 'Omar Khaled', id: '2024003' },
        { name: 'Laila Ahmed', id: '2024004' }
    ];
    
    return {
        totalStudents: subjectData.students,
        attendanceCount: subjectData.attendance,
        totalQuestions: subjectData.questions,
        passRate: subjectData.passRate,
        weeklyAttendance: subjectData.weeklyAttendance,
        questionsByType: [
            { label: 'Hard', count: Math.floor(subjectData.questions * 0.58), type: 'hard' },
            { label: 'Medium', count: Math.floor(subjectData.questions * 0.26), type: 'medium' },
            { label: 'Essay', count: Math.floor(subjectData.questions * 0.16), type: 'essay' }
        ],
        recentAttendance: recentAttendance,
        absentStudents: absentStudents,
        lastStudents: lastStudents,
        studentsStats: studentsStats,
        subjectName: subject === 'CS303' ? 'Software Engineering (CS303)' : 
                    (subject === 'CS202' ? 'Data Structures (CS202)' : 'System Analysis (CS309)'),
        monthName: monthNames[month] || month
    };
}

// ============= جلب البيانات من Firebase =============
async function getFirebaseData(subject, month) {
    const db = window.db;
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    // 1. جلب عدد الطلاب
    const studentsSnap = await db.collection('students').get();
    const totalStudents = studentsSnap.size;
    
    // 2. جلب بيانات المادة
    const subjectDoc = await db.collection('subjects').doc(subject).get();
    const subjectData = subjectDoc.exists ? subjectDoc.data() : { 
        questions: 158, 
        passRate: 84, 
        weeklyAttendance: [88,92,95,98] 
    };
    
    // 3. جلب عدد الحضور للشهر
    const attendanceSnap = await db.collection('attendance')
        .where('subject', '==', subject)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .where('status', 'in', ['present', 'late'])
        .get();
    const attendanceCount = attendanceSnap.size;
    
    // 4. جلب توزيع الأسئلة
    const questionsSnap = await db.collection('questions')
        .where('subject', '==', subject)
        .get();
    
    const questionsByType = [];
    questionsSnap.forEach(doc => { 
        const q = doc.data(); 
        questionsByType.push({ 
            label: q.label, 
            count: q.count, 
            type: q.type 
        }); 
    });
    
    // 5. جلب أحدث سجلات الحضور
    const recentSnap = await db.collection('attendance')
        .where('subject', '==', subject)
        .orderBy('date', 'desc')
        .limit(7)
        .get();
    
    const recentAttendance = [];
    const studentsStatsTemp = {};
    
    for(const doc of recentSnap.docs) {
        const a = doc.data();
        let studentName = a.studentName || a.studentId;
        try {
            const studentDoc = await db.collection('students').doc(a.studentId).get();
            if(studentDoc.exists) studentName = studentDoc.data().name;
        } catch(e) {}
        recentAttendance.push({ 
            name: studentName, 
            studentId: a.studentId, 
            time: a.time, 
            status: a.status, 
            date: a.date 
        });
    }
    
    // 6. حساب إحصائيات الحضور لكل طالب
    const allAttendanceSnap = await db.collection('attendance')
        .where('subject', '==', subject)
        .get();
    
    allAttendanceSnap.forEach(doc => {
        const a = doc.data();
        if (!studentsStatsTemp[a.studentId]) {
            studentsStatsTemp[a.studentId] = { present: 0, late: 0, absent: 0, totalDays: 0 };
        }
        if (a.status === 'present') studentsStatsTemp[a.studentId].present++;
        else if (a.status === 'late') studentsStatsTemp[a.studentId].late++;
        else if (a.status === 'absent') studentsStatsTemp[a.studentId].absent++;
        studentsStatsTemp[a.studentId].totalDays++;
    });
    
    const studentsStats = {};
    for (const [id, stats] of Object.entries(studentsStatsTemp)) {
        const total = stats.present + stats.late + stats.absent;
        studentsStats[id] = {
            present: stats.present,
            late: stats.late,
            absent: stats.absent,
            totalDays: total,
            attendanceRate: Math.round(((stats.present + stats.late) / total) * 100)
        };
    }
    
    // 7. جلب قائمة الطلاب الغائبين في الشهر
    const absentSnap = await db.collection('attendance')
        .where('subject', '==', subject)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .where('status', '==', 'absent')
        .get();
    
    const absentStudents = [];
    for(const doc of absentSnap.docs) {
        const a = doc.data();
        let studentName = a.studentName || a.studentId;
        try {
            const studentDoc = await db.collection('students').doc(a.studentId).get();
            if(studentDoc.exists) studentName = studentDoc.data().name;
        } catch(e) {}
        absentStudents.push({ name: studentName, id: a.studentId });
    }
    
    // 8. جلب آخر الطلاب المسجلين
    const lastStudentsSnap = await db.collection('students')
        .orderBy('createdAt', 'desc')
        .limit(4)
        .get();
    
    const lastStudents = [];
    lastStudentsSnap.forEach(doc => { 
        const s = doc.data(); 
        lastStudents.push({ name: s.name, id: doc.id }); 
    });
    
    const monthNames = { 
        '2026-01':'January', '2026-02':'February', '2026-03':'March',
        '2026-04':'April', '2026-05':'May', '2026-06':'June' 
    };
    
    return {
        totalStudents: totalStudents,
        attendanceCount: attendanceCount,
        totalQuestions: subjectData.questions || 0,
        passRate: subjectData.passRate || 0,
        weeklyAttendance: subjectData.weeklyAttendance || [88,92,95,98],
        questionsByType: questionsByType.length ? questionsByType : [
            { label:'Hard', count:92, type:'hard' },
            { label:'Medium', count:41, type:'medium' },
            { label:'Essay', count:25, type:'essay' }
        ],
        recentAttendance: recentAttendance,
        absentStudents: absentStudents,
        lastStudents: lastStudents,
        studentsStats: studentsStats,
        subjectName: subject === 'CS303' ? 'Software Engineering (CS303)' : 
                    (subject === 'CS202' ? 'Data Structures (CS202)' : 'System Analysis  (CS309)'),
        monthName: monthNames[month] || month
    };
}


async function fetchDashboardData(subject, month) {
    if (window.USE_FIREBASE && window.isFirebaseReady) {
        try {
            const data = await getFirebaseData(subject, month);
            return { success: true, data: data, source: 'firebase' };
        } catch (error) {
            console.error('Firebase error:', error);
            
            const mockData = getMockData(subject, month);
            return { success: true, data: mockData, source: 'mock (fallback)', error: error.message };
        }
    } else {
        const mockData = getMockData(subject, month);
        return { success: true, data: mockData, source: 'mock' };
    }
}


window.fetchDashboardData = fetchDashboardData;
window.getMockData = getMockData;
window.getFirebaseData = getFirebaseData;
