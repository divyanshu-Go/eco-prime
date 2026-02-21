// SPDX-License-Identifier:MIT
pragma solidity ^0.8.30;


/**
* RegisteredWorker
* - Simple owner-controlled role registry
* - Roles are stored as a uint8 bitmask so one address can hold multiple roles
* Collector = 1, Middleman = 2, Lab = 4, Manufacturer = 8
*/
contract RegisteredWorker {
        address public owner;
        mapping(address => uint8) public roles; // address => role bitmask


        event WorkerRoleUpdated(address indexed worker, uint8 roleBits);


        modifier onlyOwner() {
        require(msg.sender == owner, "RegisteredWorker: only owner");
        _;
        }


        constructor() {
        owner = msg.sender;
        }


        /// @notice Set roles for a worker. Provide combined bits if multiple roles are needed.
        function setWorkerRole(address worker, uint8 roleBits) external onlyOwner {
        roles[worker] = roleBits;
        emit WorkerRoleUpdated(worker, roleBits);
        }


        /// @notice Remove specific role bits from a worker.
        function removeWorkerRole(address worker, uint8 roleBits) external onlyOwner {
        roles[worker] = roles[worker] & (~roleBits);
        emit WorkerRoleUpdated(worker, roles[worker]);
        }


        /// @notice Helper to check a single role bit.
        function hasRole(address worker, uint8 roleBit) external view returns (bool) {
        return (roles[worker] & roleBit) != 0;
        }
}