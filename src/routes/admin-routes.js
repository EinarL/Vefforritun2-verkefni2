import express from 'express';
import passport from 'passport';
import { ensureLoggedIn } from '../lib/users.js';
import { getMatches, addMatch } from '../lib/matches.js';
import { getGamesWithTeamNames } from '../lib/database.js';

export const adminRouter = express.Router();

async function indexRoute(req, res) {
  const sessionMessage = req.session.messages;
  req.session.messages = []; // clear messages
  return res.render('login', {
    title: 'Innskráning',
    errorMessage: (sessionMessage && sessionMessage.length > 0) ? sessionMessage[0] : undefined
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
    failureMessage: 'Notendanafn eða lykilorð vitlaust',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

adminRouter.get('/logout', (req, res) => {
  req.logout((err) => {
    if(err) console.warn('error logging out:', err);

    res.redirect('/');
  });
});

// runs when trying to add a new match to the database
adminRouter.post('/admin', ensureLoggedIn,  async (req, res) => {
  const { date, home, away, home_score, away_score } = req.body; // get info about the match
  // add the match to the database, this returns an error message if it didn't work
  const errorMessage = await addMatch(date, home, away, home_score, away_score);

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  if (errorMessage) {
    res.render('admin', {
      title: 'Admin síða',
      matches: getMatches(await getGamesWithTeamNames()),
      user,
      loggedIn,
      errorMessage
     });
  } else {
    res.render('admin', {
      title: 'Admin síða',
      matches: getMatches(await getGamesWithTeamNames()),
      user,
      loggedIn,
      message: 'Leiknum var bætt við!'
     });
  }
});
