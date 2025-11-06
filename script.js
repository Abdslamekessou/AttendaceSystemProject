const defaultStudents = [
  { id: "101", lastName: "Kessouri", firstName: "Abdessalem", email: "a.kessouri@alpine.edu", course: "ISIL" },
  { id: "102", lastName: "Kayouche", firstName: "Samy", email: "s.kayouche@alpine.edu", course: "ISIL" },
  { id: "103", lastName: "Smith", firstName: "John", email: "j.smith@alpine.edu", course: "CS" },
  { id: "104", lastName: "Johnson", firstName: "Emily", email: "e.johnson@alpine.edu", course: "CS" }
];

// Store attendance data in localStorage
function getAttendanceData() {
  const stored = localStorage.getItem("attendanceData");
  return stored ? JSON.parse(stored) : {};
}

function saveAttendanceData(data) {
  localStorage.setItem("attendanceData", JSON.stringify(data));
}

function getStudents() {
  const stored = localStorage.getItem("students");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("students", JSON.stringify(defaultStudents));
  return defaultStudents;
}

function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

// jQuery document ready
$(document).ready(function() {
  const tableBody = $("#StudentTable tbody");
  const form = $("#studentForm");
  const showReportBtn = $("#showReportBtn");
  const highlightExcellentBtn = $("#highlightExcellentBtn");
  const resetColorsBtn = $("#resetColorsBtn");

  if (tableBody.length) {
    const students = getStudents();
    const attendanceData = getAttendanceData();
    
    students.forEach(s => addStudentToTable(s, attendanceData));
    updateAttendanceData();
    
    // Add jQuery hover effects
    addJQueryEffects();
    
    if (showReportBtn.length) {
      showReportBtn.on("click", generateReport);
    }

    if (highlightExcellentBtn.length) {
      highlightExcellentBtn.on("click", highlightExcellentStudents);
    }

    if (resetColorsBtn.length) {
      resetColorsBtn.on("click", resetRowColors);
    }
  }

  if (form.length) {
    form.on("submit", function(e) {
      e.preventDefault();

      $(".error").hide();

      const studentId = $("#studentId").val().trim();
      const lastName = $("#lastName").val().trim();
      const firstName = $("#firstName").val().trim();
      const email = $("#email").val().trim();
      const course = $("#course").val().trim();

      let isValid = true;

      if (!/^\d+$/.test(studentId)) {
        $("#studentIdError").show();
        isValid = false;
      }
      if (!/^[A-Za-z\s]+$/.test(lastName)) {
        $("#lastNameError").show();
        isValid = false;
      }
      if (!/^[A-Za-z\s]+$/.test(firstName)) {
        $("#firstNameError").show();
        isValid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $("#emailError").show();
        isValid = false;
      }

      if (!isValid) return;

      const students = getStudents();
      // Check if student ID already exists
      if (students.some(s => s.id === studentId)) {
        alert("Student ID already exists!");
        return;
      }
      
      students.push({ id: studentId, lastName, firstName, email, course });
      saveStudents(students);

      alert("Student added successfully!");
      form[0].reset();
      window.location.href = "index.html";
    });
  }
});

function addStudentToTable(student, attendanceData = {}) {
  const tableBody = $("#StudentTable tbody");
  const newRow = $("<tr></tr>");

  newRow.html(`
    <td>${student.id}</td>
    <td class="student-name clickable-name">${student.lastName}</td>
    <td class="student-name clickable-name">${student.firstName}</td>
    <td>${student.course}</td>
  `);

  // Get attendance data for this student
  const studentAttendance = attendanceData[student.id] || { sessions: {}, participation: {} };

  // Create session checkboxes
  for (let i = 1; i <= 6; i++) {
    const cell = $("<td></td>", {
      class: "attendance-cell"
    });
    const checkbox = $("<input>", {
      type: "checkbox",
      class: "attendance",
      "data-session": `S${i}`,
      "data-student-id": student.id
    });
    checkbox.prop("checked", studentAttendance.sessions[`S${i}`] || false);
    cell.append(checkbox);
    newRow.append(cell);
  }

  // Create participation checkboxes
  for (let i = 1; i <= 6; i++) {
    const cell = $("<td></td>", {
      class: "participation-cell"
    });
    const checkbox = $("<input>", {
      type: "checkbox",
      class: "participation",
      "data-session": `P${i}`,
      "data-student-id": student.id
    });
    checkbox.prop("checked", studentAttendance.participation[`P${i}`] || false);
    cell.append(checkbox);
    newRow.append(cell);
  }

  const messageCell = $("<td></td>", {
    class: "message",
    "data-student-id": student.id
  });
  newRow.append(messageCell);
  tableBody.append(newRow);
}

