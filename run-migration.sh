#!/bin/bash
# This script will run the migration to add all questions to the database

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Applying database migrations for academic-app...${NC}"

# Set environment variables from docker-compose.yml
DB_CONTAINER="academic-app-db"
DB_USER="academicapp"
DB_NAME="academicapp"
DB_PASSWORD="academicapppass"

# First, make sure the DB container is running
echo -e "${YELLOW}Checking if database container is running...${NC}"
if ! docker ps | grep -q $DB_CONTAINER; then
    echo -e "${RED}Database container not running. Starting it...${NC}"
    docker-compose up -d db
    # Wait for DB to be ready
    sleep 5
fi

# Create schema if it doesn't exist
echo -e "${YELLOW}Creating schema if it doesn't exist...${NC}"
docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "CREATE SCHEMA IF NOT EXISTS study_app;"

# Check if the table exists and has the right structure
echo -e "${YELLOW}Checking if table exists with correct structure...${NC}"
TABLE_EXISTS=$(docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'study_app' AND table_name = 'preguntas');")
if [[ $TABLE_EXISTS == *"t"* ]]; then
    echo -e "${GREEN}Table preguntas exists${NC}"
    # Check if the respuesta_correcta column exists
    COL_EXISTS=$(docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'study_app' AND table_name = 'preguntas' AND column_name = 'respuesta_correcta');")
    if [[ $COL_EXISTS != *"t"* ]]; then
        echo -e "${YELLOW}Adding respuesta_correcta column...${NC}"
        docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "ALTER TABLE study_app.preguntas ADD COLUMN respuesta_correcta TEXT;"
    else
        echo -e "${GREEN}Column respuesta_correcta exists${NC}"
    fi
else
    echo -e "${YELLOW}Creating preguntas table...${NC}"
    docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
    CREATE TABLE study_app.preguntas (
        id SERIAL PRIMARY KEY,
        text_content TEXT NOT NULL,
        respuesta_correcta TEXT,
        raw_source TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );"
fi

# Run the migrations
echo -e "${YELLOW}Running migrations...${NC}"
docker cp ./database/migration.sql $DB_CONTAINER:/tmp/migration.sql
docker cp ./database/migration2.sql $DB_CONTAINER:/tmp/migration2.sql
docker cp ./database/migration3.sql $DB_CONTAINER:/tmp/migration3.sql

echo -e "${YELLOW}Applying migration 1...${NC}"
docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migration.sql
echo -e "${YELLOW}Applying migration 2...${NC}"
docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migration2.sql
echo -e "${YELLOW}Applying migration 3...${NC}"
docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migration3.sql

# Count the questions after migration
QUESTION_COUNT=$(docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM study_app.preguntas;" | tr -d ' ')
echo -e "${GREEN}Migration complete. Number of questions in database: $QUESTION_COUNT${NC}"
