pragma solidity >=0.4.0 <0.7.0;

import "./CnsController.sol";

contract VersionEvent is CnsController {
    function VersionEvent (ContractNameService _cns, bytes32 _contractName) CnsController(_cns, _contractName) public {}
}
