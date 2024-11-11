import bcrypt from 'bcrypt';

const password = 'password123'; // The plain password you want to hash
const saltRounds = 10; // The number of rounds for salt generation

// Hash the password
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed Password:', hash); // This will output the hash
});