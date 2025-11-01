const defaultStudents = [
  { id: "101", lastName: "Kessouri", firstName: "Abdessalem", email: "a.kessouri@alpine.edu", course: "ISIL" },
  { id: "102", lastName: "Kayouche", firstName: "Samy", email: "s.kayouche@alpine.edu", course: "ISIL" },
  { id: "103", lastName: "Smith", firstName: "John", email: "j.smith@alpine.edu", course: "CS" },
  { id: "104", lastName: "Johnson", firstName: "Emily", email: "e.johnson@alpine.edu", course: "CS" }
];


function getStudents() {
  const stored = localStorage.getItem("students");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("students", JSON.stringify(defaultStudents));
  return defaultStudents;
}

function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#StudentTable tbody");
  const form = document.getElementById("studentForm");


  if (tableBody) {
    const students = getStudents();
    students.forEach(s => addStudentToTable(s));
    updateAttendanceData();
  }


  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      document.querySelectorAll(".error").forEach(e => (e.style.display = "none"));

      const studentId = document.getElementById("studentId").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const firstName = document.getElementById("firstName").value.trim();
      const email = document.getElementById("email").value.trim();
      const course = document.getElementById("course").value.trim();

      let isValid = true;

      if (!/^\d+$/.test(studentId)) {
        document.getElementById("studentIdError").style.display = "block";
        isValid = false;
      }
      if (!/^[A-Za-z\s]+$/.test(lastName)) {
        document.getElementById("lastNameError").style.display = "block";
        isValid = false;
      }
      if (!/^[A-Za-z\s]+$/.test(firstName)) {
        document.getElementById("firstNameError").style.display = "block";
        isValid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById("emailError").style.display = "block";
        isValid = false;
      }

      if (!isValid) return;

      const students = getStudents();
      students.push({ id: studentId, lastName, firstName, email, course });
      saveStudents(students);

      alert("Student added successfully!");
      form.reset();
      window.location.href = "index.html";
    });
  }
});

function addStudentToTable(student) {
  const tableBody = document.querySelector("#StudentTable tbody");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
    <td>${student.id}</td>
    <td>${student.lastName}</td>
    <td>${student.firstName}</td>
    <td>${student.course}</td>
  `;

  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "attendance";
    checkbox.dataset.session = `S${i}`;
    checkbox.dataset.studentId = student.id;
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }

  for (let i = 1; i <= 6; i++) {
    const cell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "participation";
    checkbox.dataset.session = `P${i}`;
    checkbox.dataset.studentId = student.id;
    cell.appendChild(checkbox);
    newRow.appendChild(cell);
  }

  const messageCell = document.createElement("td");
  messageCell.className = "message";
  messageCell.dataset.studentId = student.id;
  newRow.appendChild(messageCell);
  tableBody.appendChild(newRow);
}

function updateAttendanceData() {
  const rows = document.querySelectorAll("#StudentTable tbody tr");
  rows.forEach(row => {
    const attendance = row.querySelectorAll(".attendance");
    const participation = row.querySelectorAll(".participation");
    const messageCell = row.querySelector(".message");

    let absences = 0;
    let participations = 0;

    attendance.forEach(cb => { if (!cb.checked) absences++; });
    participation.forEach(cb => { if (cb.checked) participations++; });

    row.classList.remove("few-absences", "medium-absences", "many-absences");
    if (absences < 3) row.classList.add("few-absences");
    else if (absences <= 4) row.classList.add("medium-absences");
    else row.classList.add("many-absences");

    let message = "";
    if (absences < 3 && participations >= 4) message = "Good attendance - Excellent participation";
    else if (absences < 3) message = "Good attendance - You need to participate more";
    else if (absences <= 4 && participations >= 3) message = "Warning - attendance low - Good participation";
    else if (absences <= 4) message = "Warning - attendance low - You need to participate more";
    else if (participations >= 3) message = "Excluded - too many absences - Good participation";
    else message = "Excluded - too many absences - You need to participate more";

    messageCell.textContent = message;
  });
}

document.addEventListener("change", e => {
  if (e.target.classList.contains("attendance") || e.target.classList.contains("participation")) {
    updateAttendanceData();
  }
});
