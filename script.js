// Load students from database on page load
document.addEventListener('DOMContentLoaded', function() {
  loadStudentsFromDatabase();
  initializeJQueryFeatures(); 
  initializeSearchAndSort(); 
});

// Load students from database
function loadStudentsFromDatabase() {
  $.ajax({
    url: 'get_students.php',
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.success) {
        const tableBody = document.querySelector('#StudentTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        
        response.students.forEach(student => {
          addStudentToTable(student);
        });
        
        updateAttendanceData();
        initializeJQueryFeatures();
      } else {
        console.error('Failed to load students:', response.message);
      }
    },
    error: function(xhr, status, error) {
      console.error('Error loading students:', error);
    }
  });
}

function addStudentToTable(student) {
  const tableBody = document.querySelector('#StudentTable tbody');
  const newRow = document.createElement('tr');
  
  newRow.dataset.email = student.email;
  
  newRow.innerHTML = `
    <td>${student.id}</td>
    <td>${student.lastName}</td>
    <td>${student.firstName}</td>
    <td>${student.course}</td>
  `;
  
  // Add attendance checkboxes (S1-S6)
  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'attendance';
    checkbox.dataset.session = `S${i}`;
    checkbox.dataset.studentId = student.id;
    
    // Set checked state from database
    if (student.attendance && student.attendance[`S${i}`]) {
      checkbox.checked = true;
    }
    
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }

  // Add participation checkboxes (P1-P6)
  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'participation';
    checkbox.dataset.session = `P${i}`;
    checkbox.dataset.studentId = student.id;
    
    // Set checked state from database
    if (student.attendance && student.attendance[`P${i}`]) {
      checkbox.checked = true;
    }
    
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }
  
  // Add message cell
  const messageCell = document.createElement('td');
  messageCell.className = 'message';
  messageCell.dataset.studentId = student.id;
  newRow.appendChild(messageCell);
  
  tableBody.appendChild(newRow);
}

function updateAttendanceData() {
  const rows = document.querySelectorAll('#StudentTable tbody tr');
  
  rows.forEach(row => {
    const studentId = row.cells[0].textContent;
    const attendanceCheckboxes = row.querySelectorAll('.attendance');
    const participationCheckboxes = row.querySelectorAll('.participation');
    const messageCell = row.querySelector('.message');
    
    let absences = 0;
    let participations = 0;
    
    attendanceCheckboxes.forEach(checkbox => {
      if (!checkbox.checked) absences++;
    });
    
    participationCheckboxes.forEach(checkbox => {
      if (checkbox.checked) participations++;
    });
    
    // Remove previous classes
    row.classList.remove('few-absences', 'medium-absences', 'many-absences');
    
    if (absences < 3) {
      row.classList.add('few-absences');
    } else if (absences >= 3 && absences <= 4) {
      row.classList.add('medium-absences');
    } else if (absences >= 5) {
      row.classList.add('many-absences');
    }
    
    // Store data attributes
    row.dataset.absences = absences;
    row.dataset.participations = participations;
    
    // Update message
    let message = '';
    
    if (absences < 3 && participations >= 4) {
      message = 'Good attendance - Excellent participation';
    } else if (absences < 3 && participations < 4) {
      message = 'Good attendance - You need to participate more';
    } else if (absences >= 3 && absences <= 4 && participations >= 3) {
      message = 'Warning - attendance low - Good participation';
    } else if (absences >= 3 && absences <= 4 && participations < 3) {
      message = 'Warning - attendance low - You need to participate more';
    } else if (absences >= 5 && participations >= 3) {
      message = 'Excluded - too many absences - Good participation';
    } else if (absences >= 5 && participations < 3) {
      message = 'Excluded - too many absences - You need to participate more';
    }
    
    messageCell.textContent = message;
  });
}

// Form submission - Add student to database
document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  // Hide all errors
  document.querySelectorAll('.error').forEach(error => {
    error.style.display = 'none';
  });
  
  const studentId = document.getElementById("studentId").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();
  
  let isValid = true;
  
  // Validate Student ID
  if (studentId === '' || !/^\d+$/.test(studentId)) {
    document.getElementById("studentIdError").style.display = 'block';
    isValid = false;
  }
  
  // Validate Last Name
  if (!/^[A-Za-z\s]+$/.test(lastName)) {
    document.getElementById("lastNameError").style.display = 'block';
    isValid = false;
  }
  
  // Validate First Name
  if (!/^[A-Za-z\s]+$/.test(firstName)) {
    document.getElementById("firstNameError").style.display = 'block';
    isValid = false;
  }
  
  // Validate Email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").style.display = 'block';
    isValid = false;
  }
  
  // If valid, send to database
  if (isValid) {
    $.ajax({
      url: 'add_student.php',
      type: 'POST',
      data: {
        studentId: studentId,
        lastName: lastName,
        firstName: firstName,
        email: email,
        course: course
      },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          // Add student to table
          addStudentToTable(response.student);
          
          // Reset form
          document.getElementById("studentForm").reset();
          updateAttendanceData();
          
          // Show success message
          const successMsg = document.getElementById("successMessage");
          successMsg.style.display = 'block';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 3000);
          
          initializeJQueryFeatures();
        } else {
          alert('Error: ' + response.message);
        }
      },
      error: function(xhr, status, error) {
        alert('Error adding student: ' + error);
      }
    });
  }
});

