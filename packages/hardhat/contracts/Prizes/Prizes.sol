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
    }

    mapping(uint256 => Prize) private prizes; // prizeId => Prize
    uint256 private nextPrizeId;

    // prizesByOrg[orgId] => array dinámico de premios de esa organización
    mapping(uint256 => Prize[]) private prizesByOrg;

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
        address nftContract
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

    /// @notice Crea un nuevo premio para la organización `orgId`.
    /// @param orgId ID de la organización
    /// @param name Nombre del premio
    /// @param description Descripción del premio
    /// @param price Precio (en tokens de la organización) para reclamar 1 unidad
    /// @param stock Cantidad inicial de unidades disponibles de este premio
    function createPrize(
        uint256 orgId,
        string calldata name,
        string calldata description,
        uint256 price,
        uint256 stock
    )
    external
    onlyOrgAdmin(orgId)
    {
        // Deploy a new NFT contract for this prize
        string memory symbol = string(abi.encodePacked("PRIZE", Strings.toString(nextPrizeId)));
        string memory baseURI = ""; // Can be set later by admin
        PrizeNFT nftContract = new PrizeNFT(name, symbol, baseURI);
        
        Prize memory _prize = Prize({
            name: name,
            description: description,
            price: price,
            stock: stock,
            orgId: orgId,
            nftContract: address(nftContract)
        });
        uint256 _prizeId = nextPrizeId++;
		prizes[_prizeId] = _prize;

        // Almacenar el nuevo premio
        prizesByOrg[orgId].push(_prize);

        emit PrizeCreated(
            _prizeId,
            orgId,
            name,
            description,
            price,
            stock,
            address(nftContract)
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
    function listPrizes(uint256 orgId)
    external
    view
    returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory descriptions,
        uint256[] memory prices,
        uint256[] memory stocks,
        address[] memory nftContracts
    )
    {
        Prize[] storage _prizes = prizesByOrg[orgId];
        uint256 length = _prizes.length;

        ids = new uint256[](length);
        names = new string[](length);
        descriptions = new string[](length);
        prices = new uint256[](length);
        stocks = new uint256[](length);
        nftContracts = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            Prize storage p = _prizes[i];
            ids[i] = i;  // El ID es simplemente el índice en el array
            names[i] = p.name;
            descriptions[i] = p.description;
            prices[i] = p.price;
            stocks[i] = p.stock;
            nftContracts[i] = p.nftContract;
        }
    }

    /// @notice Reclama `amount` unidades de un premio (paga en tokens de la org).
    /// @dev El usuario debe haber aprobado previamente a este contrato (`Prizes`)
    ///      para gastar `amount * price` tokens de la organización.
    /// @param orgId ID de la organización
    /// @param prizeId Índice del premio (retornado por listPrizes)
    /// @param amount Cantidad de unidades que se reclaman
    function claimPrize(uint256 orgId, uint256 prizeId, uint256 amount)
    external
    {
        require(amount > 0, "Prizes: amount must be > 0");

        Prize storage p = prizesByOrg[orgId][prizeId];
        require(p.stock >= amount, "Prizes: not enough stock");

        // Costo total en tokens
        uint256 cost = p.price * amount;

        // Obtener la dirección del token de la organización
        address tokenAddress = orgManager.getTokenOfOrg(orgId);
        require(tokenAddress != address(0), "Prizes: invalid token for org");

        // Transferir tokens desde el usuario a este contrato (requiere approve)
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), cost);

        // Mint NFTs to the claimer
        uint256[] memory nftIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            nftIds[i] = PrizeNFT(p.nftContract).mint(msg.sender);
        }

        // Disminuir el stock
        p.stock -= amount;

		emit PrizeClaimed(prizeId, orgId, amount, msg.sender, cost, nftIds);

        // Opcionalmente: "quemar" tokens o lo que se desee hacer con esos tokens
        // Si se pueden quemar:
        // CompanyToken(tokenAddress).burn(cost);
        // O transferir a una dirección sin clave:
        // IERC20(tokenAddress).transfer(address(0xdead), cost);
    }
}
