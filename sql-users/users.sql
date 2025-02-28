CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    role     ENUM ('Human', 'Admin', 'Alien') NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE logs (
    id       VARCHAR(255) NOT NULL,
    who VARCHAR(255) NOT NULL,
    `when`     VARCHAR(255) NOT NULL,
    what     VARCHAR(1023) NOT NULL,
    success  VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$04$4UZJAv.xgdjzdXxrA9MpEO/Wrqj2BErIB9scnXFKtzHCUHVHxorv.",
    "user@example.com",
    "3eb7",
    "Human"
);

INSERT INTO users
VALUES(
    "user2",
    "$2a$12$bNVhN3WlYFKA9vvEXkaP/u2XwrEHPWMjDNLkxtPfrKArwG.z5AqZS",
    "user2@example.com",
    "4b7a",
    "Admin"
)