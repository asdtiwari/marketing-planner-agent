# 🤖 Marketing Planner Agent SaaS

> **An enterprise-grade, multi-tenant AI platform that autonomously generates, formats, and manages data-driven marketing execution schedules using multi-agent orchestration.**


---

## 📖 Project Overview

The **Marketing Planner Agent SaaS** is a full-stack, AI-powered web application designed to help marketing teams automatically generate actionable execution schedules. Instead of relying on a single AI model to write a generic response, this platform utilizes **Agentic Workflow** (via CrewAI) where specialized AI personas collaborate to complete the task.

### ✨ Key Capabilities

- **🔐 Strict Multi-Tenancy:** Data is securely isolated by "Organization" (Tenant). Users from Company A can never access the knowledge base or generated plans of Company B.

- **🧠 Retrieval-Augmented Generation (RAG):** Users can upload internal strategy PDFs or competitor data. The AI embeds this data into a local vector database and retrieves it as context before making decisions.

- **🤖 Multi-Agent Orchestration:**
  - **The Strategist:** Analyzes the vector database to formulate a high-level approach.
  - **The Execution Planner:** Translates the strategy into a strict week-by-week markdown schedule.
  - **The Content Publisher:** Safely converts the markdown into semantic, web-ready HTML.

- **💾 Persistent History:** All generated plans are auto-saved to a MySQL database, allowing users to rename, read, and delete past strategies.

- **🌗 Modern UX:** A responsive, utility-first frontend featuring dark/light mode, robust error boundaries, and real-time UI feedback.

---

## 🧱 Tech Stack

This project strictly separates the frontend client from the backend API, communicating via RESTful JSON endpoints.

### Frontend (Client)

- **React 18** (Bootstrapped with **Vite** for lightning-fast HMR)
- **Tailwind CSS v4** (Utility-first styling with native CSS variables and Dark Mode)
- **Tailwind Typography** (`@tailwindcss/typography` for styling raw AI-generated HTML)
- **React Router DOM** (Client-side routing and protected routes)
- **Axios** (HTTP client with global error interceptors)
- **Lucide React** (Consistent, crisp SVG iconography)

### Backend (API Server)

- **Python 3.10+**
- **FastAPI** (High-performance asynchronous API framework)
- **Uvicorn** (ASGI web server)
- **SQLAlchemy & PyMySQL** (ORM and database driver)
- **PyJWT & python-jose** (Stateless, secure JWT authentication)
- **bcrypt** (Native cryptographic password hashing)

### AI & Machine Learning

- **CrewAI** (Multi-agent orchestration framework)
- **LiteLLM** (Universal API translator for AI models)
- **ChromaDB** (Local vector database for RAG)
- **HuggingFace Sentence Transformers** (`all-MiniLM-L6-v2` for local text embeddings)
- **Groq API** (`llama-3.3-70b-versatile` for high-speed, heavy-duty reasoning)
- **OpenRouter API** (`meta-llama/llama-3-8b-instruct` for formatting tasks)

### Database

- **MySQL Server** (Primary relational database for Users, Organizations, and Plans)

---

## 📂 Project Structure

The repository is divided into two entirely separate codebases.

```text
marketing-planner-agent/
│
├── backend/                              # Python FastAPI Server
│   ├── app/
│   │   ├── agents/                       # AI Orchestration Logic
│   │   │   ├── tools/                    # Custom CrewAI Tools (ChromaDB search, HTML formatter)
│   │   │   └── planner_crew.py           # Multi-agent definitions and pipeline
│   │   ├── api/                          # REST API Endpoints (Controllers)
│   │   │   ├── agent_router.py           # Handles AI kickoff and auto-saving
│   │   │   ├── auth_router.py            # Login and Registration (Atomic transactions)
│   │   │   ├── document_router.py        # PDF Upload and Vector Ingestion
│   │   │   └── plan_router.py            # CRUD operations for Plan History
│   │   ├── core/                         # Core Configuration
│   │   │   ├── config.py                 # Environment variables loader
│   │   │   ├── database.py               # MySQL connection pool
│   │   │   ├── security.py               # JWT generation and bcrypt hashing
│   │   │   └── vector_store.py           # ChromaDB initialization
│   │   ├── models/                       # SQLAlchemy Database Tables
│   │   │   ├── organization.py           # Tenant schema
│   │   │   ├── plan.py                   # Auto-saved plans schema
│   │   │   └── user.py                   # User account schema
│   │   ├── schemas/                      # Pydantic Data Validation Models
│   │   └── main.py                       # FastAPI application entry point
│   ├── .env                              # Backend secrets (ignored in git)
│   └── requirements.txt                  # Python dependencies
│
└── frontend/                             # React Web App
    ├── src/
    │   ├── pages/                        # View Components
    │   │   ├── Dashboard.jsx             # Main workspace (Sidebar, Chat, HTML Viewer)
    │   │   ├── Login.jsx                 # Auth Login
    │   │   └── Register.jsx              # Auth Registration
    │   ├── services/                     # Axios API Wrappers
    │   │   ├── agentService.js           # Calls agent endpoints
    │   │   ├── authService.js            # Handles token storage
    │   │   ├── documentService.js        # Handles multipart form data
    │   │   └── planService.js            # Handles history CRUD
    │   ├── utils/                        # Helper functions
    │   │   └── auth.js                   # Session storage management
    │   ├── App.jsx                       # Router configuration
    │   ├── main.jsx                      # React DOM rendering
    │   └── index.css                     # Tailwind v4 import & Dark Mode root
    ├── vite.config.js                    # Vite configuration
    ├── package.json                      # Node dependencies
    └── .env                              # Frontend variables (if any)
```
---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed and configured on your local development machine:

