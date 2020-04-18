pragma solidity >=0.4.0 <0.7.0;

import "./Utils.sol";
import "./CnsController.sol";

contract VersionLogic is CnsController, Utils {
    modifier onlyFromProvider(address _sender) {
        require(_sender == provider);
        _;
    }

    function VersionLogic (ContractNameService _cns, bytes32 _contractName) CnsController(_cns, _contractName) public {}
}
