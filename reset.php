<?php
$conn = new mysqli("localhost", "root", "", "matrimonio");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $token = bin2hex(random_bytes(50));
    $scadenza = date("Y-m-d H:i:s", strtotime("+1 hour"));

    $stmt = $conn->prepare("UPDATE utenti SET reset_token=?, token_scadenza=? WHERE email=?");
    $stmt->bind_param("sss", $token, $scadenza, $email);
    $stmt->execute();

    $reset_link = "http://tuosito.com/new_password.php?token=" . $token;
    mail($email, "Reset Password", "Clicca qui: $reset_link");

    echo "Email inviata!";
}
?>
