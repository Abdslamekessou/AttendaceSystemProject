<?php
header('Content-Type: application/json');
include 'db_config.php';

$studentId = $_POST['studentId'];
$lastName = $_POST['lastName'];
$firstName = $_POST['firstName'];
$email = $_POST['email'];
$course = $_POST['course'];

// Validate input
if (empty($studentId) || empty($lastName) || empty($firstName) || empty($email) || empty($course)) {
    echo json_encode(['success'=>false,'message'=>'All fields are required']);
    exit;
}

// Check if student exists
$checkSql = "SELECT id FROM students WHERE id = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, array($studentId));

if (sqlsrv_has_rows($checkStmt)) {
    echo json_encode(['success'=>false,'message'=>'Student ID already exists']);
    sqlsrv_free_stmt($checkStmt);
    sqlsrv_close($conn);
    exit;
}

// Insert new student
$sql = "INSERT INTO students (id,lastName,firstName,email,course) VALUES (?,?,?,?,?)";
$params = array($studentId,$lastName,$firstName,$email,$course);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode(['success'=>false,'message'=>'Failed to add student: '.print_r(sqlsrv_errors(), true)]);
} else {
    echo json_encode([
        'success'=>true,
        'message'=>'Student added successfully',
        'student'=>[
            'id'=>$studentId,
            'lastName'=>$lastName,
            'firstName'=>$firstName,
            'email'=>$email,
            'course'=>$course
        ]
    ]);
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
