// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../Organization/IOrganizationManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    }

    // prizesByOrg[orgId] => array dinámico de premios de esa organización
    mapping(uint256 => Prize[]) private prizesByOrg;

    // Referencia al OrganizationManager para verificar admins y miembros,
    // y para obtener el token de la org.
    IOrganizationManager public orgManager;

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

    /// @dev Verifica si msg.sender es miembro o admin de la org
    modifier onlyOrgMember(uint256 orgId) {
        require(
            orgManager.isUser(orgId, msg.sender) || orgManager.isAdmin(orgId, msg.sender),
            "Prizes: caller is not a member or admin of this org"
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
        // Almacenar el nuevo premio
        prizesByOrg[orgId].push(Prize({
            name: name,
            description: description,
            price: price,
            stock: stock
        }));
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
    function listPrizes(uint256 orgId)
    external
    view
    returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory descriptions,
        uint256[] memory prices,
        uint256[] memory stocks
    )
    {
        Prize[] storage prizes = prizesByOrg[orgId];
        uint256 length = prizes.length;

        ids = new uint256[](length);
        names = new string[](length);
        descriptions = new string[](length);
        prices = new uint256[](length);
        stocks = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Prize storage p = prizes[i];
            ids[i] = i;  // El ID es simplemente el índice en el array
            names[i] = p.name;
            descriptions[i] = p.description;
            prices[i] = p.price;
            stocks[i] = p.stock;
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
    onlyOrgMember(orgId)
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

        // Disminuir el stock
        p.stock -= amount;

        // Opcionalmente: "quemar" tokens o lo que se desee hacer con esos tokens
        // Si se pueden quemar:
        // CompanyToken(tokenAddress).burn(cost);
        // O transferir a una dirección sin clave:
        // IERC20(tokenAddress).transfer(address(0xdead), cost);
    }
}
