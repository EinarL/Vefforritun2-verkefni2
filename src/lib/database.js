import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres({
  host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: 'vfor2verkefni2'
})


export async function getTeams() {
  const teams = await sql`SELECT name FROM Teams`;
  return teams;
}

export async function getGames() {
  const games = await sql`SELECT * FROM games`;
  return games;
}


export async function getGamesWithTeamNames() {
  const games = await sql`SELECT g.*, th.name AS home_team, ta.name AS away_team
  FROM games AS g
  JOIN teams th ON g.home = th.id
  JOIN teams ta ON g.away = ta.id`;

  return games;
}

export async function getUserInfo(username){
  const user = await sql`SELECT * FROM users WHERE username = ${username}`;
  if (user.length > 0){
    return user[0];
  }
  return null;
}

export async function getUserByID(id){
  const user = await sql`SELECT * FROM users WHERE id = ${id}`;
  if (user.length > 0){
    return user[0];
  }
  return null;
}

export async function doesTeamExist(team){
  const result = await sql`SELECT * FROM teams WHERE name = ${team}`;
  if (result.length > 0) return true;
  return false;
}


async function getTeamID(team){
  const result = await sql`SELECT id FROM teams WHERE name = ${team}`;
  if (result.length < 1){
    console.warn(`did not find team ${team} in the teams table, this should not happen`);
    return;
  }
  return result[0].id;
}
/**
 * @param {string} date
 * @param {string} homeName
 * @param {string} awayName
 * @param {number} homeScore
 * @param {number} awayScore
 * @returns returns an error message if there is an error with adding the match to the database
 */
export async function addMatchToDatabase(date, homeName, awayName, homeScore, awayScore){
  const homeID = await getTeamID(homeName);
  const awayID = await getTeamID(awayName);

  try {
    await sql`INSERT INTO games (date, home, away, home_score, away_score)
          VALUES (${date},${homeID},${awayID},${homeScore},${awayScore})`;
  } catch (err) {
    console.error('Error adding match to the database:', err);
    return 'Það náðist ekki að bæta leiknum við gagnagrunninn';
  }

}
