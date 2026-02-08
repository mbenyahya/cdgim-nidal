-- Base CGDim pour PostgreSQL (pgAdmin 4)
-- IMPORTANT : exécuter les deux blocs SÉPARÉMENT (un par un), pas tout d'un coup.
-- Sinon : "CREATE DATABASE cannot run inside a transaction block"

-- ========== ÉTAPE 1 : exécuter uniquement ce qui suit (F5) ==========
CREATE USER cgdim WITH PASSWORD 'cgdim';

-- ========== ÉTAPE 2 : puis exécuter uniquement ce qui suit (F5) ==========
CREATE DATABASE cgdim OWNER cgdim ENCODING 'UTF8';
