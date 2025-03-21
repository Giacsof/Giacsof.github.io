<?php
$conn = new mysqli("localhost", "root", "", "matrimonio");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $token = $_POST["token"];
    $new_password = password_hash($_POST["password"], PASSWORD_DEFAULT);

    $stmt = $conn->prepare("UPDATE utenti SET password=?, reset_token=NULL, token_scadenza=NULL WHERE reset_token=? AND token_scadenza > NOW()");
    $stmt->bind_param("ss", $new_password, $token);
    $stmt->execute();

    echo "Password aggiornata!";
}
?>
