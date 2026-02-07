# Lecture Hub

A modern video lecture management platform built with React, TypeScript, and MongoDB Atlas.

## Features

- 📹 **Video Lecture Management** - Full CRUD operations for video lectures
- 🔍 **Search** - Search lectures by title, description, or tags
- 🎬 **Video Player** - Built-in video player supporting YouTube, Vimeo, and direct video URLs
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Modern Dark Theme** - Sleek cinematic design with smooth animations

## Lecture Schema

Each lecture document in MongoDB follows this schema:

```typescript
{
  _id: string;           // MongoDB ObjectId
  title: string;         // Required - Lecture title
  videoUrl: string;      // Required - Video URL (YouTube, Vimeo, or direct)
  thumbnail: string;     // Thumbnail image URL
  duration: number;      // Duration in seconds
  views: number;         // View count (auto-incremented)
  description?: string;  // Optional description
  tags?: string[];       // Optional array of tags
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

## MongoDB Atlas Setup

### 1. Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Sign up or log in to your account
3. Click **"Build a Database"**
4. Choose your preferred tier (Free tier works great for development)
5. Select a cloud provider and region
6. Click **"Create Cluster"**

### 2. Configure Database Access

1. Navigate to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Enter a username and generate a secure password
5. Set **Database User Privileges** to "Read and write to any database"
6. Click **"Add User"**

### 3. Configure Network Access

1. Navigate to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, add specific IP addresses
4. Click **"Confirm"**

### 4. Enable Data API (Required)

1. Navigate to **Data API** in the left sidebar
2. Click **"Enable the Data API"**
3. Select your cluster
4. Create a new API Key:
   - Click **"Create API Key"**
   - Give it a name (e.g., "Lecture Hub API")
   - Copy the API key (you'll need it for MONGODB_URI)
5. Note your **App ID** (shown in the Data API URL)

### 5. Get Your Connection String

1. Navigate to **Database** → **Connect**
2. Choose **"Drivers"**
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   ```
4. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<database>` with `lectures_db` (or your preferred database name)

### 6. Set MONGODB_URI in Lovable Cloud

1. In your Lovable project, the secret `MONGODB_URI` should already be configured
2. If you need to update it, the format is:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/lectures_db
   ```

> **Note:** The password in the connection string is used as the Data API key for authentication.

## API Endpoints

The backend exposes a RESTful API through Lovable Cloud edge functions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lectures` | List all lectures |
| GET | `/lectures?search=query` | Search lectures |
| GET | `/lectures/:id` | Get a single lecture (increments views) |
| POST | `/lectures` | Create a new lecture |
| PUT | `/lectures/:id` | Update a lecture |
| DELETE | `/lectures/:id` | Delete a lecture |

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Lecture doesn't exist
- **503 Service Unavailable** - Database connection issues

Connection errors include helpful hints for troubleshooting MongoDB Atlas configuration.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **State Management:** TanStack Query
- **Backend:** Lovable Cloud Edge Functions
- **Database:** MongoDB Atlas
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form + Zod



**Use your preferred IDE** - Clone this repo and push changes:

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

