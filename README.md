# Full-Stack AI Engineer Roadmap

<p align="center">
  <strong>A personal, interactive roadmap for becoming a Full-Stack AI Engineer.</strong>
  <br>
  Plan → Learn → Track → Build → Deploy → Improve
</p>

<p align="center">
  <img src="https://img.shields.io/badge/379-Roadmap%20Nodes-blue" alt="379 Roadmap Nodes">
  <img src="https://img.shields.io/badge/10-Major%20Sections-purple" alt="10 Major Sections">
  <img src="https://img.shields.io/badge/HTML-CSS-JavaScript-orange" alt="HTML CSS JavaScript">
  <img src="https://img.shields.io/badge/GitHub-Pages-black" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/License-Personal-green" alt="Personal">
</p>

---

## Overview

This project is an interactive **Full-Stack AI Engineer Roadmap and Progress Tracker**.

Instead of keeping a roadmap as a static image, document, spreadsheet, or handwritten checklist, this project turns the roadmap into a personal application where every topic can be managed directly from the website.

The roadmap covers the complete path from programming fundamentals to AI engineering, production deployment, DevOps, testing, tools, and professional engineering practices.

The original roadmap contains:

* **379 total nodes**
* **10 major sections**
* **289 leaf-level learning topics**
* Programming foundations
* Frontend development
* Backend development
* Databases
* AI & Machine Learning
* Cloud & Deployment
* CI/CD & DevOps
* Testing & Quality
* Essential Tools
* Soft Skills & Professional Practices

---

# Roadmap

```text
FULL-STACK AI ENGINEER
│
├── 1. CORE PROGRAMMING
│   ├── Python
│   ├── JavaScript & TypeScript
│   ├── SQL
│   └── Git
│
├── 2. FRONTEND DEVELOPMENT
│   ├── HTML5
│   ├── CSS3
│   ├── React
│   └── Next.js
│
├── 3. BACKEND DEVELOPMENT
│   ├── FastAPI
│   ├── REST APIs
│   ├── GraphQL
│   ├── Webhooks
│   ├── Real-Time Communication
│   ├── Authentication & Authorization
│   ├── Background Jobs
│   └── API Security
│
├── 4. DATABASES
│   ├── PostgreSQL
│   ├── pgvector
│   └── Redis
│
├── 5. AI & MACHINE LEARNING
│   ├── Machine Learning
│   ├── Deep Learning
│   ├── LLMs
│   ├── Prompt Engineering
│   ├── RAG
│   ├── Embeddings
│   ├── AI Agents
│   ├── Evaluation
│   ├── Fine-Tuning
│   └── AI Application Engineering
│
├── 6. CLOUD & DEPLOYMENT
│   ├── Docker
│   ├── AWS
│   └── Kubernetes
│
├── 7. CI/CD & DEVOPS
│   ├── GitHub Actions
│   ├── Infrastructure as Code
│   ├── Terraform
│   ├── Observability
│   └── Production Operations
│
├── 8. TESTING & QUALITY
│   ├── Unit Testing
│   ├── Integration Testing
│   ├── API Testing
│   ├── End-to-End Testing
│   └── AI-Specific Testing
│
├── 9. ESSENTIAL TOOLS
│   ├── VS Code
│   ├── Linux / Shell
│   ├── API Development & Debugging
│   ├── Prototyping
│   ├── Secret Management
│   └── AI Experiment Tracking
│
└── 10. SOFT SKILLS & PROFESSIONAL PRACTICES
    ├── Communication
    ├── Problem-Solving & Systems Thinking
    ├── Collaboration
    ├── Business & Product Sense
    └── Continuous Learning
```

---

# Why This Project Exists

A normal roadmap tells you **what to learn**.

This project is designed to help answer:

> **What should I learn, what have I completed, what am I working on, and how has my roadmap changed over time?**

The roadmap therefore works as both:

**Learning roadmap + Progress tracker + Personal knowledge management system**

---

# Features

## Interactive Roadmap

Manage the roadmap directly from the website.

* Expand and collapse sections
* Navigate through the complete hierarchy
* Search topics
* Filter topics
* Switch between tree and card layouts
* Reorder roadmap items
* Move items within the hierarchy

## Topic Management

Every learning topic can be managed without editing source code.

You can:

