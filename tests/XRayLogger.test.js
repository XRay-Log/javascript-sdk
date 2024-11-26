const XRayLogger = require('../src/XRayLogger');

describe('XRayLogger', () => {
    let logger;
    let originalFetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(() => {
        logger = new XRayLogger('test-project');
        global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
    });

    test('constructor sets project name', () => {
        expect(logger.project).toBe('test-project');
    });

    test('constructor sets default host type to LOCAL', () => {
        expect(logger.hostType).toBe(XRayLogger.HOST_TYPES.LOCAL);
        expect(logger.apiUrl).toBe(`http://localhost:${XRayLogger.PORT}`);
    });

    test('constructor sets DOCKER host when specified', () => {
        const dockerLogger = new XRayLogger('test-project', {
            hostType: XRayLogger.HOST_TYPES.DOCKER
        });
        expect(dockerLogger.hostType).toBe(XRayLogger.HOST_TYPES.DOCKER);
        expect(dockerLogger.apiUrl).toBe(`http://host.docker.internal:${XRayLogger.PORT}`);
    });

    test('PORT is constant and correct', () => {
        expect(XRayLogger.PORT).toBe('44827');
    });

    test('formatPayload handles different types correctly', () => {
        // String
        expect(logger.formatPayload('test')).toBe('test');

        // Object
        const obj = { test: 'data' };
        expect(logger.formatPayload(obj)).toEqual(obj);

        // Error
        const error = new Error('test error');
        const formattedError = logger.formatPayload(error);
        expect(formattedError.message).toBe('test error');
        expect(formattedError.name).toBe('Error');
        expect(formattedError.stack).toBeDefined();

        // Array
        const arr = [1, 2, 3];
        expect(logger.formatPayload(arr)).toEqual(arr);

        // Number
        expect(logger.formatPayload(123)).toBe(123);
    });

    test('log sends correct request format', async () => {
        const testData = { test: 'data' };
        await logger.log('info', testData);

        expect(global.fetch).toHaveBeenCalledWith(
            `http://localhost:${XRayLogger.PORT}/receive`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: expect.any(String)
            }
        );

        const lastCallBody = JSON.parse(global.fetch.mock.lastCall[1].body);
        expect(lastCallBody).toMatchObject({
            level: 'INFO',
            payload: JSON.stringify(testData),
            project: 'test-project',
            timestamp: expect.any(Number),
            trace: expect.any(String)
        });
    });

    test('log handles error response', async () => {
        global.fetch.mockResolvedValueOnce({ 
            ok: false,
            text: () => Promise.resolve('Server Error')
        });

        await expect(logger.log('error', { test: 'error' }))
            .rejects
            .toThrow('Failed to send log: Server Error');
    });

    test.each([
        ['info'],
        ['error'],
        ['warning'],
        ['debug']
    ])('%s method calls log with correct level', async (level) => {
        await logger[level]({ message: `${level} test` });

        const lastCallBody = JSON.parse(global.fetch.mock.lastCall[1].body);
        expect(lastCallBody.level).toBe(level.toUpperCase());
        expect(lastCallBody.project).toBe('test-project');
    });

    test('setProject updates project name', () => {
        logger.setProject('new-project');
        expect(logger.project).toBe('new-project');
    });
});
