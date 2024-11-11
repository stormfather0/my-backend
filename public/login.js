document.getElementById('login-form').addEventListener('submit', handleLogin);

async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message); // Throw an error if the response is not ok
        }

        const data = await response.json();
        
        // Save token to localStorage
        localStorage.setItem("authToken", data.token);
        console.log('Login successful:', data);

        // Redirect to index.html after successful login
        window.location.href = 'http://localhost:3000/index.html';
        
    } catch (error) {
        console.error('Error during login:', error.message);
        alert(error.message); // Show an alert with the error message
    }
}