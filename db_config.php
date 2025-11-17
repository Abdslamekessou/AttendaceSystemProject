<?php 
// Database configuration for SQL Server
$serverName = "DESKTOP-9TFE518\SQLEXPRESS"; 
$connectionOptions = array( 
    "Database" => "attendance_system", 
    "Uid" => "sa", 
    "PWD" => "12345678" 
); 

// Establish connection 
$conn = sqlsrv_connect($serverName, $connectionOptions); 

// Check connection 
if ($conn === false) { 
    die(json_encode(array( 
        'success' => false, 
        'message' => 'Connection failed: ' . print_r(sqlsrv_errors(), true) 
    ))); 
} 
?>
