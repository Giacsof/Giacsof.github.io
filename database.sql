CREATE DATABASE matrimonio;
USE matrimonio;

CREATE TABLE utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    token_scadenza DATETIME DEFAULT NULL
);
