
const initialStudents = [
  { id: "101", lastName: "Kessouri", firstName: "Abdessalem", email: "a.kessouri@alpine.edu", course: "ISIL" },
  { id: "102", lastName: "Kayouche", firstName: "Samy", email: "s.kayouche@alpine.edu", course: "ISIL" },
  { id: "103", lastName: "Smith", firstName: "John", email: "j.smith@alpine.edu", course: "CS" },
  { id: "104", lastName: "Johnson", firstName: "Emily", email: "e.johnson@alpine.edu", course: "CS" }
];


document.addEventListener('DOMContentLoaded', function() {
  const tableBody = document.querySelector('#StudentTable tbody');
  
  initialStudents.forEach(student => {
    addStudentToTable(student);
  });
  
  updateAttendanceData();
});


function addStudentToTable(student) {
  const tableBody = document.querySelector('#StudentTable tbody');
  const newRow = document.createElement('tr');
  

  newRow.innerHTML = `
    <td>${student.id}</td>
    <td>${student.lastName}</td>
    <td>${student.firstName}</td>
    <td>${student.course}</td>
  `;
  

  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'attendance';
    checkbox.dataset.session = `S${i}`;
    checkbox.dataset.studentId = student.id;
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }
  

  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'participation';
    checkbox.dataset.session = `P${i}`;
    checkbox.dataset.studentId = student.id;
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }
  

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
    

    row.classList.remove('few-absences', 'medium-absences', 'many-absences');
    
    if (absences < 3) {
      row.classList.add('few-absences');
    } else if (absences >= 3 && absences <= 4) {
      row.classList.add('medium-absences');
    } else if (absences >= 5) {
      row.classList.add('many-absences');
    }
    

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

document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();
  

  document.querySelectorAll('.error').forEach(error => {
    error.style.display = 'none';
  });
  

  const studentId = document.getElementById("studentId").value;
  const lastName = document.getElementById("lastName").value;
  const firstName = document.getElementById("firstName").value;
  const email = document.getElementById("email").value;
  const course = document.getElementById("course").value;
  
  let isValid = true;
  

  if (!/^\d+$/.test(studentId)) {
    document.getElementById("studentIdError").style.display = 'block';
    isValid = false;
  }
  

  if (!/^[A-Za-z\s]+$/.test(lastName)) {
    document.getElementById("lastNameError").style.display = 'block';
    isValid = false;
  }
  

  if (!/^[A-Za-z\s]+$/.test(firstName)) {
    document.getElementById("firstNameError").style.display = 'block';
    isValid = false;
  }
  

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").style.display = 'block';
    isValid = false;
  }
  

  if (isValid) {
    const student = {
      id: studentId,
      lastName: lastName,
      firstName: firstName,
      email: email,
      course: course
    };
    
    addStudentToTable(student);
    document.getElementById("studentForm").reset();
    

    updateAttendanceData();
  }
});


document.addEventListener('change', function(e) {
  if (e.target.classList.contains('attendance') || e.target.classList.contains('participation')) {
    updateAttendanceData();
  }
});