- **Node.js (v18+) & npm:** Required to run the Vite development server.  
- **Python (v3.10+):** Required for FastAPI, CrewAI, and LangChain dependencies.  
- **MySQL Server:** A running instance of MySQL (v8.0+ recommended). You can install this natively or run it via Docker.  
- **C++ Build Tools:** Required by `chromadb` and `sentence-transformers` on Windows. (Install via Visual Studio Build Tools if you encounter wheel errors during pip install).

### 🔑 Required API Keys

You will need free API keys from the following providers:

- **Groq:** Get your key at https://console.groq.com/  
- **OpenRouter:** Get your key at https://openrouter.ai/  

---

## 🔧 Installation Guide (Step-by-Step)

Follow these instructions carefully to set up the dual-environment architecture. We will configure the Python backend first, followed by the React frontend.

### Part 1: Backend Setup (FastAPI & AI)

**1. Clone the repository and navigate to the backend directory:**

```
git clone https://github.com/your-username/marketing-planner-agent.git
cd marketing-planner-agent/backend
```

**2. Create and activate a secure virtual environment:**

This isolates our Python dependencies so they do not conflict with your system.

```
# For Windows
python -m venv venv
venv\Scripts\activate

# For Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install Core Dependencies:**

Ensure your virtual environment is active (you should see `(venv)` in your terminal).  
*💡 Tip: We install `PyJWT` and `bcrypt` directly to avoid legacy namespace collisions.*

```
pip install fastapi uvicorn sqlalchemy pymysql
pip install "python-jose[cryptography]" PyJWT bcrypt "pydantic[email]"
pip install crewai litellm chromadb sentence-transformers markdown
```

**4. Configure the MySQL Database:**

Open your MySQL CLI or GUI (like MySQL Workbench) and execute this SQL command to create a fresh, clean database for the application:

```
DROP DATABASE IF EXISTS marketing_agent;
CREATE DATABASE marketing_agent;
```

**5. Set Up Backend Environment Variables:**

Create a new file named `.env` inside the `backend` folder and paste the following, replacing the placeholders with your actual credentials:

```
# Database Connection (Format: mysql+pymysql://user:password@host:port/dbname)
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/marketing_agent

# Security (Generate a random string for production!)
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key_here
```

---

### Part 2: Frontend Setup (React & Vite)

**1. Open a *new* terminal window and navigate to the frontend directory:**

```
cd marketing-planner-agent/frontend
```

**2. Install Node Dependencies:**

```
npm install
```

**3. Install Tailwind v4 & UI Libraries:**

*⚠️ Warning: Do not run `npx tailwindcss init`. Tailwind v4 does not use configuration files.*

```
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography
npm install lucide-react axios react-router-dom
```

**4. Clean Up Ghost Configurations (If Migrating):**

If you have leftover Tailwind v3 files in your `frontend` folder, delete them immediately to prevent Vite build crashes:

```
# Windows
del postcss.config.js tailwind.config.js

# Mac/Linux
rm postcss.config.js tailwind.config.js
```

---

## ▶️ Running the Project

You must run both the backend and frontend servers simultaneously in separate terminal windows.

### 1. Start the FastAPI Backend

In your `backend` terminal (with `venv` activated):

```
uvicorn app.main:app --reload --port 8000
```

*💡 The first time you run this, SQLAlchemy will automatically connect to MySQL and generate all your tables (`users`, `organizations`, `plans`). Additionally, Sentence Transformers will download the `all-MiniLM-L6-v2` embedding model to your local machine (this may take a few minutes).*

### 2. Start the React Frontend

In your `frontend` terminal:

```
npm run dev
```

Click the local link provided in the terminal (usually `http://localhost:5173`) to open the application in your browser.

