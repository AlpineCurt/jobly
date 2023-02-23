"use strict";

const db = require("../db.js");
const User = require("../models/user");
const { sqlForPartialUpdate } = require("./sql");
const bcrypt = require("bcrypt");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
  } = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

const jsToSql = {
    "firstName": "first_name",
    "lastName": "last_name",
    "isAdmin": "is_admin"
}

beforeAll(async () => {
    await db.query(`DELETE FROM users`);
    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
        });
});

beforeEach(async () => {
    await db.query("BEGIN");
});

afterEach(async () => {
    await db.query("ROLLBACK");
});

afterAll(async () => {
    await db.end();
})

describe("sqlForPartialUpdate", () =>{
    test("works, no data", () => {
        try {
            const query = sqlForPartialUpdate({}, jsToSql);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("works, with data", () => {
        const dataToUpdate = {
            "firstName": "Betty",
            "lastName": "White"
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result.setCols).toEqual(`"first_name"=$1, "last_name"=$2`);
        expect(result.values).toEqual(["Betty", "White"]);
    });

    test("works, custom data column", () => {
        const dataToUpdate = {
            "newCol": "Something"
        }
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result.setCols).toEqual(`"newCol"=$1`);
        expect(result.values).toEqual(["Something"]);
    });
});