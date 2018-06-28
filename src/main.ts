import { config } from 'dotenv';
import * as express from 'express';
import * as passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';

declare module 'express' {
  // tslint:disable-next-line:interface-name
  interface Request {
    user?: {
      accessToken: string;
    };
  }
}

// Setup dotenv
config();

declare var __DEV__: boolean;

export class Server {
  public app: express.Express;
  public port: number;

  constructor() {
    this.app = express();
    this.passport();
    this.port = this.getPort();
    this.setRoutes();
    this.github();

    this.start();
  }

  private start = (): void => {
    this.app.listen(this.port, this.onListen);
  }

  private onListen = (err: any): void => {
    if (err) {
      console.error(err);
      return;
    }

    if (__DEV__) {
      console.log('> in development');
    }

    console.log(`> listening on port ${this.port}`);
  }

  private getPort = (): number => parseInt(process.env.PORT || '3000', 10);

  private setRoutes = (): void => {
    this.app.get('/login', passport.authenticate('github'));
    this.app.get('/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
      res.redirect(`/token/${req.user!.accessToken}`);
    });
    this.app.get('/token/:token', (req, res) => {
      res.json('ヽ(´▽`)/');
    });
  }

  private passport() {
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });
  }

  private github() {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `http://localhost:${process.env.PORT}/callback`,
      scope: [
        'notifications',
        'repo',
      ],
    }, (accessToken, refreshToken, profile: {}, cb: (error: null, callback: {}) => void) => {
      console.log(accessToken, refreshToken, profile);
      return cb(null, (Object as any).assign(profile, { accessToken }));
    }));
  }
}

export default new Server().app;
