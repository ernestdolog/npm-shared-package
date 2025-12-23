type TFormatMessageProperties = {
    message: string;
    properties: Record<string, unknown>;
};

const ERROR_MESSAGE_PROPERTY_REGEX: RegExp = /:([a-zA-Z0-9_]+)/g;

export class ErrorFormattedMessage {
    constructor(private readonly input: TFormatMessageProperties) {}

    get text(): string {
        return this.input.message.replace(ERROR_MESSAGE_PROPERTY_REGEX, (_, key) => {
            const value = this.input.properties[key];
            if (value === undefined) return `:${key}`;

            return typeof value === 'string' ? value : JSON.stringify(value);
        });
    }
}
