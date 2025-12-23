import { TAuthorizationServerontext, User } from '../../tool/index.js';
import { createParamDecorator } from 'type-graphql';

export function CurrentUser(): ParameterDecorator {
    return createParamDecorator<TAuthorizationServerontext>(({ context }) => {
        if (!context.user) return null;
        return new User(context.user);
    }) as ParameterDecorator;
}
