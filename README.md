# TREMON - HSE - Industrial Safety Management Dashboard

## 📖 Project Overview
**TREMON - HSE** is a modern, minimalist Internal Dashboard built for factory safety management. Designed with a "Database-First" approach, it digitizes the tracking of chemical documents (MSDS/CSDS), automated expiry alerts, and safety markers (fire extinguishers, emergency exits, electrical cabinets) across multiple workshops.

## ✨ Key Features
*   **Chemical & Document Management**: Tracks global `cas_number`, auto-calculates `msds_expiry` (+3 years from the `published_date`), and manages `hazard_logo` GHS pictograms using array data types to allow dynamic UI selections.
*   **Direct Cloud Storage**: Directly uploads and serves PDF documents via Supabase Storage (`chemical-docs` bucket) secured by custom Policies.
*   **Interactive SVG Map & Clustering**: Visualizes safety markers and chemical locations using specific `x` and `y` coordinates. Automatically clusters multiple chemicals at the same location into a "Folder" icon for a clean UI.
*   **Role-Based Access Control (RBAC)**: Secure access using Supabase Auth. Only Admin users can upload files or modify chemical and safety data.

## 🛠 Tech Stack
*   **Frontend**: React JS, Vite, Tailwind CSS, Lucide React (Component-Based Architecture).
*   **Backend**: Python, FastAPI, Uvicorn (Procedural API Endpoints).
*   **Database & Storage**: Supabase (PostgreSQL), Supabase Auth, Supabase Storage.
*   **Deployment**: GitHub, Render.com.

---

## 📐 System Architecture Diagrams

### 1. System Architecture Diagram
This diagram illustrates the 5-Phase Architecture from Local Development to Cloud Deployment, featuring color-coded zones for clarity.



```mermaid
flowchart LR
    %% Color definitions for specific areas
    classDef frontend fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81;
    classDef backend fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d;
    classDef cloud fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f;
    classDef deploy fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#7f1d1d;
    classDef phase1 fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,stroke-dasharray: 5 5;

    %% Phase 1 wrapping Phase 3 and 4
    subgraph LocalEnv ["💻 Phase 1: Local Environment Setup"]
        direction TB
        
        UI["Phase 4: Frontend (React)<br/>"]:::frontend
        API["Phase 3: Backend (FastAPI)<br/>"]:::backend
        
        UI <-->|HTTP API Calls| API
    end

    %% Phase 2: Cloud Database & Storage
    subgraph P2 ["☁️ Phase 2: Supabase Cloud"]
        direction TB
        Auth["Supabase Auth"]:::cloud
        DB[("PostgreSQL DB")]:::cloud
        Storage["Storage<br/>(chemical-docs)"]:::cloud
    end

    %% Phase 5: Cloud Deployment
    subgraph P5 ["🚀 Phase 5: Cloud Deployment"]
        direction TB
        Git["GitHub"]:::deploy
        Render["Render.com"]:::deploy
        
        Git -.->|Auto Deploy| Render
    end

    %% Data connections
    UI <-->|Verify JWT Token| Auth
    API <-->|Read/Write Data| DB
    API --->|Upload PDF files| Storage

    %% Deployment connections
    LocalEnv ===>|Push Source Code| Git
```


### 2. Entity-Relationship Diagram (ERD)
The core database schema featuring strict `NOT NULL` constraints, separated `x` and `y` coordinates, dynamic arrays, and automated timestamps via Postgres Triggers.


```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': { 
    'primaryColor': '#ffffff', 
    'primaryBorderColor': '#cbd5e1', 
    'primaryTextColor': '#1e293b', 
    'lineColor': '#475569', 
    'attributeBackgroundColorOdd': '#f8fafc', 
    'attributeBackgroundColorEven': '#ffffff'
  }
}}%%
erDiagram
    workshops ||--o{ chemicals : "contains"
    workshops ||--o{ safety_markers : "contains"
    auth_users ||--|| profiles : "1-to-1 link"

    workshops {
        uuid id PK
        text name "NOT NULL, UNIQUE"
        timestamptz created_at "DEFAULT now()"
    }

    profiles {
        uuid id PK "FK to auth.users"
        text full_name "NOT NULL"
        text role "NOT NULL, DEFAULT 'viewer'"
        timestamptz created_at "DEFAULT now()"
    }

    chemicals {
        uuid id PK
        uuid workshop_id FK "NOT NULL"
        text name "NOT NULL"
        text other_name "NULLABLE"
        text cas_number "NOT NULL"
        text msds_path "NOT NULL"
        text csds_path "NOT NULL"
        text_array hazard_logo "NOT NULL, DEFAULT '{}'"
        date published_date "NOT NULL"
        date newest_published_date "NOT NULL"
        date msds_expiry "GENERATED ALWAYS"
        float8 x "NOT NULL"
        float8 y "NOT NULL"
        timestamptz created_at "DEFAULT now()"
        timestamptz updated_at "Trigger Auto Update"
    }

    safety_markers {
        uuid id PK
        uuid workshop_id FK "NOT NULL"
        text type "NOT NULL"
        text location_name "NOT NULL"
        text manager_name "NOT NULL"
        text manager_phone "NOT NULL"
        text schedule "NOT NULL"
        float8 x "NOT NULL"
        float8 y "NOT NULL"
        timestamptz created_at "DEFAULT now()"
    }
```


