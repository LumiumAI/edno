module.exports.getFileMode = function() {
  return Edno.lstatSync(__dirname + "/exec").mode;
};
