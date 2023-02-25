"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
      title: "new",
      salary: 77777,
      equity: 0.02,
      companyHandle: "c1"
    };
  
    test("ok for admin", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: {
            id: 3,
            title: "new",
            salary: 77777,
            equity: "0.02",
            companyHandle: "c1"
        }
      });
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: 456
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request with invalid data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            title: "new",
            salary: "one million dollars",
            equity: 0.02,
            companyHandle: "c1"
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("unauthorized for users", async () => {
      const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toBe(401);
    });
  
    test("unauthorized for anon", async () => {
      const resp = await request(app)
        .post("/jobs")
        .send(newJob);
      expect(resp.statusCode).toBe(401);
    });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                id: 1,
                title: "j1",
                salary: 12345,
                equity: "0",
                companyHandle: "c1"
              },
              {
                id: 2,
                title: "j2",
                salary: 54321,
                equity: "0.01",
                companyHandle: "c2"
              }
            ]
      });
    });
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(500);
    });
  
    test("filter by title", async () => {
      const resp = await request(app).get("/jobs/?title=j1")
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        jobs:
            [
              {
                id: 1,
                title: "j1",
                salary: 12345,
                equity: "0",
                companyHandle: "c1"
              }
            ]
      });
    });
  
    test("filter by minsalary", async () => {
      const resp = await request(app).get("/jobs/?minSalary=22000");
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 2,
                    title: "j2",
                    salary: 54321,
                    equity: "0.01",
                    companyHandle: "c2"
                }
            ]
      });
    });
    
    test("filter by title and min salary", async () => {
      const resp = await request(app).get("/jobs/?title=j2&minSalary=10000");
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({
        jobs:
            [
                {
                    id: 2,
                    title: "j2",
                    salary: 54321,
                    equity: "0.01",
                    companyHandle: "c2"
                }
            ]
      })
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/1`);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({
        job: {
            id: 1,
            title: "j1",
            salary: 12345,
            equity: "0",
            companyHandle: "c1"
          },
      });
    });
  
    test("id not found", async function () {
      const resp = await request(app).get(`/jobs/54`);
      expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            title: "j1-new",
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.body).toEqual({
        job: {
            id: 1,
            title: "j1-new",
            salary: 12345,
            equity: "0",
            companyHandle: "c1"
        },
      });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            name: "j1-new",
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for user", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            name: "j1-new",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async function () {
      const resp = await request(app)
          .patch(`/jobs/45`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on companyHandle change attempt", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            companyHandle: "j1-new",
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            salary: "one million dollars",
          })
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    test("works for admin", async function () {
      const resp = await request(app)
          .delete(`/jobs/1`)
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.body).toEqual({ deleted: "1" });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/1`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for user", async function () {
      const resp = await request(app)
          .delete(`/jobs/1`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such company", async function () {
      const resp = await request(app)
          .delete(`/jobs/45`)
          .set("authorization", `Bearer ${u4Token}`);
      expect(resp.statusCode).toEqual(404);
    });
});