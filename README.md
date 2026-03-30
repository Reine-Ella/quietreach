## Setup Instructions

Follow these steps carefully to run the project correctly.

---

Step 1 — Download or clone the repository

If cloning from GitHub:

git clone https://github.com/your-username/quietreach.git
cd quietreach

Step 2 — Open in VS Code
Open VS Code
Go to File → Open Folder
Select the quietreach folder (the one containing package.json)

Step 3 — Install Node.js (REQUIRED)

This project uses a backend server, so Node.js is required.

Go to: https://nodejs.org
Download Node.js 20 LTS
Install it
Restart VS Code

Check installation, run:
node -v
npm -v


Step 4 — Fix PowerShell (Windows only)

If you get an error about scripts being disabled:

Open PowerShell as Administrator, run:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Type Y and press Enter
Restart VS Code


Step 5 — Install dependencies

Make sure you are inside the project folder (where package.json is located), then run:

npm install
Step 6 — Create environment file

Create a file named:

.env

Add:

PORT=3000
SESSION_SECRET=quietreach-secret-key
Step 7 — Run the server

Start the application:

npm start

Or for development mode:

npm run dev

If successful, you will see:

QuietReach is running at http://localhost:3000
Step 8 — Open the project

Open your browser and go to:

http://localhost:3000

IMPORTANT:

Do NOT open index.html directly
Do NOT use Live Server
The app only works through the backend server


Login & Test Instructions

The system comes with preloaded accounts.

Admin account
Username	Password
admin	admin123

Steps:

Go to Admin Login
Log in using the credentials above
You will be redirected to the Admin Dashboard
Sample mentor accounts (already active)
Username	Password	Specialty
MentorSarah	mentor123	Mental Health
MentorJames	mentor123	Parenting
MentorGrace	mentor123	Education

Steps:

Go to Mentor Login
Log in using any of the above accounts
Young mother account

Steps:

Go to Register
Enter:
Username (any name)
Password (minimum 6 characters)
Submit the form

You will:

Be automatically logged in
Be redirected to the Mother Dashboard
