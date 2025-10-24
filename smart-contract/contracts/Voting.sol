// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    address public admin;
    uint public candidatesCount;
    bool public electionStarted;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint candidateId, string name);
    event VoterRegistered(address voter);
    event Voted(address voter, uint candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionStarted = false;
    }

    function addCandidate(string calldata _name) external onlyAdmin {
        require(!electionStarted, "Election already started");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function registerVoter(address _voter) external onlyAdmin {
        require(!electionStarted, "Election already started");
        registeredVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    function startElection() external onlyAdmin {
        electionStarted = true;
    }

    function vote(uint _candidateId) external {
        require(electionStarted, "Election not started");
        require(registeredVoters[msg.sender], "Not registered");
        require(!hasVoted[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    function getCandidate(uint _id) external view returns (string memory, uint) {
        Candidate storage c = candidates[_id];
        return (c.name, c.voteCount);
    }
}
