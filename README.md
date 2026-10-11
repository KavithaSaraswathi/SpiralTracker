# 📚 SpiralTrack

> Mobile-first full-stack personal spiral-binding order and payment tracker for classmates' study materials. Built with React (Vite), Java Spring Boot 3, Spring Data JPA, and persistent MySQL database.

---

## 🌟 Real-World Use Case

I collect spiral-binding notes and books from classmates to get them bound at my uncle's shop. SpiralTrack provides two equally important views of the exact same data:
1. **Subject-Wise Management**: See total copies requested per subject (e.g., OS, GP, OOPS, DS), how many are delivered vs awaiting, and collections per subject.
2. **Student-Wise Management**: Track what each classmate ordered, what they paid, what they still owe, and whether they received their books.
3. **Delivery Tracking**: Independent pipeline (`ORDERED` → `READY` → `RECEIVED`). Updating delivery status **never** alters payment status.
4. **Payment Tracking**: Cash and GPay payments are retained as individual transactions, with exact `PENDING`, `PARTIAL`, `PAID`, and remaining-balance calculations.
5. **Completed History**: Fully paid and received orders can be archived without deleting them; archived records remain available on student and subject profiles.

---

## 🏗️ Architecture & Stack

```text
React (Vite) Mobile-First Frontend [Port 5173]
                 │
                 │ REST API / JSON (Axios)
                 ▼
Spring Boot 3.3.4 Layered Backend [Port 8080]
  ├── Controller (Student, Subject, Order, Dashboard)
  ├── Service (Business logic & payment calculations)
  ├── Repository (Spring Data JPA)
  └── Entity / DTO (Student, Subject, Order, Validation)
                 │
                 │ Hibernate ORM / JDBC
                 ▼
MySQL 8.0 Database [spiraltrack_db]
  ├── students (id, name, phone, created_at)
  ├── subjects (id, name, description, unit_price, created_at)
  ├── orders (id, student_id, subject_id, quantity, pages, unit_price, total_amount, amount_paid, order_date, delivery_status, payment_status, archived, completed_at, notes)
  └── payments (id, order_id, amount, payment_method, payment_date, notes, idempotency_key, created_at)
```

- **Database**: MySQL 8.0 (`spiraltrack_db`). Monetary values use `DECIMAL(10,2)` in MySQL and `BigDecimal` in Java.
- **Schema update**: Hibernate's configured `ddl-auto=update` adds archive fields and the `payments` table on backend startup. A one-time startup reconciliation creates an unclassified (`Not specified`) payment transaction for each legacy order with a non-zero `amount_paid` and no payment records; existing totals are preserved and Cash/GPay are never guessed.
- **Pricing**: Each subject has a fixed per-copy price. Order totals are calculated by the backend as `unit_price × quantity`; OS is fixed at ₹140 per copy. Set a price for existing unpriced subjects from their subject detail page before creating orders.
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Bean Validation, Maven.
- **Frontend**: React 18/19, Vite, React Router 6, Axios, Lucide Icons, Mobile-first touch-friendly CSS.

---

## ⚡ Prerequisites

1. **Java 21 or 17+**
2. **Apache Maven 3.8+**
3. **Node.js 18+ and npm**
4. **MySQL Server 8.0** running locally on port 3306

---

## 🗄️ MySQL Database Setup

1. Open MySQL CLI or MySQL Workbench:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS spiraltrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Note: The JDBC connection string in `application.properties` also contains `createDatabaseIfNotExist=true` and Hibernate uses `ddl-auto=update`, so tables are created automatically on launch).*

---

## ⚙️ Configuration & Environment Variables

Edit `backend/src/main/resources/application.properties` or provide environment variables:

| Variable | Description | Default Value |
|---|---|---|
| `DB_URL` | JDBC Connection URL | `jdbc:mysql://localhost:3306/spiraltrack_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | MySQL Username | `root` |
| `DB_PASSWORD` | MySQL password | Set this to your local MySQL password; credentials are not committed. |
| `SEED_DATA` | Load initial sample data | `false` |

To set your password in PowerShell before running:
```powershell
$env:DB_PASSWORD = "YOUR_MYSQL_PASSWORD"
```

---

## 🚀 How to Run the Application

### 1. Start the Backend (Spring Boot)

```powershell
cd backend
mvn spring-boot:run
```
*(Or with optional sample seed data: `mvn spring-boot:run -Dspring-boot.run.arguments="--spiraltrack.seed.enabled=true"`)*

The backend will start at: `http://localhost:8080`

