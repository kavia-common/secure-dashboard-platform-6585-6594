 /**
  * PUBLIC_INTERFACE
  * validate
  * Middleware factory to validate request body fields exist.
  * @param {string[]} requiredFields - List of required field names in req.body
  * @returns {function} Express middleware
  */
function validate(requiredFields = []) {
  return (req, res, next) => {
    if (!req.is('application/json')) {
      return res.status(400).json({ message: 'Content-Type must be application/json' });
    }
    const missing = [];
    for (const f of requiredFields) {
      if (
        !Object.prototype.hasOwnProperty.call(req.body, f) ||
        req.body[f] === undefined ||
        req.body[f] === null ||
        (typeof req.body[f] === 'string' && req.body[f].trim() === '')
      ) {
        missing.push(f);
      }
    }
    if (missing.length) {
      return res.status(422).json({ message: 'Validation error', missing });
    }
    return next();
  };
}

module.exports = { validate };
