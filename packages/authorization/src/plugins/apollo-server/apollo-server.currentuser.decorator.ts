import { TAuthorizationServerontext, User } from '../../tool/index.js';
import { createParameterDecorator } from 'type-graphql';

export function CurrentUser(): ParameterDecorator {
    return createParameterDecorator<TAuthorizationServerontext>(({ context }) => {
        if (!context.user) return null;
        return new User(context.user);
    }) as ParameterDecorator;
}
