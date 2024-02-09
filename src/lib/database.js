import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: "vfor2verkefni2"
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
