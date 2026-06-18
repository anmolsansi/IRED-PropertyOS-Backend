import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export interface GeographicScope {
  stateIds: string[];
  cityIds: string[];
  localityIds: string[];
}

export const GeographyScope = createParamDecorator(
  (data: keyof GeographicScope | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const scope: GeographicScope | undefined =
      request.userGeographicScope;

    if (!scope) {
      throw new ForbiddenException(
        'Geographic scope not available. Ensure GeographyGuard is applied.',
      );
    }

    if (data) {
      return scope[data];
    }

    return scope;
  },
);
