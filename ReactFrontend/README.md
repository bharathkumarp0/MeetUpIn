# MeetUpIn — Frontend

React frontend for the MeetUpIn activity platform.

## Tech Stack
- **React 18** — UI framework
- **Vite** — build tool & dev server
- **Vanilla CSS** — custom design system (no UI library needed)
- **Fetch API** — HTTP calls to Spring Boot backend

## Project Structure
```
src/
  App.jsx       ← All components in one file (easy to learn)
  index.css     ← Complete design system
  main.jsx      ← Entry point
index.html
vite.config.js  ← Dev proxy to backend
package.json
```

## Setup

### 1. Start your Spring Boot backend first
```bash
# Make sure MySQL is running and backend is up on port 8080
cd path/to/backend
./mvnw spring-boot:run
```

### 2. Install and run frontend
```bash
cd MeetUpIn-Frontend
npm install
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

The Vite dev server **proxies** all `/api`, `/activities`, `/joinrequests` requests to `localhost:8080` automatically — no CORS issues!

## Pages / Features

| Page | Route (internal) | Description |
|------|-----------------|-------------|
| Home/Explore | `home` | Browse all activities, filter by category, search |
| Activity Detail | `activity` | View details, join request, host approval panel |
| Create Activity | `create` | Form to create new activity (JWT required) |
| Dashboard | `dashboard` | Your hosted activities + your join requests |
| Login | `login` | JWT-based login |
| Register | `register` | Register + auto-login |

## API Endpoints Used

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/users/register` | Register |
| POST | `/api/users/login` | Login → JWT |
| GET | `/activities/getallactivitys` | All activities |
| GET | `/activities/{id}` | Single activity |
| POST | `/activities/` | Create activity (auth) |
| GET | `/activities/created/{userId}` | My activities |
| POST | `/joinrequests/` | Request to join |
| GET | `/joinrequests/activity/{id}` | Requests for activity |
| GET | `/joinrequests/user/{id}` | My requests |
| PUT | `/joinrequests/{id}/approve` | Approve request |
| PUT | `/joinrequests/{id}/reject` | Reject request |

## Adding CORS to Spring Boot (Required)

Add this to `SecuirtyConfig.java` inside `securityFilterChain`:

```java
.cors(cors -> cors.configurationSource(request -> {
    var config = new org.springframework.web.cors.CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

Or use the Vite proxy (already configured) to avoid CORS entirely during development.
