# TREMON - HSE - Industrial Safety Management Dashboard

## 📖 Project Overview
**TREMON - HSE** is a modern, minimalist Internal Dashboard built for factory safety management. Designed with a "Database-First" approach, it digitizes the tracking of chemical documents (MSDS/CSDS), automated expiry alerts, and safety markers (fire extinguishers, emergency exits) across multiple workshops.

## ✨ Key Features
*   **Chemical & Document Management**: Tracks global `cas_number`, auto-calculates `msds_expiry` (+3 years from the published date), and manages `hazard_logo` GHS pictograms using array data types.
*   **Direct Cloud Storage**: Directly uploads and serves PDF documents via Supabase Storage (`chemical-docs` bucket).
*   **Interactive SVG Map & Clustering**: Visualizes safety markers and chemical locations using specific `x` and `y` coordinates. Automatically clusters multiple chemicals at the same location into a "Folder" icon.
*   **Role-Based Access Control (RBAC)**: Secure access using Supabase Auth. Only Admin users can upload files or modify chemical and safety data.

## 🛠 Tech Stack
*   **Frontend**: React JS, Vite, Tailwind CSS, Lucide React.
*   **Backend**: Python, FastAPI, Uvicorn.
*   **Database & Storage**: Supabase (PostgreSQL), Supabase Auth, Supabase Storage.
*   **Deployment**: GitHub, Render.com.

---

## 📐 System Architecture Diagrams

### 1. System Architecture Diagram
This diagram illustrates the 3-Tier Architecture of the application.

```mermaid
graph TD
    subgraph "Phase 4: Frontend (Local / Render.com)"
        UI[React JS UI]
        Style[Tailwind CSS + Lucide React]
        Map[SVG Workshop Map]
        UI --> Style
        UI --> Map
    end

    subgraph "Phase 3: Backend (Python FastAPI)"
        API[FastAPI Server]
        Auth_Middleware[Auth & Permissions]
        API --- Auth_Middleware
    end

    subgraph "Phase 2: Cloud Database & Storage (Supabase)"
        DB[(PostgreSQL Database)]
        Storage[Bucket: chemical-docs]
        SupabaseAuth[Supabase Auth]
    end

    %% Communication Flow
    UI <-->|HTTP/JSON API Calls| API
    API <-->|Read/Write Data| DB
    API -->|Upload PDF files| Storage
    UI <-->|JWT Token Auth| SupabaseAuth
```

### 2. Entity-Relationship Diagram (ERD)
The core database schema featuring strict `NOT NULL` constraints, isolated `x` and `y` coordinates, and automated timestamps.

```mermaid
erDiagram
    workshops ||--o{ chemicals : "contains"
    workshops ||--o{ safety_markers : "contains"
    auth_users ||--|| profiles : "1-to-1 link"

    workshops {
        uuid id PK
        text name "NOT NULL, UNIQUE"
        timestamptz created_at
    }

    profiles {
        uuid id PK "FK to auth.users"
        text full_name "NOT NULL"
        text role "NOT NULL, DEFAULT 'viewer'"
        timestamptz created_at
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
        date msds_expiry "GENERATED ALWAYS (+3 years)"
        float8 x "NOT NULL"
        float8 y "NOT NULL"
        timestamptz created_at "NOT NULL"
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
        timestamptz created_at "NOT NULL"
    }
```

### 3. Data Flow Diagram (Upload Flow)
The sequence of adding a new chemical, parsing the `hazard_logo` array, uploading PDFs to the `chemical-docs` bucket, and inserting data.

```mermaid
sequenceDiagram
    participant Admin as Admin User (React UI)
    participant API as FastAPI Backend
    participant Storage as Supabase Storage (chemical-docs)
    participant DB as Supabase DB (chemicals)

    Admin->>API: 1. POST Form Data + 2 PDF Files
    activate API
    
    API->>API: 2. Parse JSON Data (hazard_logo)
    
    API->>Storage: 3. Upload msds_file.pdf to /msds
    Storage-->>API: Return Success (msds_path)
    
    API->>Storage: 4. Upload csds_file.pdf to /csds
    Storage-->>API: Return Success (csds_path)
    
    API->>DB: 5. INSERT chemical data + msds_path + csds_path
    DB-->>API: Return new row data
    
    API-->>Admin: 6. Response JSON "Chemical added successfully!"
    deactivate API
```

### 4. Authentication Flow
The security mechanism using Supabase Auth JWT Tokens to protect the API endpoints.

```mermaid
sequenceDiagram
    participant User as Admin/Viewer (React UI)
    participant SupabaseAuth as Supabase Auth Service
    participant API as FastAPI Backend

    User->>SupabaseAuth: 1. Input Email & Password (signInWithPassword)
    activate SupabaseAuth
    SupabaseAuth-->>User: 2. Return JWT Access Token + User Info
    deactivate SupabaseAuth

    User->>API: 3. Call API (e.g., /add-chemical) + Header: Bearer <JWT Token>
    activate API
    API->>SupabaseAuth: 4. Verify JWT Token validity
    SupabaseAuth-->>API: 5. Token is Valid (Return User ID)
    API-->>User: 6. Process request & Return Data
    deactivate API
```

### 5. Frontend React Component Tree
The Component-Based Architecture splitting the UI into manageable views.

```mermaid
graph TD
    App[App Component<br/>Main Container & State Manager]
    
    %% UI Sub-components
    Sidebar[Sidebar Component<br/>Navigation Menu]
    Header[Header Component<br/>Top Bar & Notifications]
    
    %% Page Views
    DashboardView[Dashboard View<br/>Overview & Alerts]
    WorkshopView[Workshop View<br/>Interactive SVG Map]
    ChemicalsView[Chemicals View<br/>Data Table & Print]
    AuditView[Audit View<br/>Checklists]
    PlansView[Plans View<br/>Schedules]

    %% Connections
    App --> Sidebar
    App --> Header
    App --> DashboardView
    App --> WorkshopView
    App --> ChemicalsView
    App --> AuditView
    App --> PlansView
```

---