---

## 🔄 Workflow Explanation

Understanding the internal lifecycle of the application is critical for debugging and future development. Here is exactly what happens when a user interacts with the system:

1. **Atomic Authentication:**  
   When a user registers, the FastAPI router creates the `Organization` and the `User` in a single database transaction. If the password hash fails, `db.rollback()` is called, ensuring no "Ghost Organizations" are saved without an admin user.

2. **Secure Context Ingestion:**  
   The user uploads a strategy PDF. The backend extracts the text, chunks it, embeds it using local HuggingFace models, and stores it in ChromaDB. Every vector is strictly tagged with the user's `org_id` to prevent cross-tenant data leaks.

3. **Multi-Agent Orchestration (The Brain):**  
   The user submits a Goal (e.g., "Plan a Q3 Campaign").  
   - **Agent 1 (Strategist):** Powered by `Groq (Llama 3.3 70B)`. Uses a custom tool to silently query the ChromaDB vector store, analyzes the retrieved context, and drafts a 3-point strategy.  
   - **Agent 2 (Scheduler):** Powered by `OpenRouter (Llama 3 8B)`. Takes the strategy and converts it into a strict day-by-day markdown execution schedule.  
   - **Agent 3 (Publisher):** Powered by `Groq`. Takes the markdown schedule, passes it through a custom Python Markdown-to-HTML tool, and outputs flawless semantic HTML.

4. **Database Auto-Save & History:**  
   Before returning the HTML to the frontend, the FastAPI controller intercepts the final output, generates a title, and saves it to the `plans` MySQL table linked to the user's `org_id`.

5. **Client-Side Rendering:**  
   React receives the response, updates the History Sidebar, and safely renders the raw HTML using `@tailwindcss/typography` (`prose` classes) while preserving the user's Dark Mode preference.

---

## ❗ Common Errors & Fixes (VERY IMPORTANT)

During development and setup, you might encounter specific framework-level errors. Here is a comprehensive guide to the exact errors you might see and how to resolve them instantly.

### Error 1: `ValueError: OPENAI_API_KEY is required`

* **Cause:** CrewAI falls back to OpenAI by default if it doesn't recognize your LLM provider format, or if the translation layer is missing.
* **Solution:** Ensure you are using the native `LLM` class with the `provider/model_name` format (e.g., `groq/llama-3.3-70b-versatile`). Also, you *must* have the adapter installed: run `pip install litellm` in your backend environment.

### Error 2: `litellm...OpenAIError: The model 'mixtral-8x7b-32768' has been decommissioned`

* **Cause:** Groq frequently updates its hardware (LPUs) and retires older open-source models.
* **Solution:** Update the `model` string in `backend/app/agents/planner_crew.py` to a supported model like `groq/llama-3.3-70b-versatile`. Check Groq's cloud console for currently active model IDs.

### Error 3: `failed to load config from vite.config.js (PostCSS error)`

* **Cause:** You are using the Tailwind v4 `@tailwindcss/vite` plugin, but Vite detected legacy v3 configuration files (`postcss.config.js` or `tailwind.config.js`) in your folder, causing a build conflict.
* **Solution:** Delete `postcss.config.js` and `tailwind.config.js` from your `frontend` directory. Tailwind v4 does not need them.

### Error 4: `sqlalchemy.orm.mapper.py... KeyError: 'plans'`

* **Cause:** When creating the `Plan` database model, you linked it to the `Organization` model using `back_populates="plans"`, but you forgot to define the reverse relationship in `organization.py`. SQLAlchemy requires a perfect two-way street.
* **Solution:** Open `backend/app/models/organization.py` and add: `plans = relationship("Plan", back_populates="organization")`.

### Error 5: UI Dark Mode turns OFF when navigating to a new page

* **Cause:** A naive `useEffect` hook that blindly calls a `toggle()` function. If the page is already dark from navigation, toggling it turns it off.
* **Solution:** Your `useEffect` must explicitly check `localStorage.theme` and use `classList.add('dark')` or `classList.remove('dark')`, never a raw toggle on mount.

### Error 6: AI Final Answer is just `"} "` or broken text

* **Cause:** Smaller LLMs (like an 8B model) have smaller context windows and weaker instruction-following capabilities. When fed a massive wall of raw HTML from a tool, they panic and break output formatting.
* **Solution:** Assign heavy formatting or tool-output-parsing tasks to your largest available model (e.g., Llama 3.3 70B on Groq) and write extremely strict `expected_output` prompts.

