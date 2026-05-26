// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;   

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertificatNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _tokenIds;

    // wallet étudiant => liste de ses tokenIds
    mapping(address => uint256[]) private _studentCertificates;

    event CertificateMinted(
        address indexed student,
        uint256 tokenId,
        string  tokenURI
    );

    constructor() ERC721("CertificatNFT", "CERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE,         msg.sender);
    }

    // Émettre un certificat NFT à un étudiant
    function mintCertificate(address student, string memory tokenURI)
        public
        onlyRole(ADMIN_ROLE)
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _studentCertificates[student].push(newTokenId);

        emit CertificateMinted(student, newTokenId, tokenURI);
        return newTokenId;
    }

    // Récupérer tous les certificats d'un étudiant
    function getCertificatesByOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        return _studentCertificates[owner];
    }

    // Ajouter un autre admin (enseignant)
    function addAdmin(address account)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _grantRole(ADMIN_ROLE, account);
    }

    // Requis par Solidity quand on hérite de plusieurs contrats
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}