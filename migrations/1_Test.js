const FileStorage = artifacts.require("fileStorage");

module.exports = function (deployer) {
  deployer.deploy(FileStorage);
};
