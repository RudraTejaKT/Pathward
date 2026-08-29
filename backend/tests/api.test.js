const request = require("supertest");
const app = require("../server");

describe("API Endpoints Testing with Jest", () => {

    // 1. Test Health Check Endpoint
    test("GET /api/health returns status ok", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status", "ok");
    });

    // 2. Test Streams Endpoint
    test("GET /api/streams returns list of streams", async () => {
        const res = await request(app).get("/api/streams");
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // 3. Test Engineering Branches
    test("GET /api/branches returns branch data", async () => {
        const res = await request(app).get("/api/branches");
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    // 4. Test Single Branch Details (CSE)
    test("GET /api/branch-details/cse returns roadmap, projects & jobs", async () => {
        const res = await request(app).get("/api/branch-details/cse");
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("branch");
        expect(res.body.data).toHaveProperty("roadmap");
        expect(res.body.data).toHaveProperty("projects");
        expect(res.body.data).toHaveProperty("jobs");
    });

    // 5. Test Auth Signup & Login Flow
    test("POST /api/auth/signup creates a test user and returns a token", async () => {
        const randomEmail = `jest_${Date.now()}@example.com`;
        const password = "testpassword123";

        const signupRes = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Jest Test User",
                email: randomEmail,
                password: password,
            });

        expect(signupRes.statusCode).toEqual(201);
        expect(signupRes.body.success).toBe(true);
        expect(signupRes.body.data).toHaveProperty("token");
        expect(signupRes.body.data.user.email).toBe(randomEmail);

        // 6. Test Auth Login with the created user
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: randomEmail,
                password: password,
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body.success).toBe(true);
        expect(loginRes.body.data).toHaveProperty("token");

        // 7. Verify /api/auth/me returns the exact logged-in user
        const meRes = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${loginRes.body.data.token}`);

        expect(meRes.statusCode).toEqual(200);
        expect(meRes.body.data.email).toBe(randomEmail);
    });

    // 8. Multi-user session isolation test (User A vs User B)
    test("User A and User B have completely isolated accounts and data", async () => {
        const timestamp = Date.now();
        const userAEmail = `user_a_${timestamp}@example.com`;
        const userBEmail = `user_b_${timestamp}@example.com`;

        // Create User A
        const resA = await request(app)
            .post("/api/auth/signup")
            .send({ name: "Alice Wonderland", email: userAEmail, password: "PasswordA123!" });
        expect(resA.statusCode).toEqual(201);
        const tokenA = resA.body.data.token;

        // Create User B
        const resB = await request(app)
            .post("/api/auth/signup")
            .send({ name: "Bob Builder", email: userBEmail, password: "PasswordB123!" });
        expect(resB.statusCode).toEqual(201);
        const tokenB = resB.body.data.token;

        // Verify User A profile
        const profileA = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${tokenA}`);
        expect(profileA.body.data.name).toBe("Alice Wonderland");
        expect(profileA.body.data.email).toBe(userAEmail);

        // Verify User B profile is distinct from User A
        const profileB = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${tokenB}`);
        expect(profileB.body.data.name).toBe("Bob Builder");
        expect(profileB.body.data.email).toBe(userBEmail);
        expect(profileB.body.data.id).not.toEqual(profileA.body.data.id);

        // User A adds a note
        await request(app)
            .post("/api/trainee/notes")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ topic: "Alice Private Study Note", noteContent: "Confidential research" });

        // User B views their notes - should NOT see User A's note
        const notesB = await request(app)
            .get("/api/trainee/notes")
            .set("Authorization", `Bearer ${tokenB}`);
        expect(notesB.body.data.length).toBe(0);
    });
});
