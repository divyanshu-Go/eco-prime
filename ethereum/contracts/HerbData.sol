// SPDX-License-Identifier:MIT

pragma solidity ^0.8.30;

import "./RegisteredWorker.sol";

contract HerbDataCID {
    RegisteredWorker public registry;
    uint256 public nextBatchId;

    uint8 public constant ROLE_COLLECTOR = 1;
    uint8 public constant ROLE_MIDDLEMAN = 2;
    uint8 public constant ROLE_LAB = 4;
    uint8 public constant ROLE_MANUFACTURER = 8;

    struct Batch {
        string batchRef;
        bool hasCollector;
        bool hasMiddleman;
        bool hasLab;
        bool hasManufacturer;
    }

    struct CollectorData { string cid; }
    struct MiddlemanData { string cid; }
    struct LabData { string cid; }
    struct ManufacturerData { string cid; }

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => CollectorData) public collectorInfos;
    mapping(uint256 => MiddlemanData) public middlemanInfos;
    mapping(uint256 => LabData) public labInfos;
    mapping(uint256 => ManufacturerData) public manufacturerInfos;

    event BatchCreated(uint256 indexed batchId, string batchRef);
    event CollectorDataAdded(uint256 indexed batchId, string cid);
    event MiddlemanDataAdded(uint256 indexed batchId, string cid);
    event LabDataAdded(uint256 indexed batchId, string cid);
    event ManufacturerDataAdded(uint256 indexed batchId, string cid);

    constructor(address registryAddr) {
        require(registryAddr != address(0), "HerbData: registry required");
        registry = RegisteredWorker(registryAddr);
    }

    function createBatch(string calldata batchRef, string calldata collectorCid) external returns (uint256) {
        require((registry.roles(msg.sender) & ROLE_COLLECTOR) != 0, "Not collector");

        uint256 id = ++nextBatchId;

        batches[id] = Batch(batchRef, true, false, false, false);
        collectorInfos[id] = CollectorData(collectorCid);

        emit BatchCreated(id, batchRef);
        emit CollectorDataAdded(id, collectorCid);
        return id;
    }

    function addMiddlemanData(uint256 batchId, string calldata cid) external {
        require((registry.roles(msg.sender) & ROLE_MIDDLEMAN) != 0, "Not middleman");
        Batch storage b = batches[batchId];
        require(b.hasCollector, "No collector data");
        require(!b.hasMiddleman, "Already added");

        middlemanInfos[batchId] = MiddlemanData(cid);
        b.hasMiddleman = true;
        emit MiddlemanDataAdded(batchId, cid);
    }

    function addLabData(uint256 batchId, string calldata cid) external {
        require((registry.roles(msg.sender) & ROLE_LAB) != 0, "Not lab");
        Batch storage b = batches[batchId];
        require(b.hasMiddleman, "No middleman data");
        require(!b.hasLab, "Already added");

        labInfos[batchId] = LabData(cid);
        b.hasLab = true;
        emit LabDataAdded(batchId, cid);
    }

    function addManufacturerData(uint256 batchId, string calldata cid) external {
        require((registry.roles(msg.sender) & ROLE_MANUFACTURER) != 0, "Not manufacturer");
        Batch storage b = batches[batchId];
        require(b.hasLab, "No lab data");
        require(!b.hasManufacturer, "Already added");

        manufacturerInfos[batchId] = ManufacturerData(cid);
        b.hasManufacturer = true;
        emit ManufacturerDataAdded(batchId, cid);
    }

    // -------- Views --------
    function getBatchSummary(uint256 batchId) external view returns (string memory, bool, bool, bool, bool) {
        Batch storage b = batches[batchId];
        return (b.batchRef, b.hasCollector, b.hasMiddleman, b.hasLab, b.hasManufacturer);
    }

    function getCollectorCID(uint256 batchId) external view returns (string memory) {
        return collectorInfos[batchId].cid;
    }

    function getMiddlemanCID(uint256 batchId) external view returns (string memory) {
        return middlemanInfos[batchId].cid;
    }

    function getLabCID(uint256 batchId) external view returns (string memory) {
        return labInfos[batchId].cid;
    }

    function getFullBatch(uint256 batchId)
    external
    view
    returns (
        string memory batchRef,
        string memory collectorCid,
        string memory middlemanCid,
        string memory labCid,
        string memory manufacturerCid
    )
    {
        Batch storage b = batches[batchId];

        return (
            b.batchRef,
            collectorInfos[batchId].cid,
            middlemanInfos[batchId].cid,
            labInfos[batchId].cid,
            manufacturerInfos[batchId].cid
        );
    }

}
