require('dotenv').config()

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "genereactoni";

const PORT = process.env.PORT || 3000;
const PRINT_TO_CONSOLE = process.env.PRINT_TO_CONSOLE || true;
const PRINT_TO_FILE = process.env.PRINT_TO_FILE || false;
const LOGGER_FILE_PATH = process.env.LOGGER_FILE_PATH || false;
const ELASTIC_URI = process.env.ELASTIC_URI || 'localhost:9200';

module.exports = { DB_URI, DB_NAME, PORT, PRINT_TO_FILE, PRINT_TO_CONSOLE, LOGGER_FILE_PATH, ELASTIC_URI };
