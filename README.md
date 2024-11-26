# XRay Log JavaScript SDK

XRay Log JavaScript SDK for logging and monitoring applications. This SDK provides a simple way to log various data types with type preservation in both Node.js and browser environments.

<p align="center">
<a href="https://github.com/XRay-Log/javascript-sdk/actions"><img src="https://github.com/XRay-Log/javascript-sdk/workflows/Node.js%20CI/badge.svg" alt="Build Status"></a>
<a href="https://www.npmjs.com/package/@xraylog/javascript-sdk"><img src="https://img.shields.io/npm/dt/@xraylog/javascript-sdk" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/@xraylog/javascript-sdk"><img src="https://img.shields.io/npm/v/@xraylog/javascript-sdk" alt="Latest Stable Version"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/npm/l/@xraylog/javascript-sdk" alt="License"></a>
</p>

## Installation

You can install the package via npm:

```bash
npm install --save-dev @xraylog/javascript-sdk
```

## Usage

### Using Logger Class

```javascript
import { XRayLogger } from '@xraylog/javascript-sdk';

// Initialize logger
const logger = new XRayLogger('Your Project Name');

// Log messages
logger.info("User logged in");
logger.error("Something went wrong");
logger.debug({ userId: 1, status: 'active' });
```

### Using Helper Function

```javascript
import { xray, setDefaultOptions } from '@xraylog/javascript-sdk';

// Set project name (optional)
setDefaultOptions({ project: 'My Project' });

// Log with default INFO level
xray("Simple message");

// Log with specific level
xray('error', "Something went wrong");
xray('debug', { userId: 1 });
```

### Host Types

The SDK supports different host types for various environments:

- `LOCAL` (default): Uses `localhost:44827`
- `DOCKER`: Uses `host.docker.internal:44827`

You can configure the host type using:

```javascript
const logger = new XRayLogger('docker-project', {
    hostType: XRayLogger.HOST_TYPES.DOCKER
});
```

## Testing

```bash
npm test
```

## License

The XRay Log JavaScript SDK is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