### 2. Start the Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start at: `http://localhost:5173`

---

## 🚀 Render Deployment

The repository includes a Render Blueprint (`render.yaml`) for the static React frontend and containerized Spring Boot API. Render can deploy these services, but this application requires **MySQL**: Render's managed relational database is PostgreSQL, which is not compatible with this app.

Before creating the Blueprint:

1. Provision a hosted MySQL database with a provider that accepts connections from Render. Use the same region as the API where possible.
2. In Render, choose **New > Blueprint** and connect `KavithaSaraswathi/SpiralTracker` on the `main` branch.
3. Enter the database's JDBC URL, username, and password when prompted for `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. Keep credentials in Render's environment-variable settings; never commit them.
4. Review the selected Render service plans and any database-provider charges before creating resources.

The Blueprint builds the API from `backend/Dockerfile`, builds and publishes the frontend from `frontend`, configures the frontend API URL and API CORS origin from the Render service hostnames, and checks API health at `/actuator/health`. Keep `SEED_DATA=false` to start with an empty database. Hibernate creates or updates the tables on API startup.

The deployment is not usable until a hosted MySQL database is provisioned and its connection values are configured. Do not set `DB_URL` to `localhost`; from Render, that would refer to the API container, not your computer or database provider.

---

## 📱 Accessing from Your Mobile Phone

1. Connect your phone to the same Wi-Fi network as your computer.
2. Find your computer's local IP address (e.g. `192.168.1.4`).
3. On your phone's browser, open:
   ```text
   http://192.168.1.4:5173
   ```
- Touch targets are calibrated at 48px minimum.
- Form input fonts are 16px to prevent unwanted iOS/Android auto-zoom.
- Thumb-friendly bottom navigation bar: **Home**, **Subjects**, **Students**, **Orders**, **History**.

---

## 🌐 Complete REST API Endpoints

### Students
- `GET /api/students` - All students with summary metrics
- `GET /api/students/{id}` - Student profile with full metrics
- `GET /api/students/search?name={name}` - Search students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Subjects
- `GET /api/subjects` - All subjects with total copies, received, and balance
- `GET /api/subjects/{id}` - Subject details
- `GET /api/subjects/search?name={name}` - Search subjects
- `POST /api/subjects` - Create subject (`name`, optional `description`, required `unitPrice`)
- `PUT /api/subjects/{id}` - Update subject details and required `unitPrice`
- `DELETE /api/subjects/{id}` - Delete subject

### Orders
- `GET /api/orders` - Active orders (newest first)
- `GET /api/orders/history` - Archived orders; optional `student`, `subject`, `fromDate`, `toDate`, and `paymentMethod` filters
- `GET /api/orders/history/student/{studentId}` - Archived orders for a student
- `GET /api/orders/history/subject/{subjectId}` - Archived orders for a subject
- `GET /api/orders/{id}` - Order details
- `GET /api/orders/student/{studentId}` - Orders for a student
- `GET /api/orders/subject/{subjectId}` - Orders for a subject
- `GET /api/orders/pending` - All orders with outstanding balance
- `GET /api/orders/payment-status/{status}` - Filter: `PENDING`, `PARTIAL`, `PAID`
- `GET /api/orders/delivery-status/{status}` - Filter: `ORDERED`, `READY`, `RECEIVED`
- `GET /api/orders/search?q={query}` - Search by student or subject name
- `POST /api/orders` - Create order (pages optional, default quantity 1; total is derived from the subject price)
- `PUT /api/orders/{id}` - Update order
- `POST /api/orders/{id}/payments` - Record a Cash/GPay transaction (`amount`, `paymentMethod`, optional `notes`, `idempotencyKey`)
- `POST /api/orders/{id}/archive` - Move an order to History; backend requires `PAID` and `RECEIVED`
- `PATCH /api/orders/{id}/payment` and `POST /api/orders/{id}/record-payment` - Legacy compatibility; payments recorded through these older methods remain classified as `Not specified`
- `PATCH /api/orders/{id}/delivery-status` - Update delivery status (ORDERED/READY/RECEIVED) independently of payment
- `DELETE /api/orders/{id}` - Delete an active order (historical orders cannot be deleted)

### Dashboard
- `GET /api/dashboard` - Active order/delivery metrics, all-time collected/outstanding totals, Cash/GPay totals, and historical order/copy counts
