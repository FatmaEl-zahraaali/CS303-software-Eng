

let attendanceChartInstance = null;
let questionsChartInstance = null;
let currentData = null;
let studentsAttendanceStats = {};

// عرض التاريخ الحالي
function displayCurrentDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentDateDisplay').innerText = formattedDate;
}

// تحديث الواجهة بالبيانات
function updateDashboard(data) {
    document.getElementById('totalStudents').innerText = data.totalStudents;
    document.getElementById('attendanceCount').innerText = data.attendanceCount;
    document.getElementById('totalQuestions').innerText = data.totalQuestions;
    document.getElementById('passRate').innerText = data.passRate + '%';
    
    updateAttendanceChart(data.weeklyAttendance);
    updateQuestionsChart(data.questionsByType);
    updateAttendanceTable(data.recentAttendance);
    
    studentsAttendanceStats = data.studentsStats || {};
    currentData = data;
    

    if (data.source) {
        console.log(`📊 Data source: ${data.source}`);
    }
}

// تحديث رسم الحضور
function updateAttendanceChart(weekly) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if(attendanceChartInstance) attendanceChartInstance.destroy();
    attendanceChartInstance = new Chart(ctx, {
        type: 'bar', 
        data: { 
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
            datasets: [{ 
                label: 'Attending Students', 
                data: weekly, 
                backgroundColor: '#2c7da0', 
                borderRadius: 12 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true, 
            plugins: { 
                legend: { position: 'top', labels: { font: { size: 11 } } },
                tooltip: { callbacks: { label: (ctx) => `${ctx.raw} students` } }
            } 
        }
    });
}

// تحديث رسم الأسئلة
function updateQuestionsChart(questionsByType) {
    const ctx = document.getElementById('questionsChart').getContext('2d');
    if(questionsChartInstance) questionsChartInstance.destroy();
    questionsChartInstance = new Chart(ctx, {
        type: 'pie', 
        data: { 
            labels: questionsByType.map(q=>q.label), 
            datasets: [{ 
                data: questionsByType.map(q=>q.count), 
                backgroundColor: ['#2c7da0','#61a5c2','#89c2d9'] 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: true, 
            plugins: { 
                legend: { position: 'bottom', labels: { font: { size: 11 } } } 
            } 
        }
    });
}

// تحديث جدول الحضور
function updateAttendanceTable(records) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    if(!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No attendance records found</td></tr>';
        return;
    }
    records.forEach(r => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = r.name;
        row.insertCell(1).innerText = r.studentId;
        row.insertCell(2).innerText = r.time;
        let statusHtml = '';
        if(r.status === 'present') statusHtml = '<span class="status-present">Present</span>';
        else if(r.status === 'late') statusHtml = '<span class="status-late">Late</span>';
        else statusHtml = '<span class="status-absent">Absent</span>';
        row.insertCell(3).innerHTML = statusHtml;
        row.insertCell(4).innerText = r.date;
        row.onclick = () => showStudentAttendanceDetails(r.name, r.studentId);
    });
}

// عرض تفاصيل الطالب
function showStudentAttendanceDetails(name, studentId) {
    const modal = document.getElementById('detailsModal');
    document.getElementById('modalTitle').innerHTML = '<i class="ti ti-user-circle"></i> Student Attendance Details';
    
    let stats = studentsAttendanceStats[studentId];
    if (!stats) {
        stats = { present: 18, late: 3, absent: 4, totalDays: 25, attendanceRate: 84 };
    }
    
    const attendanceRate = stats.attendanceRate || Math.round((stats.present / stats.totalDays) * 100);
    
    document.getElementById('modalBody').innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 25px;">
            <div style="width: 65px; height: 65px; background: linear-gradient(135deg, #2c7da0, #1e5a7a); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="ti ti-user" style="font-size: 2rem; color: white;"></i>
            </div>
            <div>
                <h2 style="margin: 0; color: #1e3a5f;">${name}</h2>
                <p style="color: #64748b; margin: 5px 0 0;">ID: ${studentId}</p>
                <p style="color: #2c7da0; margin: 5px 0 0;">${name.toLowerCase().replace(' ', '.')}@university.edu</p>
            </div>
        </div>
        
        <div class="stats-cards">
            <div class="stat-card" style="background: linear-gradient(135deg, #e6f7ec, #d1fae5);">
                <i class="ti ti-user-check" style="color: #10b981;"></i>
                <div class="stat-value" style="color: #10b981;">${stats.present || 0}</div>
                <div class="stat-label">Present Days</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #fff7e6, #fef3c7);">
                <i class="ti ti-clock" style="color: #f59e0b;"></i>
                <div class="stat-value" style="color: #f59e0b;">${stats.late || 0}</div>
                <div class="stat-label">Late Days</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #fee2e2, #fecaca);">
                <i class="ti ti-user-x" style="color: #ef4444;"></i>
                <div class="stat-value" style="color: #ef4444;">${stats.absent || 0}</div>
                <div class="stat-label">Absent Days</div>
            </div>
        </div>
        
        <div style="background: white; border-radius: 20px; padding: 20px; border: 1px solid #eef2f8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 700;">Attendance Rate</span>
                <span style="font-weight: 800; color: #2c7da0;">${attendanceRate}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${attendanceRate}%;"></div>
            </div>
            <div class="attendance-details">
                <div class="attendance-row">
                    <span>Total School Days</span>
                    <span style="font-weight: 700;">${stats.totalDays || 25}</span>
                </div>
                <div class="attendance-row">
                    <span>Total Present + Late</span>
                    <span style="font-weight: 700; color: #10b981;">${(stats.present || 0) + (stats.late || 0)}</span>
                </div>
                <div class="attendance-row">
                    <span>Total Absent</span>
                    <span style="font-weight: 700; color: #ef4444;">${stats.absent || 0}</span>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// تحميل البيانات من الخدمة
async function loadDashboard() {
    let subject = document.getElementById('subjectSelect').value;
    let month = document.getElementById('monthSelect').value;
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    try {
        const result = await window.fetchDashboardData(subject, month);
        if (result.success) {
            updateDashboard(result.data);
            if (result.source === 'mock (fallback)') {
                showError('Firebase connection failed. Showing demo data.');
            }
        } else {
            showError('Failed to load data');
        }
    } catch(error) {
        console.error('Error:', error);
        showError('Error loading data: ' + error.message);
    }
    
    document.getElementById('loadingOverlay').style.display = 'none';
}



function showError(msg) {
    const toast = document.createElement('div');
    toast.className = 'error-message';
    toast.innerHTML = `<i class="ti ti-alert-triangle"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function closeModal() { 
    document.getElementById('detailsModal').style.display = 'none'; 
}

function showDetails(type, data) {
    const modal = document.getElementById('detailsModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    if(type === 'students') {
        title.innerHTML = '<i class="ti ti-users-group"></i> Total Students';
        body.innerHTML = `
            <div style="background: #f1f5f9; border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <i class="ti ti-users" style="font-size: 2.5rem; color: #2c7da0;"></i>
                <p style="font-size: 40px; font-weight: 800; margin: 8px 0 0;">${data.totalStudents}</p>
                <p style="color: #475569;">Total Enrolled Students</p>
            </div>
            <div style="background: #f8fafc; border-radius: 20px; padding: 16px;">
                <p style="font-weight: 700; margin-bottom: 12px;"><i class="ti ti-user-plus"></i> Last Registered Students</p>
                <div class="students-list" style="margin-top: 0;">
                    ${data.lastStudents.map(s => `<div class="student-item"><span class="student-name">${s.name}</span><span class="student-id">ID: ${s.id}</span></div>`).join('')}
                </div>
            </div>
        `;
    }
    else if(type === 'attendance') {
        title.innerHTML = '<i class="ti ti-calendar-check"></i> Attendance Insights';
        body.innerHTML = `
            <div class="stats-cards">
                <div class="stat-card" style="background: linear-gradient(135deg, #e6f7ec, #d1fae5);">
                    <i class="ti ti-user-check" style="color: #10b981;"></i>
                    <div class="stat-value" style="color: #10b981;">${data.attendanceCount}</div>
                    <div class="stat-label">Present/Late</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #fee2e2, #fecaca);">
                    <i class="ti ti-user-x" style="color: #ef4444;"></i>
                    <div class="stat-value" style="color: #ef4444;">${data.absentStudents.length}</div>
                    <div class="stat-label">Absent</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #e0f2fe, #bae6fd);">
                    <i class="ti ti-chart-line" style="color: #0284c7;"></i>
                    <div class="stat-value" style="color: #0284c7;">${Math.round((data.attendanceCount/data.totalStudents)*100)}%</div>
                    <div class="stat-label">Rate</div>
                </div>
            </div>
        `;
    }
    else if(type === 'questions') {
        title.innerHTML = '<i class="ti ti-database"></i> Question Bank';
        body.innerHTML = `
            <div style="background: #f1f5f9; border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <i class="ti ti-article" style="font-size: 2.5rem; color: #2c7da0;"></i>
                <p style="font-size: 40px; font-weight: 800; margin: 6px 0 0;">${data.totalQuestions}</p>
                <p style="color: #475569;">Total Questions</p>
            </div>
            <p style="font-weight: 700; margin-bottom: 12px;"><i class="ti ti-chart-pie"></i> By Type:</p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${data.questionsByType.map(q => `
                    <div style="flex: 1; background: #f8fafc; border-radius: 16px; padding: 12px; text-align: center;">
                        <i class="ti ti-${q.type === 'mcq' ? 'list-numbers' : (q.type === 'true_false' ? 'selector' : 'write')}" style="font-size: 1.4rem; color: #2c7da0;"></i>
                        <p style="font-size: 22px; font-weight: 700; margin: 6px 0 2px;">${q.count}</p>
                        <p style="font-size: 11px; color: #64748b;">${q.label}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    else if(type === 'passrate') {
        let passed = Math.round((data.passRate/100) * data.totalStudents);
        let failed = data.totalStudents - passed;
        let targetNext = data.passRate < 85 ? 88 : 92;
        
        title.innerHTML = '<i class="ti ti-chart-pie"></i> Pass Rate Analysis';
        body.innerHTML = `
            <div class="stats-cards">
                <div class="stat-card" style="background: linear-gradient(135deg, #e6f7ec, #d1fae5);">
                    <i class="ti ti-certificate" style="color: #10b981;"></i>
                    <div class="stat-value" style="color: #10b981;">${data.passRate}%</div>
                    <div class="stat-label">Pass Rate</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);">
                    <i class="ti ti-user-star" style="color: #3b82f6;"></i>
                    <div class="stat-value" style="color: #3b82f6;">${passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #fee2e2, #fecaca);">
                    <i class="ti ti-user-cancel" style="color: #ef4444;"></i>
                    <div class="stat-value" style="color: #ef4444;">${failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;">
                <i class="ti ti-target-arrow" style="font-size: 1.6rem; color: #d97706;"></i>
                <div>
                    <strong>Next Semester Target</strong><br>
                    <span style="font-size: 1.1rem; font-weight: 800; color: #b45309;">${targetNext}%</span>
                    <span style="font-size: 12px;"> ↑ ${targetNext - data.passRate}% goal</span>
                </div>
            </div>
        `;
    }
    modal.style.display = 'flex';
}

function showChartDetails(chartType, data) {
    const modal = document.getElementById('detailsModal');
    document.getElementById('modalTitle').innerHTML = '<i class="ti ti-chart-bar"></i> Full Analytics';
    if(chartType === 'attendance') {
        document.getElementById('modalBody').innerHTML = `
            <canvas id="fullDetailChart" style="height:260px;"></canvas>
            <div style="margin-top: 20px; background: #f0f9ff; border-radius: 16px; padding: 12px;">
                <i class="ti ti-info-circle"></i> Peak attendance: Week 4 (${data.weeklyAttendance[3]} students)
            </div>
        `;
        setTimeout(() => new Chart(document.getElementById('fullDetailChart'), { 
            type: 'line', 
            data: { 
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], 
                datasets: [{ 
                    label: 'Attendance', 
                    data: data.weeklyAttendance, 
                    borderColor: '#2c7da0', 
                    fill: true 
                }] 
            } 
        }), 50);
    } else {
        document.getElementById('modalBody').innerHTML = `<canvas id="fullDetailChart" style="height:260px;"></canvas>`;
        setTimeout(() => new Chart(document.getElementById('fullDetailChart'), { 
            type: 'bar', 
            data: { 
                labels: data.questionsByType.map(q=>q.label), 
                datasets: [{ 
                    label: 'Questions', 
                    data: data.questionsByType.map(q=>q.count), 
                    backgroundColor: '#61a5c2' 
                }] 
            } 
        }), 50);
    }
    modal.style.display = 'flex';
}

//  الطباعة
function printAbsentReport(month, monthName, subjectName, absentStudents, totalStudents) {
    const w = window.open('', '_blank');
    const absentCount = absentStudents.length;
    w.document.write(`<!DOCTYPE html><html><head><title>Absent Report</title><style>
        body{font-family:sans-serif;padding:40px}
        th{background:#2c7da0;color:white}
        td,th{border:1px solid #ddd;padding:10px}
        table{width:100%;border-collapse:collapse}
        .header{text-align:center;margin-bottom:30px}
        .info{display:flex;justify-content:space-between;background:#f0f4f8;padding:15px;margin-bottom:20px}
    </style></head><body>
        <div class="header"><h1>Absent Students Report</h1><p>${subjectName} - ${monthName}</p></div>
        <div class="info"><div>Total Students: ${totalStudents}</div><div>Absent: ${absentCount}</div><div>Rate: ${Math.round(((totalStudents-absentCount)/totalStudents)*100)}%</div></div>
        <h3>Absent Students List</h3>
        <table><thead><tr><th>#</th><th>Name</th><th>ID</th></tr></thead>
        <tbody>${absentStudents.map((s,i)=>`<tr><td>${i+1}</td><td>${s.name}</td><td>${s.id}</td></tr>`).join('')}</tbody>
        </table>
    </body></html>`);
    w.document.close();
    w.print();
}

function printMultiMonthReport(subjectName, totalStudents) {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Multi-Month Report</title><style>
        body{font-family:sans-serif;padding:40px}
        th{background:#2c7da0;color:white}
        td,th{border:1px solid #ddd;padding:10px}
        table{width:100%;border-collapse:collapse}
        .month-title{background:#e2e8f0;padding:10px;margin-top:20px}
    </style></head><body>
        <h1>Multi-Month Absent Report</h1><p>${subjectName} (Feb - Apr 2026)</p>
        <div class="month-title"><h3>February 2026</h3></div>
        <table><thead><tr><th>Name</th><th>ID</th></tr></thead><tbody>
            <tr><td>Omar Hossam</td><td>2024003</td></tr>
            <tr><td>Mariam Tarek</td><td>2024102</td></tr>
            <tr><td>Khaled Mohamed</td><td>2024150</td></tr>
            <tr><td>Nour Abdelrahman</td><td>2024103</td></tr>
        </tbody></table>
        <div class="month-title"><h3>March 2026</h3></div>
        <table><thead><tr><th>Name</th><th>ID</th></tr></thead><tbody>
            <tr><td>Laila Hassan</td><td>2024004</td></tr>
            <tr><td>Youssef Emad</td><td>2024108</td></tr>
            <tr><td>Khaled Mohamed</td><td>2024150</td></tr>
            <tr><td>Seif Eldin</td><td>2024105</td></tr>
        </tbody></table>
        <div class="month-title"><h3>April 2026</h3></div>
        <table><thead><tr><th>Name</th><th>ID</th></tr></thead><tbody>
            <tr><td>Khaled Mohamed</td><td>2024150</td></tr>
            <tr><td>Nour Abdelrahman</td><td>2024103</td></tr>
            <tr><td>Mariam Tarek</td><td>2024102</td></tr>
            <tr><td>Omar Hossam</td><td>2024003</td></tr>
        </tbody></table>
    </body></html>`);
    w.document.close();
    w.print();
}


document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => { 
    if(currentData) showDetails(c.getAttribute('data-card-type'), currentData); 
}));
document.querySelectorAll('.chart-box').forEach(c => c.addEventListener('click', () => { 
    if(currentData) showChartDetails(c.getAttribute('data-chart'), currentData); 
}));
document.getElementById('applyBtn').addEventListener('click', loadDashboard);
document.getElementById('subjectSelect').addEventListener('change', loadDashboard);
document.getElementById('monthSelect').addEventListener('change', loadDashboard);
document.getElementById('profileBtn').addEventListener('click', () => showError("Profile settings coming soon"));

document.getElementById('printSingleMonthBtn').addEventListener('click', () => {
    if(currentData) {
        printAbsentReport(
            document.getElementById('monthSelect').value,
            currentData.monthName,
            currentData.subjectName,
            currentData.absentStudents,
            currentData.totalStudents
        );
    } else {
        showError("Please load data first");
    }
});

document.getElementById('printMultiMonthBtn').addEventListener('click', () => {
    if(currentData) {
        printMultiMonthReport(currentData.subjectName, currentData.totalStudents);
    } else {
        showError("Please load data first");
    }
});

window.onclick = e => { if(e.target === document.getElementById('detailsModal')) closeModal(); };


displayCurrentDate();
loadDashboard();