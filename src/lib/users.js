/**
 * "Static notendagrunnur"
 * Notendur eru harðkóðaðir og ekkert hægt að breyta þeim.
 * Ef við notum notendagagnagrunn, t.d. í postgres, útfærum við leit að notendum
 * hér, ásamt því að passa upp á að lykilorð séu lögleg.
 */

import bcrypt from 'bcrypt';
import { getUserInfo, getUserByID } from './database.js';

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);
  if (ok) {
    return user;
  }

  return false;
}

/**
 * @param {String} username
 * @returns {Promise<object>} null ef notandi er ekki til, annars object {id: id, username: notendanafn, password: hashed_password}
 */
export async function findByUsername(username) {
  return getUserInfo(username);
}

/**
 * @param {*} id
 * @returns {Promise<object>} null ef notandi með id er ekki til, annars object {id: id, username: notendanafn, password: hashed_password}
 */
export async function findById(id) {
  return getUserByID(id);
}

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}
