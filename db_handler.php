<?php
// Allow all origins (you can restrict this to specific domains if needed)
header('Access-Control-Allow-Origin: *');

// Allow specific HTTP methods
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Allow specific headers (Content-Type)
header('Access-Control-Allow-Headers: Content-Type');

// If this is a preflight request, just return a 200 status code and exit
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for response to JSON
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Establish a connection to the MySQL database
$conn = new mysqli("localhost", "root", "", "supportbot");

// Check if the connection was successful
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Failed to connect to the database: " . $conn->connect_error]);
    exit();  // Exit if connection fails
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve the action from the POST request
    $action = $_POST['action'] ?? '';

    // Check if the action is specified
    if (!$action) {
        echo json_encode(["status" => "error", "message" => "Action is missing!"]);
        exit();  // Exit if action is not provided
    }

    // Register action
    if ($action === 'register') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        // Check if username and password are not empty
        if (empty($username) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "Username or password cannot be empty."]);
            exit();  // Exit if username or password is empty
        }

        // Hash the password before storing it in the database for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (username, password) VALUES (?, ?)";

        // Prepare and execute the SQL statement to insert the new user
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("ss", $username, $hashed_password);

            // Check if the execution is successful
            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Registration successful!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error: Username might already exist."]);
            }

            $stmt->close();
        } else {
            // Return an error if there is an issue with preparing the SQL statement
            echo json_encode(["status" => "error", "message" => "Error preparing the statement: " . $conn->error]);
        }
    }

    // Login action
    elseif ($action === 'login') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        // Check if username and password are provided
        if (empty($username) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "Username or password cannot be empty."]);
            exit();  // Exit if username or password is empty
        }

        // Query the database to retrieve the stored hashed password for the given username
        $sql = "SELECT id, password FROM users WHERE username = ?";

        // Prepare and execute the SQL statement to fetch the user data
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $stmt->bind_result($user_id, $stored_password);

            // Check if the username exists in the database
            if ($stmt->fetch()) {
                // Debugging output for the password (used for troubleshooting)
                error_log("Stored password: " . $stored_password);
                error_log("Entered password: " . $password);
                
                // Verify the entered password with the stored hashed password
                if (password_verify($password, $stored_password)) {
                    echo json_encode(["status" => "success", "message" => "Login successful!"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Incorrect password!"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Username not found!"]);
            }

            $stmt->close();
        } else {
            // Return an error if there is an issue with preparing the SQL statement
            echo json_encode(["status" => "error", "message" => "Error preparing the statement: " . $conn->error]);
        }
    } else {
        // Return an error if an invalid action is specified
        echo json_encode(["status" => "error", "message" => "Invalid action specified."]);
    }
}

// Close the database connection after all operations
$conn->close();
?>


