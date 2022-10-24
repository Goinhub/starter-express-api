const notFound = (req, res, next) => {
  res.status(404).send("Page does not exist");
};

module.exports = notFound;
