-- Run with psql while connected to the default "postgres" database.
SELECT 'CREATE DATABASE spiraltrack_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'spiraltrack_db')
\gexec
