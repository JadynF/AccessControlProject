const bcrypt = require("bcrypt");
const TOTPSECRET = "ac36"
const fixedSalt = '$2a$10$wWJq4d32y7bYidLZmCErQ.OgOJL6TqZ8KDRSHoGG0TldwGWzO9Qde';

const curr = Math.floor(Date.now() / 1000);
const timestamp = Math.floor(curr / 30) * 30;

bcrypt.hash(TOTPSECRET + timestamp, fixedSalt, (err, rawHash) => {
  if (err) {
    console.error(err);
    return;
  }
  
  let totp = "";
  for (let i = rawHash.length - 1; i > 0; i--) {
    if (rawHash.charAt(i) >= '0' && rawHash.charAt(i) <= '9') {
      totp += rawHash.charAt(i);
    }
    if (totp.length >= 6) {
      break;
    }
  }
  console.log("Your TOTP code: " + totp);
});