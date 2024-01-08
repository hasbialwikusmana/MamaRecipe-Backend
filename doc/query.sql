-- USERS

-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   phone VARCHAR(255) NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   image VARCHAR(255),
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO users (name, email, phone, password, image) VALUES

-- RECIPES

-- CREATE TABLE recipes (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   ingredients TEXT NOT NULL,
--   image VARCHAR(255),
--   video VARCHAR(255),
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO recipes (user_id, title, ingredients, image, video) VALUES

-- COMMENTS

-- CREATE TABLE comments (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   comment TEXT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO comments (user_id, recipe_id, comment) VALUES

-- LIKES

-- CREATE TABLE likes (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO likes (user_id, recipe_id) VALUES

-- FAVORITES

-- CREATE TABLE favorites (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO favorites (user_id, recipe_id) VALUES


