// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../Organization/IOrganizationManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// NFT contract for prizes
contract PrizeNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    string private _baseTokenURI;
    
    constructor(string memory name, string memory symbol, string memory baseTokenURI) 
        ERC721(name, symbol) 
        Ownable(msg.sender)
    {
        _baseTokenURI = baseTokenURI;
    }
    
    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}

contract Prizes {
    // -------------------------------------------------------------------------
    // ESTRUCTURAS Y ALMACENAMIENTO
    // -------------------------------------------------------------------------

    struct Prize {
        // Como se pide: name, description, price, stock
        string name;
        string description;
        uint256 price;
        uint256 stock;
        uint256 orgId;
        address nftContract; // Address of the deployed NFT contract for this prize
        string baseURI; // Image cid in Filebase
    }

    mapping(uint256 => Prize) private prizes; // prizeId => Prize
    uint256 private nextPrizeId;

    // prizesByOrg[orgId] => array dinámico de premios de esa organización
    mapping(uint256 => uint256[]) private prizeIdsByOrg;

    // Referencia al OrganizationManager para verificar admins y miembros,
    // y para obtener el token de la org.
    IOrganizationManager public orgManager;

    // EVents
    event PrizeCreated(
        uint256 indexed prizeId,
        uint256 indexed orgId,
        string name,
        string description,
        uint256 price,
        uint256 stock,
        address nftContract,
        string baseURI
    );

    event PrizeClaimed(
        uint256 indexed prizeId,
        uint256 indexed orgId,
        uint256 amount,
        address claimer,
        uint256 cost,
        uint256[] nftIds
    );

    // -------------------------------------------------------------------------
    // CONSTRUCTOR
    // -------------------------------------------------------------------------

    constructor(IOrganizationManager _orgManager) {
        orgManager = _orgManager;
    }

    // -------------------------------------------------------------------------
    // MODIFICADORES
    // -------------------------------------------------------------------------

    /// @dev Verifica si msg.sender es admin en la org correspondiente
    modifier onlyOrgAdmin(uint256 orgId) {
        require(
            orgManager.isAdmin(orgId, msg.sender),
            "Prizes: caller is not an admin of this org"
        );
        _;
    }

    // -------------------------------------------------------------------------
    // FUNCIONES PRINCIPALES
    // -------------------------------------------------------------------------

    /// @notice Step 1: Create NFT contract for a prize
    /// @param name Name of the prize (and NFT)
    /// @param baseURI Image cid in Filebase
    /// @return NFT contract address
    function _createNFTContract(string memory name, uint256 prizeIndex, string memory baseURI)
    internal
    returns (address)
    {
        string memory symbol = string(abi.encodePacked("PRIZE", Strings.toString(prizeIndex)));
        
        PrizeNFT nftContract = new PrizeNFT(name, symbol, baseURI);
        return address(nftContract);
    }
    
    /// @notice Step 2: Store prize data and link to organization
    /// @param prizeId ID for the new prize
    /// @param orgId Organization ID
    /// @param name Prize name
    /// @param description Prize description
    /// @param price Prize price in org tokens
    /// @param stock Initial stock amount
    /// @param nftContract Address of the NFT contract
    /// @param baseURI Image cid in Filebase
    function _storePrize(
        uint256 prizeId,
        uint256 orgId,
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock,
        address nftContract,
        string memory baseURI
    )
    internal
    {
        Prize memory newPrize = Prize({
            name: name,
            description: description,
            price: price,
            stock: stock,
            orgId: orgId,
            nftContract: nftContract,
            baseURI: baseURI
        });
        
        prizes[prizeId] = newPrize;
        prizeIdsByOrg[orgId].push(prizeId);
        
        emit PrizeCreated(
            prizeId,
            orgId,
            name,
            description,
            price,
            stock,
            nftContract,
            baseURI
        );
    }

    /// @notice Crea un nuevo premio para la organización `orgId`.
    /// @param orgId ID de la organización
    /// @param name Nombre del premio
    /// @param description Descripción del premio
    /// @param price Precio (en tokens de la organización) para reclamar 1 unidad
    /// @param stock Cantidad inicial de unidades disponibles de este premio
    /// @param baseURI Image cid in Filebase
    function createPrize(
        uint256 orgId,
        string calldata name,
        string calldata description,
        uint256 price,
        uint256 stock,
        string calldata baseURI
    )
    external
    onlyOrgAdmin(orgId)
    {
        uint256 prizeId = nextPrizeId++;
        
        // Step 1: Create NFT contract
        address nftContract = _createNFTContract(name, prizeId, baseURI);
        
        // Step 2: Store prize data
        _storePrize(
            prizeId,
            orgId,
            name,
            description,
            price,
            stock,
            nftContract,
            baseURI
        );
    }

    function getPrize(uint256 prizeId) external view returns (Prize memory) {
        return prizes[prizeId];
    }

    /// @notice Lista todos los premios de una organización, incluyendo su ID e información.
    /// @dev Retorna un array de structs `Prize` pero en Solidity 0.8.x se puede usar
    ///     sin problema mientras las strings sean memoria.
    ///     También retornamos el `prizeId` como índice para que el front lo identifique.
    /// @param orgId ID de la organización
    /// @return ids Lista de IDs (índices) de cada premio
    /// @return names Lista de nombres
    /// @return descriptions Lista de descripciones
    /// @return prices Lista de precios
    /// @return stocks Lista de stocks
    /// @return nftContracts Lista de direcciones de contratos NFT
    /// @return baseURI Lista de cids de imágenes de premios
    function listPrizes(uint256 orgId)
    external
    view
    returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory descriptions,
        uint256[] memory prices,
        uint256[] memory stocks,
        address[] memory nftContracts,
        string[] memory baseURI
    )
    {
        uint256[] memory prizeIds = prizeIdsByOrg[orgId];
        uint256 length = prizeIds.length;

        ids = new uint256[](length);
        names = new string[](length);
        descriptions = new string[](length);
        prices = new uint256[](length);
        stocks = new uint256[](length);
        nftContracts = new address[](length);
        baseURI = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 prizeId = prizeIds[i];
            Prize storage p = prizes[prizeId];
            
            ids[i] = prizeId;
            names[i] = p.name;
            descriptions[i] = p.description;
            prices[i] = p.price;
            stocks[i] = p.stock;
            nftContracts[i] = p.nftContract;
            baseURI[i] = p.baseURI;
        }
    }

    /// @notice Reclama `amount` unidades de un premio (paga en tokens de la org).
    /// @dev El usuario debe haber aprobado previamente a este contrato (`Prizes`)
    ///      para gastar `amount * price` tokens de la organización.
    ///      Los tokens pagados son transferidos a la tesorería de la organización (OrganizationManager).
    /// @param orgId ID de la organización
    /// @param prizeId ID del premio
    /// @param amount Cantidad de unidades que se reclaman
    function claimPrize(uint256 orgId, uint256 prizeId, uint256 amount)
    external
    {
        require(amount > 0, "Prizes: amount must be > 0");

        Prize storage p = prizes[prizeId];
        require(p.orgId == orgId, "Prizes: prize not from this org");
        require(p.stock >= amount, "Prizes: not enough stock");

        uint256 cost = p.price * amount;

        address tokenAddress = orgManager.getTokenOfOrg(orgId);
        require(tokenAddress != address(0), "Prizes: invalid token for org");

        p.stock -= amount;
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), cost);
        IERC20(tokenAddress).transfer(address(orgManager), cost);

        uint256[] memory nftIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            nftIds[i] = PrizeNFT(p.nftContract).mint(msg.sender);
        }

        emit PrizeClaimed(prizeId, orgId, amount, msg.sender, cost, nftIds);
    }
}
