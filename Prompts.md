# Prompts

## Prompt Strategy Used

For this project, I adopted a highly structured, iterative prompt strategy focusing on **incremental feature delivery and strict state preservation**.

### 1. Minimal Initialization
Instead of scaffolding the entire full-stack app at once, the prompts mandated a minimal initial skeleton:
- Created empty frontend/backend folders.
- Prevented unnecessary boilerplate (e.g., Redux, databases, Docker).
- **Goal:** Ensure a clear, lightweight foundation.

### 2. Component-by-Component Isolation
Each prompt targeted a specific architectural component:
- **Phase 1 (Frontend):** React + Vite initialization, routing placeholders, and responsive CSS.
- **Phase 2 (Backend):** Node.js + Express setup, attaching `socket.io` to the HTTP server, and basic health endpoints.
- **Phase 3 (Integration):** Adding the `socket.io-client`, disabling auto-connect, and integrating basic emit/listen patterns.
- **Goal:** Maintain tight control over logic loops and avoid sprawling, untestable code injections.

### 3. Stateful Feature Additions
Features were introduced one by one with strict constraints:
- **Session Identity:** Prompts mandated username collection *before* socket connection, enforcing frontend barriers and backend middleware validation.
- **Typing Indicators:** Prompts mandated client-side timeouts and server-side tracking (using a `Set` of active typists).
- **Room Segregation:** Prompts specified exactly two rooms ("General" and "Tech Support"), mandating that room memberships dynamically clear out old state on both the client (React state) and the server (Socket.io rooms).
- **Goal:** Guarantee that complex state transitions (like switching rooms) don't bleed previous context into new contexts.

### 4. Verification and Security Constraints
- Every prompt explicitly included negative constraints: *"Do not build X yet," "Do not add database Y," "Do not deploy."*
- Required programmatic tests using concurrent Socket.io clients to verify strict room isolation and correct delivery of events.
- **Goal:** Ensure code correctness and prevent feature creep or insecure configurations.

### 5. Final Audit and Documentation
The final prompts demanded an exhaustive, read-only audit of configuration files, environment variable parametrizations (`process.env.CLIENT_URL`, `import.meta.env.VITE_SOCKET_URL`), and documentation alignment.
- **Goal:** Wrap up the assignment into a production-ready repository without breaking existing functionality.
