class XRayLogger {
    static get HOST_TYPES() {
        return {
            DOCKER: 'docker',
            LOCAL: 'local'
        };
    }

    static get PORT() {
        return '44827';
    }

    constructor(project, options = {}) {
        this.project = project;
        this.hostType = options.hostType || XRayLogger.HOST_TYPES.LOCAL;
        this.apiUrl = this.buildApiUrl();
    }

    buildApiUrl() {
        const DOCKER_HOST = 'host.docker.internal';
        const LOCAL_HOST = 'localhost';
        const host = this.hostType === XRayLogger.HOST_TYPES.DOCKER ? DOCKER_HOST : LOCAL_HOST;
        return `http://${host}:${XRayLogger.PORT}`;
    }

    formatPayload(payload) {
        if (payload instanceof Error) {
            return {
                message: payload.message,
                stack: payload.stack,
                name: payload.name,
                ...(payload.code && { code: payload.code }),
                ...(payload.details && { details: payload.details })
            };
        }
        return payload;
    }

    getStackTrace() {
        const stack = new Error().stack;
        return stack
            .split('\n')
            .slice(2)
            .map(line => line.trim())
            .join('\n');
    }

    async log(level = 'info', payload = null) {
        if (payload === null) {
            payload = level;
            level = 'info';
        }

        const data = {
            level: level.toUpperCase(),
            payload: this.formatPayload(payload),
            trace: this.getStackTrace(),
            project: this.project,
            timestamp: Math.floor(Date.now() / 1000)
        };
        console.log(data);
        try {
            let fetchFunc;
            if (typeof window !== 'undefined') {
                fetchFunc = window.fetch.bind(window);
            } else {
                fetchFunc = global.fetch || require('node-fetch');
            }

            const response = await fetchFunc(`${this.apiUrl}/receive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to send log: ${await response.text()}`);
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to send log: ${error.message}`);
        }
    }

    async info(payload) {
        return this.log('info', payload);
    }

    async error(payload) {
        return this.log('error', payload);
    }

    async warning(payload) {
        return this.log('warning', payload);
    }

    async debug(payload) {
        return this.log('debug', payload);
    }

    setProject(project) {
        this.project = project;
    }
}

module.exports = XRayLogger;
