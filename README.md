# 🏆 CryptoTrophy Platform

<h4 align="center">
  <a href="https://www.cryptotrophy-app.com/docs">Documentación</a> |
  <a href="https://www.cryptotrophy-app.com">Sitio Web</a>
</h4>

## 📑 Tabla de Contenidos
- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Flujo de Funcionamiento](#-flujo-de-funcionamiento)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación y Uso](#-instalación-y-uso)
- [Despliegue](#-despliegue)


## 📋 Descripción del Proyecto

**CryptoTrophy Platform** es una plataforma descentralizada que puede ser desplegada sobre cualquier blockchain EVM compatible que permite a las organizaciones crear y gestionar sistemas de recompensas gamificados utilizando tokens ERC-20 personalizados, NFTs y pruebas criptográficas de conocimiento cero (ZK).

La plataforma facilita la creación de ecosistemas de incentivos donde las organizaciones pueden:
- 🏢 Crear sus propios tokens organizacionales (estos pueden estar respaldados opcionalmente por ETH)
- 🎯 Diseñar desafíos y competencias con validaciones personalizadas
- 🎁 Ofrecer premios canjeables por NFTs
- 🔐 Implementar sistemas de validación seguros usando pruebas de cero conocimiento y Chainlink

## 🏗 Arquitectura

### 📁 Estructura de Monorepo

El proyecto está organizado como un monorepo con múltiples paquetes especializados:

```
crypto-trophy/
├── packages/
│   ├── hardhat/              # Contratos inteligentes y deployment
│   │   └── contracts/        # Principales contratos con la logica de negocio
│   ├── nextjs/               # Frontend web (Next.js)
│   │   ├── backoffice        # Backoffice para los administradores de las organizaciones
│   │   └── trophy-app        # App para los usuarios finales
│   └── ponder/               # Indexador de eventos blockchain
└── circuits/                 # Circuitos ZK-SNARK (Circom)
└── docker-compose.yml        # Orquestación de servicios
```

### 🔧 Componentes Principales

#### 1. **Smart Contracts** (`packages/hardhat/`)
- **OrganizationManager**: Gestión central de organizaciones y sus tokens
- **ChallengeManager**: Creación y validación de desafíos
- **Prizes**: Sistema de premios con NFTs
- **OrganizationToken**: Token ERC-20 personalizado por organización
- **Validators**: Contratos de validación modulares

#### 2. **Frontend Web** (`packages/nextjs/`)
- **Aplicación Next.js** con TypeScript y Tailwind CSS
- **Integración Web3** usando Wagmi y RainbowKit
- **Páginas principales**:
  - Panel de organizaciones
  - Panel de desafíos
  - Centro de premios
  - Gestión de NFTs personales
  - Backoffice administrativo

#### 3. **Indexador de Eventos** (`packages/ponder/`)
- **Ponder.sh**: Indexación en tiempo real de eventos blockchain
- **GraphQL API**: Consultas optimizadas para el frontend
- **Base de datos**: Almacenamiento persistente de eventos

#### 4. **Circuitos ZK** (`circuits/`)
- **Circom**: Circuitos de conocimiento cero
- **Groth16**: Protocolo de pruebas

#### 5. **Backend Organizacional** (`packages/organization-backend/`)
- **API REST**: Servicios específicos para organizaciones
- **Integración IPFS**: Almacenamiento de metadatos
- **Gestión de archivos**: Subida de imágenes y contenido

## 🔄 Flujo de Funcionamiento

### Para Organizaciones:
1. **Registro**: Crear organización con token personalizado respaldado por ETH
2. **Configuración**: Definir administradores y metadatos (logo, descripción, etc.)
3. **Creación de Desafíos**: Diseñar competencias con validadores personalizados
4. **Gestión de Premios**: Configurar catálogo de recompensas NFT que pueden ser obtenidos a cambio de tokens de la organización

### Para Usuarios:
1. **Conexión**: Conectar wallet compatible (MetaMask, WalletConnect, etc.)
2. **Participación**: Completar desafíos de organizaciones
3. **Validación**: Demostrar cumplimiento usando validadores (códigos secretos a través de ZK proofs, validación a través de APIs externas mediante Chainlink)
4. **Recompensas**: Recibir tokens organizacionales al cumplir desafíos
5. **Canje**: Intercambiar tokens por NFTs en el centro de premios
6. **Exchange**: Intercambiar tokens por ETH si el token de la organización está respaldado por ETH

## 🛠 Tecnologías Utilizadas

### Blockchain & Smart Contracts
- **[Solidity](https://soliditylang.org/)** - Lenguaje de contratos inteligentes
- **[Hardhat](https://hardhat.org/)** - Framework de desarrollo Ethereum
- **[Scaffold-ETH](https://scaffoldeth.io/)** - Template y toolkit para desarrollo dApps
- **[OpenZeppelin](https://openzeppelin.com/)** - Librerías de contratos seguros
- **[Chainlink](https://chain.link/)** - Oráculos y servicios externos

### Frontend
- **[Next.js](https://nextjs.org/)** - Framework React con SSR
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de estilos
- **[RainbowKit](https://www.rainbowkit.com/)** - Conexión de wallets
- **[Wagmi](https://wagmi.sh/)** - Hooks React para Ethereum

### Backend & Servicios
- **[Ponder.sh](https://ponder.sh/)** - Indexación de blockchain
- **[GraphQL](https://graphql.org/)** - API de consultas a ponder
- **[IPFS](https://ipfs.tech/)/[Filebase](https://filebase.com/)** - Almacenamiento descentralizado
- **[Docker](https://docker.com/)** - Containerización

### Criptografía
- **[Circom](https://docs.circom.io/)** - Lenguaje de circuitos ZK
- **[SnarkJS](https://github.com/iden3/snarkjs)** - Librerías ZK-SNARK
- **[Poseidon Hash](https://www.poseidon-hash.info/)** - Función hash criptográfica

## 🚀 Instalación y Uso

### Prerrequisitos
- [Node.js](https://nodejs.org/) >= 18.18
- [Yarn](https://yarnpkg.com/) >= 4.9.1
- [Git](https://git-scm.com/)
- [Docker](https://docker.com/) y Docker Compose

### Configuración Rápida

1. **Instalar dependencias y levantar servicios**:
```bash
yarn build
```

2. **Desplegar contratos en red local**:
```bash
yarn deploy
```

3. **Ejecutar frontend**:
```bash
yarn start
```

La aplicación estará disponible en `http://localhost:3000`

### 🐳 Docker Compose y Comandos Principales

El proyecto utiliza **Docker Compose** para orquestar todos los servicios necesarios de manera sencilla. Los contenedores incluyen:

- **`db`**: Base de datos PostgreSQL para el indexador Ponder
- **`hardhat`**: Nodo blockchain local (puerto 8545)
- **`app`**: Backend de organizaciones (puerto 80)
- **`ponder`**: Indexador de eventos blockchain con API GraphQL

#### Comandos Esenciales

**🚀 `yarn build`**
```bash
yarn build
```
- Construye e inicia todos los contenedores Docker en modo daemon (`-d`)
- Reconstruye las imágenes si hay cambios (`--build`)
- Levanta la blockchain local, base de datos, backend y indexador
- Este es el **primer comando que debes ejecutar** para configurar el entorno completo

**⬇️ `yarn down`**
```bash
yarn down
```
- Detiene y elimina todos los contenedores Docker
- Útil para limpiar el entorno o reiniciar completamente
- No elimina los volúmenes de datos persistentes

**📋 `yarn deploy`**
```bash
yarn deploy
```
- Despliega los contratos inteligentes en la blockchain local
- Ejecuta el script de deployment dentro del contenedor Hardhat
- **Ejecutar después de `yarn build`** para tener los contratos disponibles
- Genera las direcciones de contratos necesarias para el frontend

### Comandos Útiles

```bash
# Compilar contratos
yarn compile

# Ejecutar tests
yarn test

# Ver logs de blockchain local
yarn logs

# Formatear código
yarn format
```
