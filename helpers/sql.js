const { BadRequestError } = require("../expressError");

/** Construct strings to be inserted into a SQL query.
 * 
 * dataToUpdate is a JSON object of fields to be updated and their values
 * e.g.  {"firstName": "Betty", "lastName": "White"}
 * 
 * jsToSql is an object mapping dataToUpdate keys to the column
 * names of the database.
 * e.g.  {firstName: "first_name", lastName: "last_name"}
 * 
 * Returns an object with keys 'setCols' and 'values'.
 * 'setCols' is a string of the database columns to be updated with
 * their values set to $1, $2, etc.
 * e.g. "first_name=$1, last_name=$2"
 * 'values' is an array of the new values to be set.
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
