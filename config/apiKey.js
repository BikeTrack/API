const auth = function (req, res, next) {
  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(403).json(
      {
        message: "Missing APIKey.",
        description: "Unable to find the APIKey."
      });
  };

  if (headerAuth != process.env.API_KEY_APP) {
    return res.status(403).json(
    {
       message: "APIKey don't match",
       description: "Make sure what you are sending is what is in your server."
    });
  }
  next();
};

module.exports = auth;
