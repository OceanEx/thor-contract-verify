pragma solidity ^0.4.24;

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function toUINT112(uint256 a) internal pure returns(uint112) {
        assert(uint112(a) == a);
        return uint112(a);
    }

    function toUINT120(uint256 a) internal pure returns(uint120) {
        assert(uint120(a) == a);
        return uint120(a);
    }

    function toUINT128(uint256 a) internal pure returns(uint128) {
        assert(uint128(a) == a);
        return uint128(a);
    }
}

contract Normal {

    function test() public pure returns (string memory) {
        return "normal";
    }
}

contract Params {
    uint8 p1;
    uint16 p2;

    constructor (uint8 _p1, uint16 _p2) public {
        p1 = _p1;
        p2 = _p2;
    }
}

contract Library {

    using SafeMath for uint256;

    function test() public pure {
        uint256 ret1 = 10;
        uint256 ret2 = 20;

        uint256 ret_sub = ret1.sub(ret2);
        uint256 ret_add = ret1.add(ret2);

        require(ret_sub > 0 && ret_add > 0, "true");
    }
}

contract Null {}

interface ProtoInterface {
    function master(address _self) external view returns(address);
}

library ProtoLib {
    ProtoInterface constant Prototype = ProtoInterface(uint160(bytes9("Prototype")));

    function master(address _self) public view returns(address){
        return Prototype.master(_self);
    }

}

contract ExternalLib {
    function master(address _addr) public view returns(address) {
        return ProtoLib.master(_addr);
    }
}