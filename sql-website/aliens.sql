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