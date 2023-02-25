"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
      title: "new",
      salary: 123456,
      equity: 0.002,
      companyHandle: "c1"
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      expect(job).toEqual({
        id: 3,
        title: "new",
        salary: 123456,
        equity: "0.002",
        companyHandle: "c1"
      });
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE id = ${job.id}`);
      expect(result.rows).toEqual([
        {
          id: 3,
          title: "new",
          salary: 123456,
          equity: "0.002",
          company_handle: "c1"
        },
      ]);
    });
});

describe("findAll", () => {
  test("works", async () => {
    const jobs = await Job.findAll();
    expect(jobs.length).toEqual(2);
    expect(jobs).toEqual([
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
    ]);
  });
});

describe("get", () => {
  test("works", async () => {
    const job = await Job.get(1);
    expect(job).toEqual(
      {
        id: 1,
        title: "j1",
        salary: 12345,
        equity: "0",
        companyHandle: "c1"
      }
    );
  });

  test("not found if no such job id", async () => {
    try {
      await Job.get(5);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 200,
    equity: 0
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      companyHandle: "c1",
      title: "New",
      salary: 200,
      equity: "0"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New",
      salary: 200,
      equity: "0",
      company_handle: "c1",
    }]);
  });

  test("not found if no such id", async function () {
    try {
      await Job.update(42, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT title, salary FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(34);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** filter */

describe("filter", () => {
  test("filter by title", async () => {
    const reqquery = {
      title: "j2"
    }
    const res = await Job.filter(reqquery);
    expect(res).toEqual([
      {
        id: 2,
        title: "j2",
        salary: 54321,
        equity: "0.01",
        companyHandle: "c2"
      }
    ]);
  });
});