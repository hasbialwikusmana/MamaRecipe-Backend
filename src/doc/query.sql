-- USERS

-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   phone VARCHAR(255) NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   image VARCHAR(255),
--   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

npx sequelize-cli model:generate --name user --attributes name:STRING,email:STRING,phone:STRING,password:STRING,image:STRING


npx sequelize-cli db:migrate

-- INSERT INTO users (name, email, phone, password, image) VALUES

-- RECIPES

-- CREATE TABLE recipe (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   ingredients TEXT NOT NULL,
--   image VARCHAR(255),
--   video VARCHAR(255),
--   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

npx sequelize-cli model:generate --name recipe --attributes user_id:INTEGER,title:STRING,ingredients:TEXT,image:STRING,video:STRING

npx sequelize-cli db:migrate

npx sequelize-cli seed:generate --name default-recipe 

-- INSERT INTO recipes (user_id, title, ingredients, image, video) VALUES

-- COMMENTS

-- CREATE TABLE comments (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   comment TEXT NOT NULL,
--   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

npx sequelize-cli model:generate --name comment --attributes user_id:INTEGER,recipe_id:INTEGER,comment:TEXT

npx sequelize-cli db:migrate
-- INSERT INTO comments (user_id, recipe_id, comment) VALUES

-- liked

-- CREATE TABLE liked (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

npx sequelize-cli model:generate --name like --attributes user_id:INTEGER,recipe_id:INTEGER

npx sequelize-cli db:migrate

-- INSERT INTO liked (user_id, recipe_id) VALUES

-- saved

-- CREATE TABLE saved (
--   id SERIAL PRIMARY KEY,
--   user_id INT NOT NULL,
--   recipe_id INT NOT NULL,
--   createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

npx sequelize-cli model:generate --name favorite --attributes user_id:INTEGER,recipe_id:INTEGER

npx sequelize-cli db:migrate


-- INSERT INTO saved (user_id, recipe_id) VALUES


