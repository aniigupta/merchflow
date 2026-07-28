# MerchFlow Deployment Guide

This guide details the two recommended options for hosting the MerchFlow application in production. 

---

## 🗄️ Database Setup (MongoDB Atlas)

Both hosting options require a cloud MongoDB database. 

1. **Sign Up**: Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create Cluster**: Spin up a free shared cluster (M0) in your preferred region.
3. **Database User**: Go to **Database Access** -> **Add New Database User**. Choose **Read and write to any database** and set a strong password.
4. **Network Access**: Go to **Network Access** -> **Add IP Address**. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) since hosting platforms (like Render or Vercel) have dynamic IPs.
5. **Get Connection String**: Go to **Database** -> **Connect** -> **Drivers** (Node.js). Copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/merchflow?retryWrites=true&w=majority`
   *(Replace `<username>` and `<password>` with the credentials created in Step 3)*

---

## 🚀 Option A: Unified Hosting (Express Serves React Bundle) - *Recommended & Cheapest*

In this configuration, your Express server builds and serves the React client. This requires **only one hosting service** (meaning it fits entirely on free/hobby tiers), avoids CORS settings complexity, and operates under a single domain.

### Deployment on Render (Web Service)

1. Sign up/log in to [Render](https://render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration parameters:
   - **Name**: `merchflow` (or any custom name)
   - **Environment/Runtime**: `Node`
   - **Branch**: `main` (or your active development branch)
   - **Root Directory**: Leave blank (runs from repository root)
   - **Build Command**: `npm run build` *(this runs root package.json's build which runs client build)*
   - **Start Command**: `npm start` *(this runs server/src/index.js)*
5. Add the following **Environment Variables** in the Web Service settings:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render will automatically proxy traffic to whichever port the server listens on)
   - `MONGO_URI`: *Your MongoDB Atlas Connection String*
   - `JWT_SECRET`: *A secure random string (e.g. generated via `openssl rand -base64 32`)*
   - `JWT_EXPIRES_IN`: `7d`
6. **Deploy**: Render will automatically build the client bundle and boot up the Express server. You can visit the public URL provided by Render to view your app.

> [!WARNING]
> **Persistent Disk Uploads**: Since local disk storage on Render/Railway is ephemeral, any graphic designs uploaded by users will be deleted whenever the server restarts or sleeps. 
> To keep these designs, attach a **Persistent Disk** (e.g. a 1GB Render Disk mapped to mount path `/server/uploads`) or modify `server/src/middleware/upload.js` to upload directly to a cloud service like AWS S3 or Cloudinary.

---

## 🌐 Option B: Separate Hosting (Vercel Frontend + Render Backend)

In this configuration, the Vite React frontend is hosted on Vercel (globally distributed static CDN), and the Express backend is hosted on Render.

### 1. Backend API (Render Web Service)
Follow the Render instructions above, but with these adjustments:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGO_URI`: *Your MongoDB Atlas connection string*
  - `JWT_SECRET`: *Secure random string*
  - `JWT_EXPIRES_IN`: `7d`
  - `CLIENT_URL`: `https://your-frontend-domain.vercel.app` *(update this after setting up the Vercel app below)*

### 2. Frontend CDN (Vercel Static Site)
1. Sign up/log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following configuration parameters:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the following **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api` *(use the URL provided by the backend Render Web Service)*
6. Click **Deploy**. Vercel will build the frontend, handle routing redirects via `vercel.json`, and deploy it to a `.vercel.app` subdomain.

---

## 🌱 Database Seeding in Production

If you want to pre-populate products, categories, and test user accounts (Customer and Admin) on your production database:

Run the seed script locally pointing to your production database:
```bash
# In your local terminal (Windows PowerShell):
$env:MONGO_URI="your_mongodb_atlas_connection_string"
cd server
npm run seed
```
*(Make sure to use your actual MongoDB Atlas connection string. This will wipe and re-populate the collections with seed data).*
