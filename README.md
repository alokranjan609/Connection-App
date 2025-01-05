# Connection-App

**Newsgram** is a web application where user can register themselves and make other registered users as their friends. It includes a server-side component that handles accepting,rejecting and suggesting friends  and integrates caching using Redis to enhance performance.
## Features

- **User Authentication:** Authentication has been implemented using JWT tokens .
- **Redis Caching:** Caches Frineds and Suggestions in Redis to reduce redundant API calls on Database.
- **Automatic Cache Expiration:** Cached content is automatically expired after a set period (e.g., 60 minutes).
- **Efficient API Usage:** Reduces load on the Database  by using cached results when available.

 ## Tech Stack

- **Frontend:** React
- **Backend:** Node.js/Express
- **Caching:** Redis
- **Databse:** MongoDB

## Installation

### Clone the Repository
```bash
  git clone https://github.com/alokranjan609/Connection-App
  cd Connection-App
```
### Install Dependencies
- **Backend**
```bash
    cd backend
    npm install
```
- **Client**
```bash
  cd mern-friends-app
  npm install
```
### Set Up Redis
```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```
### Environment Variables
- Create a .env file in the server directory with the following content:
```bash
MONGO_URI=mongodb://localhost:27017/mern-friends-app
JWT_SECRET=YOUR_SECRET_KEY
```
### Run the Application
- Start the Backend Server
```bash
cd server
npm start
```
- Start the Frontend Client
```bash
cd mern-friends-app
npm start
```
### Access the Application
Open your browser and visit http://localhost:3000 to view the application.
