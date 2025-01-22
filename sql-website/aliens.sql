CREATE DATABASE aliens;

use aliens;

CREATE TABLE sightings (
    sightingNumber INT AUTO_INCREMENT NOT NULL,
    sightingTime   TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    shipShape      VARCHAR(255) NOT NULL,
    shipColor      VARCHAR(255) NOT NULL,
    sightingDesc   VARCHAR(2048) NOT NULL,
    PRIMARY KEY (sightingNumber)
);

INSERT INTO sightings (shipShape, shipColor, sightingDesc)
VALUES ('Disk', 'Silver', 'A silver disk-shaped UFO sighted near the mountains at dusk.');

CREATE TABLE alienMessages (
    messageNumber   INT AUTO_INCREMENT NOT NULL,
    messageTime     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    messageText     VARCHAR(2048) NOT NULL,
    messageMedium   VARCHAR(255) NOT NULL,
    PRIMARY KEY (messageNumber)
);

INSERT INTO alienMessages (messageText, messageMedium)
VALUES ('GEEP GORP, GIVE US ALL OF YOUR COWS', 'Telepathy')