---

## 🧪 Testing Instructions

To ensure your local instance is fully operational, perform this standard testing flow:

1. **Authentication Test:** Navigate to `http://localhost:5173/register`. Create an organization (e.g., "Acme Corp"). You should be redirected to the Dashboard.
2. **Database Isolation Test:** Open a private browsing window. Register a *second* organization. Verify that the Dashboard history is completely empty for this new user.
3. **Knowledge Base Test:** On the Dashboard, upload a sample PDF (e.g., a dummy marketing report). Watch the backend terminal; you should see the sentence-transformers generating embeddings.
4. **Agent Execution Test:** Type a goal: "Create a 2-week launch schedule based on the uploaded report." Click Generate.
   * *Expected Output:* The backend terminal will show the Agentic loop (Strategist → Planner → Publisher). The UI will display a beautifully formatted HTML execution schedule within 20-30 seconds.

---

## 🔐 Environment Variables Reference

Ensure your backend `.env` file contains the following keys.

```
# Database Connection URL (SQLAlchemy format)
DATABASE_URL=mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>

# JWT Security Settings
SECRET_KEY=your_secure_random_string_here # ⚠️ NEVER expose this in production!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440 # 24 hours

# AI API Keys
GROQ_API_KEY=gsk_... # Required for Strategist & Publisher agents
OPENROUTER_API_KEY=sk-or-v1-... # Required for Execution Planner agent
```

---

## 📦 Build & Deployment

When you are ready to move from `localhost` to the live internet, follow this general deployment architecture:

### 1. Database Deployment (Managed Host)

* Provision a managed MySQL database on a platform like **Aiven**, **DigitalOcean**, or **AWS RDS**.
* Copy the provided connection string and update your production `DATABASE_URL`.

### 2. Backend Deployment (Render or Railway)

* Push your `backend` folder to GitHub.
* Connect the repo to **Render** (Web Service).
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
* Add all your `.env` variables to the Render environment dashboard.

### 3. Frontend Deployment (Vercel or Netlify)

* Push your `frontend` folder to GitHub.
* Connect the repo to **Vercel**.
* Vercel will auto-detect Vite.
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* ⚠️ *Crucial Step:* Update your frontend `axios` base URLs (e.g., inside `authService.js`) to point to your new live Render backend URL instead of `http://127.0.0.1:8000`.

---

## 🚀 Best Practices & Tips

* 💡 **Security:** Never commit your `.env` files to GitHub. Ensure `.gitignore` includes `backend/.env` and `frontend/.env`.
* 💡 **Rate Limiting:** Free tiers on Groq and OpenRouter have strict Requests-Per-Minute (RPM) limits. If your agents suddenly fail with `429 Too Many Requests`, you have hit the limit. Implement retry logic or upgrade to paid tiers for production.
* 💡 **Vector DB Persistence:** ChromaDB stores vectors locally by default. In a serverless cloud environment (like Render free tier), the local file system is wiped on restart. For true production, configure ChromaDB to use a persistent mounted disk or migrate to a managed vector database like Pinecone.

---

## 🛠 Troubleshooting Guide

If the application fails to respond, check these areas in order:

1. **Check Backend Logs First:** The FastAPI terminal (Uvicorn) is your source of truth. If a database query fails or an AI provider times out, the Python traceback will appear here.
2. **Check Browser Console:** Press `F12` in your browser. Look at the "Console" and "Network" tabs. If Axios is throwing `CORS` errors, ensure FastAPI's `CORSMiddleware` is configured to allow your frontend's domain.
3. **Clear Local Storage:** If you are stuck in an authentication loop, your JWT might be expired or corrupted. Clear your browser's local storage (Application tab in DevTools) and log in again.

---

## ❓ FAQ

**Q: Can I use standard OpenAI instead of Groq?**  
**A:** Yes! Simply change the LLM string in `planner_crew.py` to `openai/gpt-4o`, add your `OPENAI_API_KEY` to the `.env` file, and LiteLLM will route it automatically.

**Q: Why does the AI generation take 30 seconds?**  
**A:** You are running three separate LLM inferences sequentially, plus database reads and tool executions. This is normal for Agentic workflows. The UI loading spinner is designed to manage this user expectation.

---

## 🤝 Contribution Guide

Contributions are welcome! If you would like to add new Agents (e.g., an SEO Agent or a Social Media Copywriter Agent) or new Tools (e.g., a live URL scraper):

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewAgent`).
3. Commit your changes (`git commit -m 'Add SEO Agent'`).
4. Push to the branch (`git push origin feature/NewAgent`).
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
