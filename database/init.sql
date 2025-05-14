-- Initialize database for study app

-- Create questions table
CREATE TABLE preguntas (s
    id SERIAL PRIMARY KEY,
    text_content TEXT NOT NULL, -- Contenido textual de la pregunta
    raw_source TEXT -- Origen o contexto crudo (ej: "PDF_Test_1, pag 3")
);

-- Add some sample data for testing
INSERT INTO preguntas (text_content, raw_source) 
VALUES 
    ('¿Cuál es la capital de Francia?', 'Test_Manual'),
    ('¿Quién escribió Don Quijote de la Mancha?', 'Test_Manual');