// jQuery effects and event handlers
function addJQueryEffects() {
  // 1. Highlight row on mouse enter
  $("#StudentTable tbody tr").on("mouseenter", function() {
    $(this).addClass("row-highlight");
  });

  // 2. Remove highlight on mouse leave
  $("#StudentTable tbody tr").on("mouseleave", function() {
    $(this).removeClass("row-highlight");
  });

  // 3. Show student info ONLY when clicking on Last Name or First Name
  $(document).on("click", ".clickable-name", function(e) {
    e.stopPropagation(); // Prevent event from bubbling up to the row
    
    const $nameCell = $(this);
    const $row = $nameCell.closest("tr");
    const studentId = $row.find("td:first").text();
    const lastName = $row.find("td:nth-child(2)").text();
    const firstName = $row.find("td:nth-child(3)").text();
    const course = $row.find("td:nth-child(4)").text();
    
    // Count absences
    const absences = $row.find(".attendance:not(:checked)").length;
    
    // Show message box with student info
    showStudentInfo(firstName, lastName, absences, studentId, course);
  });

  // 4. Show student info when clicking on attendance/participation checkboxes
  $(document).on("click", ".attendance, .participation", function(e) {
    e.stopPropagation(); // Prevent event from bubbling up to the row
    
    const $checkbox = $(this);
    const $row = $checkbox.closest("tr");
    const studentId = $row.find("td:first").text();
    const lastName = $row.find("td:nth-child(2)").text();
    const firstName = $row.find("td:nth-child(3)").text();
    const course = $row.find("td:nth-child(4)").text();
    
    // Count absences
    const absences = $row.find(".attendance:not(:checked)").length;
    
    // Show message box with student info
    showStudentInfo(firstName, lastName, absences, studentId, course);
  });

  // REMOVED: The problematic row click handler that was causing unwanted student info displays
}

// Highlight Excellent Students function
function highlightExcellentStudents() {
  // Remove any existing highlights first
  resetRowColors();
  
  // Find all students with fewer than 3 absences
  const excellentStudents = $("#StudentTable tbody tr").filter(function() {
    const absences = $(this).find(".attendance:not(:checked)").length;
    return absences < 3;
  });

  if (excellentStudents.length === 0) {
    alert("No excellent students found! Excellent students have fewer than 3 absences.");
    return;
  }

  // Animate the excellent students
  excellentStudents.each(function(index) {
    const $row = $(this);
    
    // Add excellent student class
    $row.addClass("excellent-student");
    
    // Staggered animation with delay
    setTimeout(() => {
      $row.addClass("excellent-pulse");
      
      // Add glow effect
      $row.addClass("glow-effect");
      
      // Fade in animation
      $row.hide().fadeIn(1000);
      
      // Color transition animation
      $row.animate({
        backgroundColor: "#c8e6c9"
      }, 1000);
      
    }, index * 200); // Stagger the animations
  });

  // Show success message
  showNotification(`Highlighted ${excellentStudents.length} excellent students!`, "success");
}

// Reset row colors function
function resetRowColors() {
  $("#StudentTable tbody tr").each(function() {
    const $row = $(this);
    
    // Remove all highlight classes
    $row.removeClass("excellent-student excellent-pulse glow-effect");
    
    // Reset background color with animation
    $row.animate({
      backgroundColor: "white"
    }, 500);
    
    // Reset any inline styles
    $row.css({
      "background": "",
      "border-left": "",
      "box-shadow": "",
      "transform": ""
    });
  });

  // Re-apply the original attendance-based classes
  updateAttendanceData();
  
  // Show reset message
  showNotification("All row colors have been reset!", "info");
}

// Show notification function
function showNotification(message, type) {
  const notification = $("<div>", {
    class: `notification ${type}`,
    css: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "1rem 1.5rem",
      borderRadius: "6px",
      color: "white",
      fontWeight: "600",
      zIndex: "1001",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease"
    }
  });

  if (type === "success") {
    notification.css("background", "linear-gradient(135deg, #4caf50, #45a049)");
  } else if (type === "info") {
    notification.css("background", "linear-gradient(135deg, #2196f3, #1976d2)");
  }

  notification.text(message);
  $("body").append(notification);

  // Animate in
  setTimeout(() => {
    notification.css("transform", "translateX(0)");
  }, 100);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.css("transform", "translateX(100%)");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function showStudentInfo(firstName, lastName, absences, studentId, course) {
  // Create a custom modal
  const modal = $("<div>", {
    class: "student-modal"
  });
  
  const modalContent = $("<div>", {
    class: "modal-content"
  });
  
  modalContent.html(`
    <h3>Student Information</h3>
    <p><strong>Student ID:</strong> ${studentId}</p>
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Absences:</strong> ${absences} out of 6 sessions</p>
    <p><strong>Attendance Rate:</strong> ${Math.round(((6 - absences) / 6) * 100)}%</p>
    <p><strong>Status:</strong> ${absences < 3 ? "🎉 Excellent (Fewer than 3 absences)" : "⚠️ Needs Improvement"}</p>
    <button id="closeModal">Close</button>
  `);
  
  modal.append(modalContent);
  $("body").append(modal);
  
  // Close modal when close button is clicked or when clicking outside
  $("#closeModal").on("click", function() {
    modal.remove();
  });
  
  modal.on("click", function(e) {
    if (e.target === modal[0]) {
      modal.remove();
    }
  });
}

