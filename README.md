# 🌴 Villa Nivrritii — South Goa Airbnb Website

A fully responsive, production-ready villa website built with **Node.js + Express**.

---

## 🚀 Quick Start (Mac)

### 1. Install dependencies
```bash
cd villa-nivrritii
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your Gmail details (see Email Setup below).

### 3. Run the development server
```bash
npm run dev
```

Open your browser at → **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
villa-serenidade/
├── server.js          ← Main Express server
├── package.json
├── .env               ← Your secrets (never commit this!)
├── .env.example       ← Template for .env
├── routes/
│   └── enquiry.js     ← Booking form API endpoint
├── views/
│   └── index.html     ← Main website (all sections)
└── public/
    ├── css/           ← Add extra stylesheets here
    └── js/            ← Add extra scripts here
```

---

## 📧 Email Setup (Gmail)

The booking form sends enquiry emails to your inbox.

1. Go to your Google Account → **Security → 2-Step Verification** (enable it)
2. Then go to → **App Passwords** → Create one for "Villa Website"
3. Copy the 16-character password into `.env`:

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop   ← your app password
OWNER_EMAIL=youremail@gmail.com  ← where enquiries go
```

---





### Option B — Render.com
1. Push this folder to GitHub
2. Go to render.com → New Web Service → Connect your repo
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add your `.env` variables in the Render dashboard

---

## 🛠 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Production server |
| `npm run dev` | Dev server with auto-reload (nodemon) |

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `express` | Web server framework |
| `nodemailer` | Sends booking enquiry emails |
| `dotenv` | Loads .env config |
| `nodemon` | Auto-restarts on file changes (dev only) |