// Save attendance changes to database
document.addEventListener('change', function(e) {
  if (e.target.classList.contains('attendance') || e.target.classList.contains('participation')) {
    const studentId = e.target.dataset.studentId;
    const sessionType = e.target.dataset.session;
    const isChecked = e.target.checked;
    
    // Save to database
    $.ajax({
      url: 'update_attendance.php',
      type: 'POST',
      data: {
        studentId: studentId,
        sessionType: sessionType,
        isChecked: isChecked
      },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          updateAttendanceData();
        } else {
          console.error('Failed to update attendance:', response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error('Error updating attendance:', error);
      }
    });
  }
});

// Report functionality
let reportChart = null;
document.getElementById('showReportBtn').addEventListener('click', function() {
  const reportSection = document.getElementById('reportSection');
  
  if (reportSection.style.display === 'none' || reportSection.style.display === '') {
    reportSection.style.display = 'block';
    generateReport();
  } else {
    reportSection.style.display = 'none';
  }
});

function generateReport() {
  const rows = document.querySelectorAll('#StudentTable tbody tr');
  let totalStudents = rows.length;
  let studentsPresent = 0;
  let studentsParticipated = 0;
  
  rows.forEach(row => {
    const attendanceCheckboxes = row.querySelectorAll('.attendance');
    const participationCheckboxes = row.querySelectorAll('.participation');
    
    let hasAttendance = Array.from(attendanceCheckboxes).some(cb => cb.checked);
    if (hasAttendance) studentsPresent++;
    
    let hasParticipation = Array.from(participationCheckboxes).some(cb => cb.checked);
    if (hasParticipation) studentsParticipated++;
  });
  
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('studentsPresent').textContent = studentsPresent;
  document.getElementById('studentsParticipated').textContent = studentsParticipated;

  const ctx = document.getElementById('reportChart').getContext('2d');
  
  if (reportChart) {
    reportChart.destroy();
  }
  
  reportChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Students', 'Present', 'Participated'],
      datasets: [{
        label: 'Number of Students',
        data: [totalStudents, studentsPresent, studentsParticipated],
        backgroundColor: [
          'rgba(26, 42, 108, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(253, 187, 45, 0.8)'
        ],
        borderColor: [
          'rgba(26, 42, 108, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(253, 187, 45, 1)'
        ],
        borderWidth: 2
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
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Attendance Statistics',
          font: {
            size: 16
          }
        }
      }
    }
  });
}

// jQuery Features
function initializeJQueryFeatures() {
  $('#StudentTable tbody tr').off('mouseenter mouseleave');
  $('#StudentTable tbody tr').hover(
    function() { $(this).addClass('row-hover'); },
    function() { $(this).removeClass('row-hover'); }
  );

  $(document).off("click", "#StudentTable tbody tr");

  $(document).on("click", "#StudentTable tbody tr", function (e) {
    const $target = $(e.target);

    if ($target.is("input[type='checkbox']") || $target.is("button")) return;

    let id = $(this).find("td:eq(0)").text();
    let lastName = $(this).find("td:eq(1)").text();
    let firstName = $(this).find("td:eq(2)").text();

    $("#popupContent").html(`
      <p><strong>ID:</strong> ${id}</p>
      <p><strong>Last Name:</strong> ${lastName}</p>
      <p><strong>First Name:</strong> ${firstName}</p>
    `);

    $('#overlay, #popup').fadeIn(300);
  });

  $('#closePopup, #overlay').off('click').on('click', function () {
    $('#overlay, #popup').fadeOut(300);
  });
}

$('#highlightExcellentBtn').click(function() {
  $('#StudentTable tbody tr').each(function() {
    const absences = parseInt($(this).data('absences')) || 0;
    
    if (absences < 3) {
      $(this).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300, function() {
        $(this).addClass('excellent-student');
      });
    }
  });
});

$('#resetColorsBtn').click(function() {
  $('#StudentTable tbody tr').removeClass('excellent-student');
  updateAttendanceData();
});

// Search and Sort
function initializeSearchAndSort() {
  $('#searchInput').on('keyup', function() {
    const searchTerm = $(this).val().toLowerCase();
    
    $('#StudentTable tbody tr').filter(function() {
      const lastName = $(this).find('td:eq(1)').text().toLowerCase();
      const firstName = $(this).find('td:eq(2)').text().toLowerCase();
      const matches = lastName.includes(searchTerm) || firstName.includes(searchTerm);
      
      $(this).toggle(matches);
    });
  });
  
  $('#sortByAbsencesBtn').click(function() {
    let rows = $('#StudentTable tbody tr').get();
    
    rows.sort(function(a, b) {
      let absencesA = parseInt($(a).data('absences')) || 0;
      let absencesB = parseInt($(b).data('absences')) || 0;
      return absencesA - absencesB;
    });
    
    $.each(rows, function(index, row) {
      $('#StudentTable tbody').append(row);
    });
    
    $('#sortStatus').text('Currently sorted by: Absences (Ascending)').fadeOut(100).fadeIn(100);
  });
  
  $('#sortByParticipationBtn').click(function() {
    let rows = $('#StudentTable tbody tr').get();
    
    rows.sort(function(a, b) {
      let participationA = parseInt($(a).data('participations')) || 0;
      let participationB = parseInt($(b).data('participations')) || 0;
      return participationB - participationA;
    });
    
    $.each(rows, function(index, row) {
      $('#StudentTable tbody').append(row);
    });
    
    $('#sortStatus').text('Currently sorted by: Participation (Descending)').fadeOut(100).fadeIn(100);
  });
}
