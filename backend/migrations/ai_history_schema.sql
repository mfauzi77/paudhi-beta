-- Tabel untuk mencatat riwayat penggunaan AI
CREATE TABLE IF NOT EXISTS ai_history (
    id SERIAL PRIMARY KEY,
    app_owner VARCHAR(50) NOT NULL,
    prompt_preview TEXT,
    response TEXT,
    status VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
