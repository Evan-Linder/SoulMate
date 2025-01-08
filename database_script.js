//DATABASE HANDLING
$(document).ready(function () {
    // Handle login button click
    $("#loginButton").on("click", function () {
        const action = "login"; // Set action to 'login' for login request
        // Serialize form data and append the action parameter
        const formData = $("#loginForm").serialize() + "&action=" + action;

        $.ajax({
            url: "http://localhost/supportbot/db_handler.php", // URL of the PHP script handling the login
            type: "POST", // Set the request type to POST
            data: formData, // Send the serialized form data along with action
            success: function (response) {
                console.log("Response:", response); // Log the server response for debugging

                const popup = $("#errorPopup"); // Get the popup element for displaying messages
                if (response.status === "success") {
                    // If login is successful, redirect to the homepage
                    window.location.href = "http://localhost/supportbot/index.html";
                } else {
                    // If there's an error, display the error message in the popup
                    popup.text(response.message).addClass("error").fadeIn();
                    // Hide the popup after 3 seconds
                    setTimeout(() => popup.fadeOut(), 3000);
                }
            }
        });
    });

    // Handle register button click
    $("#registerButton").on("click", function () {
        const action = "register"; // Set action to 'register' for register request
        // Serialize form data and append the action parameter
        const formData = $("#loginForm").serialize() + "&action=" + action;

        $.ajax({
            url: "http://localhost/supportbot/db_handler.php", // URL of the PHP script handling the registration
            type: "POST", // Set the request type to POST
            data: formData, // Send the serialized form data along with action
            success: function (response) {
                console.log("Response:", response); // Log the server response for debugging

                const popup = $("#errorPopup"); // Get the popup element for displaying messages
                if (response.status === "success") {
                    // If registration is successful, display success message
                    popup.text(response.message).addClass("success").fadeIn();
                    // Hide the popup after 3 seconds
                    setTimeout(() => popup.fadeOut(), 3000);
                } else {
                    // If there's an error, display the error message in the popup
                    popup.text(response.message).addClass("error").fadeIn();
                    setTimeout(() => popup.fadeOut(), 3000); // Hide after 3 seconds
                }
            }
        });
    });
});