### 3. Data Flow Diagram (Upload Flow)
The sequence of adding a new chemical, parsing the `hazard_logo` array, uploading PDFs to the `chemical-docs` bucket, and inserting data.



```mermaid
sequenceDiagram
    autonumber
    
    %% Using rgba() for transparent backgrounds to support Light/Dark mode readability
    box rgba(99, 102, 241, 0.15) "Phase 4: Frontend"
        participant Admin as Admin (React UI)
    end
    
    box rgba(34, 197, 94, 0.15) "Phase 3: Backend"
        participant API as FastAPI Server
    end
    
    box rgba(245, 158, 11, 0.15) "Phase 2: Supabase Cloud"
        participant Storage as Storage (chemical-docs)
        participant DB as Database (chemicals)
    end

    Admin->>API: POST Form Data + 2 PDF Files
    activate API
    
    API->>API: Parse JSON Data (hazard_logo)
    
    API->>Storage: Upload msds_file.pdf to /msds
    Storage-->>API: Return Success (msds_path)
    
    API->>Storage: Upload csds_file.pdf to /csds
    Storage-->>API: Return Success (csds_path)
    
    API->>DB: INSERT chemical data + msds_path + csds_path
    DB-->>API: Return new row data
    
    API-->>Admin: Response JSON "Chemical added successfully!"
    deactivate API
```



### 4. Authentication Flow
The security mechanism using Supabase Auth JWT Tokens to protect the API endpoints and Storage buckets.



```mermaid
sequenceDiagram
    autonumber
    
    %% Using rgba() for transparent backgrounds
    box rgba(99, 102, 241, 0.15) "Phase 4: Frontend"
        participant User as Admin/Viewer (React UI)
    end
    
    box rgba(245, 158, 11, 0.15) "Phase 2: Supabase Cloud"
        participant SupabaseAuth as Supabase Auth
    end
    
    box rgba(34, 197, 94, 0.15) "Phase 3: Backend"
        participant API as FastAPI Server
    end

    User->>SupabaseAuth: Input Email & Password (signInWithPassword)
    activate SupabaseAuth
    SupabaseAuth-->>User: Return JWT Access Token + User Info
    deactivate SupabaseAuth

    User->>API: Call API (e.g., /add-chemical) + Header: Bearer <JWT Token>
    activate API
    API->>SupabaseAuth: Verify JWT Token validity
    SupabaseAuth-->>API: Token is Valid (Return User ID)
    API-->>User: Process request & Return Data
    deactivate API
```



### 5. Frontend React Component Tree
The ultra-compact Component-Based Architecture splitting the UI into manageable views corresponding to the codebase structure.



```mermaid
flowchart LR
    %% 4. Main Container
    subgraph Container ["4. MAIN APP CONTAINER"]
        App((App))
    end

    %% 2. UI Components
    subgraph UI ["2. UI SUB-COMPONENTS"]
        App --> Sidebar
        App --> Header
    end

    %% 3. Page Views
    subgraph Views ["3. PAGE VIEWS"]
        App --> DashboardView
        App --> WorkshopView
        App --> ChemicalsView
        App --> AuditView["Audit (Placeholder)"]
        App --> PlansView["Plans (Placeholder)"]
    end

    %% 1. Data Constants
    subgraph Data ["1. DATA CONSTANTS"]
        Mock[(MOCK_DATA)] -.-> WorkshopView
        Mock -.-> ChemicalsView
        Mock -.-> DashboardView
    end

    %% Styling to make it compact
    classDef default fill:#fff,stroke:#cbd5e1,stroke-width:1px,color:#0f172a;
    classDef container fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
    class App container;
```



---
