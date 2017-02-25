const auth = function (req, res, next) {
  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(403).json({
      success: false,
      message: "Missing APIKey"
    })
  }

  if (headerAuth != process.env.API_KEY_APP) {
    return res.status(403).json({
      success: false,
      message: "APIKey don't match",
    })
  }
  
  next()
}

module.exports = auth;
