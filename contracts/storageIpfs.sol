// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract fileStorage {
    struct File {
        string cid;
        string fileName;
        string fileType;
        uint256 fileSize;
    }
    mapping(address => File[]) public userFiles;
    event FileUploaded(address indexed user, string cid, string fileName, string fileType, uint256 fileSize);
    function uploadFile(string memory _cid, string memory _fileName, string memory _fileType, uint256 _fileSize) public {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_fileType).length > 0, "File type cannot be empty");
        require(_fileSize > 0, "File size must be greater than 0");
        File memory newFile = File(_cid, _fileName, _fileType, _fileSize);
        userFiles[msg.sender].push(newFile);
        emit FileUploaded(msg.sender, _cid, _fileName, _fileType, _fileSize);
    }
    function getFiles(address _user) public view returns (File[] memory) {
        return userFiles[_user];
    }
    function getFileByName(address _user, string memory _fileName) public view returns (string memory ) {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        File[] memory files = userFiles[_user];
        for (uint256 i = 0; i < files.length; i++) {
            if (keccak256(abi.encodePacked(files[i].fileName)) == keccak256(abi.encodePacked(_fileName))) {
               string memory last = string(abi.encodePacked(files[i].cid, "?", files[i].fileType, ",", files[i].fileName));
            return last;
            }
        }
        revert("File not found");
    }
}
