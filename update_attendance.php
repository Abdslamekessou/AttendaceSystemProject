<?php
header('Content-Type: application/json'); 
include 'db_config.php'; 

$studentId = $_POST['studentId']; 
$sessionType = $_POST['sessionType']; 
$isChecked = $_POST['isChecked'] === 'true' ? 1 : 0; 

if (empty($studentId) || empty($sessionType)) {
    echo json_encode(['success'=>false,'message'=>'Student ID and session type are required']);
    exit;
}

// Check if record exists
$checkSql = "SELECT record_id FROM attendance_records WHERE student_id = ? AND session_type = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, array($studentId, $sessionType));

if (sqlsrv_has_rows($checkStmt)) {
    $sql = "UPDATE attendance_records SET is_checked = ? WHERE student_id = ? AND session_type = ?";
    $params = array($isChecked, $studentId, $sessionType);
} else {
    $sql = "INSERT INTO attendance_records (student_id, session_type, is_checked) VALUES (?,?,?)";
    $params = array($studentId, $sessionType, $isChecked);
}

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode(['success'=>false,'message'=>'Failed to update attendance: '.print_r(sqlsrv_errors(), true)]);
} else {
    echo json_encode(['success'=>true,'message'=>'Attendance updated successfully']);
}

sqlsrv_free_stmt($checkStmt);
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
