import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { StrategyOptions } from 'passport-jwt';
import * as passportJwt from 'passport-jwt';

type JwtPayload = {
  sub: string;
};

type JwtExtractor = (req: unknown) => string | null;

const ExtractJwt = (
  passportJwt as unknown as {
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: () => JwtExtractor;
    };
  }
).ExtractJwt;

const Strategy = (
  passportJwt as unknown as {
    Strategy: new (...args: any[]) => any;
  }
).Strategy;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'secret',
    };

    super(options);
  }

  validate(payload: JwtPayload): { userId: string } {
    return {
      userId: payload.sub,
    };
  }
}