function updateAttendanceData() {
  const rows = $("#StudentTable tbody tr");
  const attendanceData = getAttendanceData();
  
  rows.each(function() {
    const row = $(this);
    const studentId = row.find('td:first').text();
    const attendance = row.find(".attendance");
    const participation = row.find(".participation");
    const messageCell = row.find(".message");

    // Update stored data
    if (!attendanceData[studentId]) {
      attendanceData[studentId] = { sessions: {}, participation: {} };
    }

    let absences = 0;
    let participations = 0;

    attendance.each(function(index) {
      const session = `S${index + 1}`;
      const isChecked = $(this).is(":checked");
      attendanceData[studentId].sessions[session] = isChecked;
      if (!isChecked) absences++;
    });

    participation.each(function(index) {
      const session = `P${index + 1}`;
      const isChecked = $(this).is(":checked");
      attendanceData[studentId].participation[session] = isChecked;
      if (isChecked) participations++;
    });

    // Save updated data
    saveAttendanceData(attendanceData);

    // Update row styling
    row.removeClass("few-absences medium-absences many-absences");
    if (absences < 3) row.addClass("few-absences");
    else if (absences <= 4) row.addClass("medium-absences");
    else row.addClass("many-absences");

    // Update message
    let message = "";
    if (absences < 3 && participations >= 4) message = "Good attendance - Excellent participation";
    else if (absences < 3) message = "Good attendance - You need to participate more";
    else if (absences <= 4 && participations >= 3) message = "Warning - attendance low - Good participation";
    else if (absences <= 4) message = "Warning - attendance low - You need to participate more";
    else if (participations >= 3) message = "Excluded - too many absences - Good participation";
    else message = "Excluded - too many absences - You need to participate more";

    messageCell.text(message);
  });
}

function generateReport() {
  const students = getStudents();
  const attendanceData = getAttendanceData();
  const reportResults = $('#reportResults');
  
  if (!reportResults.length) return;

  const totalStudents = students.length;
  let presentStudents = 0;
  let participatingStudents = 0;
  let excellentStudents = 0;

  students.forEach(student => {
    const studentData = attendanceData[student.id];
    
    if (studentData) {
      // Check if student attended at least one session
      const hasAttendance = Object.values(studentData.sessions).some(attended => attended);
      // Check if student participated in at least one session
      const hasParticipation = Object.values(studentData.participation).some(participated => participated);
      // Count excellent students (fewer than 3 absences)
      const absences = Object.values(studentData.sessions).filter(attended => !attended).length;
      if (absences < 3) excellentStudents++;
      
      if (hasAttendance) presentStudents++;
      if (hasParticipation) participatingStudents++;
    }
  });

  reportResults.html(`
    <h3>Attendance Report</h3>
    <div class="report-stats">
      <div class="stat-card">
        <div class="stat-label">Total Students</div>
        <div class="stat-number">${totalStudents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Present Students</div>
        <div class="stat-number">${presentStudents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Participating Students</div>
        <div class="stat-number">${participatingStudents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Excellent Students</div>
        <div class="stat-number">${excellentStudents}</div>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="reportChart" width="400" height="200"></canvas>
    </div>
  `);
  
  reportResults.show();
  
  // Create chart
  const ctx = document.getElementById('reportChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Students', 'Present Students', 'Participating Students', 'Excellent Students'],
      datasets: [{
        label: 'Attendance Statistics',
        data: [totalStudents, presentStudents, participatingStudents, excellentStudents],
        backgroundColor: [
          '#6a1b9a',
          '#4caf50',
          '#2196f3',
          '#ff9800'
        ],
        borderColor: [
          '#4a148c',
          '#388e3c',
          '#1976d2',
          '#f57c00'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Event listener for checkbox changes using jQuery
$(document).on("change", ".attendance, .participation", function() {
  updateAttendanceData();
});
