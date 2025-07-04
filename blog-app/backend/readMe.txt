# Backend Setup Instructions
## 1. Prerequisites
- Node.js and npm installed
- PostgreSQL installed and running

## 2. Environment Variables
Create a `.env` file in the `backend` directory. Use the following template:

```
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
JWT_SECRET=your_jwt_secret
```
- Replace `your_user`, `your_password`, and `your_database` with your PostgreSQL credentials.
- Set a strong value for `JWT_SECRET`.

## 3. Install Dependencies
Open a terminal in the project root and run:
```
npm install --prefix backend
```

## 4. Set Up the Database
- Ensure PostgreSQL is running.
- Run the SQL scripts in the `backend` folder to create tables:
  1. `create_users_table.sql`
  2. `create_table.sql`
- You can run them using a tool like `psql`:
```
psql -U your_user -d your_database -f create_users_table.sql
psql -U your_user -d your_database -f create_table.sql
```

## 5. Start the Backend Server
```
node backend/index.js
```
The server will start on the port specified in your `.env` file (default: 5000).

## 6. API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT
- `GET /api/posts` — Get all posts
- ... (see code for more) 