* Edit topic names
* Change status
* Set difficulty
* Set priority
* Add notes
* Add resources
* Set target dates
* Add new topics
* Add new sections
* Delete topics
* Reorganize the roadmap

The goal is simple:

```text
Open website
    ↓
Change roadmap
    ↓
Save
    ↓
Continue learning
```

No manual editing of JavaScript is required.

---

# Progress Tracking

The application tracks your progress across the roadmap.

It provides:

* Overall completion percentage
* Completed topics
* In-progress topics
* Not-started topics
* Section-level progress
* Difficulty information
* Priority information

This lets the roadmap evolve with your actual learning progress.

---

# GitHub Persistence

One of the most important parts of this project is that the roadmap is not intended to remain trapped inside one browser.

The canonical roadmap data is stored in:

```text
roadmap.json
```

The basic architecture is:

```text
                 YOUR WEBSITE
                      │
                      ▼
                Edit roadmap
                      │
                      ▼
                 roadmap.json
                      │
                      ▼
                    GitHub
                      │
               ┌──────┴──────┐
               │             │
          Git history    Current data
               │             │
               └──────┬──────┘
                      ▼
                GitHub Pages
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        Laptop       PC         Phone
```

This means the roadmap data can be retrieved from your GitHub repository rather than relying only on one computer.

---

# Version History

Your roadmap is maintained through Git commits.

For example:

```text
Version 1
Initial roadmap

        ↓

Version 2
Completed Python fundamentals

        ↓

Version 3
Added FastAPI resources

        ↓

Version 4
Updated RAG topics

        ↓

Version 5
Reorganized AI section

        ↓

Current Version
```

This gives your roadmap a history instead of continuously overwriting your previous work.

You can inspect the changes through GitHub and use the application's version/history functionality where supported.

---

# Cross-Device Access

Once the application is deployed through GitHub Pages, you can access the same website from different devices.

For example:

```text
Laptop
    │
    ├── Open roadmap
    │
    └── Update progress
           │
           ▼
         GitHub
           │
           ▼
         Phone
           │
           └── Open the same website
```

The important distinction is:

### Viewing

You can open the deployed website and view the public roadmap.

### Editing

To make changes that are written back to your GitHub repository, the browser needs GitHub authorization.

A GitHub token is used for this write operation.

---

# GitHub Token

The application can use a **GitHub Fine-Grained Personal Access Token** to authenticate repository write operations.

The recommended configuration is:

```text
Repository access
    ↓
Only selected repositories
    ↓
Your roadmap repository
```

And only the permissions required by the application should be granted.

For this project, repository contents write access is the relevant permission.

## Security

**Never put your token inside the repository.**

Do not write:

```javascript
const token = "github_pat_...";
```

inside:

```text
script.js
```

Do not commit a token into GitHub.

The token should remain in the browser/device where you configure it.

If a token is accidentally exposed, revoke it immediately from GitHub and create a replacement.

---

# Does This Cost Money?

The application itself does not use:

* OpenAI API
* OpenAI API keys
* Paid AI APIs
* A database server
* A paid backend
* A paid hosting service

The basic setup uses:

```text
GitHub
+
GitHub Repository
+
GitHub Pages
```

GitHub provides GitHub Pages as part of its available repository/hosting features, subject to GitHub's current plan and usage limits.

For a personal roadmap of this size, the roadmap data itself is extremely small compared with GitHub Pages' documented limits.

---

# Technology Stack

The project intentionally uses a simple architecture.

| Technology            | Purpose                    |
| --------------------- | -------------------------- |
| HTML5                 | Application structure      |
| CSS3                  | UI and responsive design   |
| JavaScript            | Application logic          |
| JSON                  | Roadmap data               |
| Browser Local Storage | Local preferences/state    |
| GitHub Contents API   | Persistent roadmap updates |
| Git                   | Version history            |
| GitHub Pages          | Website hosting            |

No framework is required to run the application.

---

# Project Structure

```text
full-stack-ai-roadmap/
│
├── index.html
│       Main application page
│
├── style.css
│       Application styling and responsive layout
│
├── script.js
│       Application logic, editing, persistence,
│       GitHub synchronization and version functionality
│
├── roadmap.json
│       Canonical roadmap data
│
├── roadmap-data.js
│       Original embedded roadmap fallback
│
└── README.md
        Project documentation
```

