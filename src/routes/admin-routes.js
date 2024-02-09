import express from 'express';
import passport from 'passport';
import { ensureLoggedIn } from '../lib/users.js';
import { getMatches } from '../lib/matches.js';
import { getGamesWithTeamNames } from '../lib/database.js';

export const adminRouter = express.Router();

async function indexRoute(req, res) {
  return res.render('login', {
    title: 'Innskráning',
  });
}

async function adminRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  return res.render('admin', {
    title: 'Admin síða',
    matches: getMatches(await getGamesWithTeamNames()),
    user,
    loggedIn,
  });
}

adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);
