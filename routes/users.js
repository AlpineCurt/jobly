"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const Job = require("../models/job");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureIsAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", [ensureIsAdmin], async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: admin or current user
 **/

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (res.locals.user.username === req.params.username || res.locals.user.isAdmin === true) {
      const user = await User.get(req.params.username);
      return res.json({ user });
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or current user
 **/

router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (res.locals.user.username === req.params.username || res.locals.user.isAdmin === true) {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or current user
 **/

router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (res.locals.user.username === req.params.username || res.locals.user.isAdmin === true) {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});

/** POST /:username/jobs/:id
 * 
 *  :username applies for job with :id
 * 
 * Authorization required:  admin or current user
 */

router.post("/:username/jobs/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    if (res.locals.user.username === req.params.username || res.locals.user.isAdmin === true) {
      const { username, id } = req.params;
      await User.apply(username, id);
      return res.json({ applied: id });
    }
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