---

# Deployment

## 1. Create a GitHub Repository

Create a repository such as:

```text
full-stack-ai-roadmap
```

Upload the project files to the repository root.

The structure should be:

```text
full-stack-ai-roadmap
│
├── index.html
├── style.css
├── script.js
├── roadmap.json
├── roadmap-data.js
└── README.md
```

---

## 2. Enable GitHub Pages

In the repository:

```text
Settings
    ↓
Pages
    ↓
Build and deployment
    ↓
Source
    ↓
Deploy from a branch
    ↓
main
    ↓
/ (root)
    ↓
Save
```

GitHub will provide the deployed website address.

It will generally look like:

```text
https://YOUR-USERNAME.github.io/full-stack-ai-roadmap/
```

Bookmark this URL.

This becomes your normal entry point.

---

# Daily Workflow

Once deployed, your workflow becomes very simple.

```text
Open your roadmap URL
        ↓
Choose a topic
        ↓
Study / work on it
        ↓
Update the topic
        ↓
Save
        ↓
GitHub stores the change
        ↓
Continue
```

You should not need to modify:

```text
script.js
index.html
style.css
```

just because your learning progress changed.

Your roadmap itself belongs in:

```text
roadmap.json
```

---

# Local vs GitHub Version

The project can also be opened locally.

However, there is an important difference.

### Local

```text
index.html
    ↓
Browser
    ↓
Local application
```

This is useful for testing.

### GitHub Pages

```text
GitHub Repository
    ↓
GitHub Pages
    ↓
Public website
```

This is the recommended version for your actual daily use.

For cross-device persistence, use the deployed GitHub Pages version.

---

# Data Safety

The GitHub repository acts as the long-term source of your roadmap.

Because Git stores commit history, accidental changes can be investigated through previous commits.

The application also provides local editing functionality such as:

* Undo
* Redo
* Reset
* Import
* Export

For additional safety, you can periodically export your roadmap JSON as a backup.

---

# Recommended GitHub Workflow

Use meaningful commit messages when possible.

Examples:

```text
Initial roadmap

Completed Python fundamentals

Updated backend roadmap

Added RAG resources

Completed PostgreSQL

Reorganized AI engineering section

Added interview preparation topics
```

Over time, your GitHub repository becomes a record of your learning progression.

---

# Roadmap Philosophy

The roadmap is intentionally broad.

The goal is not:

> Learn every technology that exists.

The goal is:

> Build strong fundamentals, become capable of building complete AI-powered applications, and understand enough of the surrounding engineering stack to take those applications into production.

The intended progression is:

```text
Programming
     ↓
Frontend
     ↓
Backend
     ↓
Databases
     ↓
AI / ML
     ↓
Cloud
     ↓
DevOps
     ↓
Testing
     ↓
Tools
     ↓
Professional Engineering
```

---

# Current Scope

The roadmap is organized into **10 major areas**:

1. Core Programming
2. Frontend Development
3. Backend Development
4. Databases
5. AI & Machine Learning
6. Cloud & Deployment
7. CI/CD & DevOps
8. Testing & Quality
9. Essential Tools
10. Soft Skills & Professional Practices

The complete source roadmap contains **379 nodes** across these sections.

---

# Future Direction

The application is intentionally structured so the roadmap can evolve.

Possible future extensions include:

* Learning streaks
* Calendar integration
* Study sessions
* Topic time tracking
* More detailed analytics
* Project tracking
* Interview preparation tracking
* Resume/project mapping
* Skill-to-project relationships
* Learning notes attached to topics

The roadmap itself should remain the source of truth.

---

# Important Notes

* Do not commit GitHub tokens.
* Use a Fine-Grained Personal Access Token.
* Restrict the token to the roadmap repository.
* Grant only the permissions required.
* Use GitHub Pages for the deployed version.
* Keep `roadmap.json` as the persistent roadmap data.
* Use Git history as the long-term version history.
* Do not manually modify application code just to update your learning progress.

---

# Author

**Yeshwanth Gujja**

Computer Science & Engineering

Building toward:

**Full-Stack AI Engineer**

---

<p align="center">
  <strong>Learn → Build → Ship → Measure → Improve</strong>
</p>