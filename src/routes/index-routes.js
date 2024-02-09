import express from 'express';
import { getGamesWithTeamNames } from '../lib/database.js';
import { calculateStandings, getMatches } from '../lib/matches.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  return res.render('index', {
    title: 'Knattspyrnudeildin',
    user,
    loggedIn,
  });
}

async function leikirRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  return res.render('leikir', {
    title: 'Leikir',
    matches: getMatches(await getGamesWithTeamNames()),
    user,
    loggedIn,
  });
}

async function stadaRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  return res.render('stada', {
    title: 'Staðan',
    teams: calculateStandings(await getGamesWithTeamNames()),
    user,
    loggedIn,
  });
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
