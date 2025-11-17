<?php
header('Content-Type: application/json');
include 'db_config.php';

// Query to get all students with their attendance records
$sql = "SELECT s.id, s.lastName, s.firstName, s.email, s.course,
        ar.session_type, ar.is_checked
        FROM students s
        LEFT JOIN attendance_records ar ON s.id = ar.student_id
        ORDER BY s.id";

$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    echo json_encode(array(
        'success' => false,
        'message' => 'Query failed: ' . print_r(sqlsrv_errors(), true)
    ));
    exit;
}

// Organize data by student
$students = array();
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $studentId = $row['id'];
    
    if (!isset($students[$studentId])) {
        $students[$studentId] = array(
            'id' => $row['id'],
            'lastName' => $row['lastName'],
            'firstName' => $row['firstName'],
            'email' => $row['email'],
            'course' => $row['course'],
            'attendance' => array()
        );
    }
    
    // Add attendance record if exists
    if ($row['session_type'] != null) {
        $students[$studentId]['attendance'][$row['session_type']] = $row['is_checked'];
    }
}

echo json_encode(array(
    'success' => true,
    'students' => array_values($students)
));

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
