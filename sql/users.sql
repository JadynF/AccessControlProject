CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$04$4UZJAv.xgdjzdXxrA9MpEO/Wrqj2BErIB9scnXFKtzHCUHVHxorv.",
    "user@example.com",
    "3eb7"
);
