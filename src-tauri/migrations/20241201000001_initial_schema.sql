-- Create Plugin table
CREATE TABLE IF NOT EXISTS Plugin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    name TEXT NOT NULL,
    repository TEXT NOT NULL,
    version TEXT NOT NULL,
    path TEXT NOT NULL
);

-- Create Comic table
CREATE TABLE IF NOT EXISTS Comic (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT NOT NULL,
    repo TEXT NOT NULL,
    author TEXT,
    artist TEXT,
    publisher TEXT,
    status TEXT,
    genres TEXT,
    site_link TEXT,
    year TEXT,
    synopsis TEXT NOT NULL,
    type TEXT NOT NULL
);

-- Create Chapter table
CREATE TABLE IF NOT EXISTS Chapter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comic_id INTEGER NOT NULL,
    site_id TEXT NOT NULL,
    site_link TEXT,
    release_id TEXT,
    repo TEXT NOT NULL,
    name TEXT,
    number TEXT NOT NULL,
    pages TEXT,
    date TEXT,
    offline BOOLEAN NOT NULL DEFAULT FALSE,
    language TEXT,
    FOREIGN KEY (comic_id) REFERENCES Comic(id)
);

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create ReadProgress table
CREATE TABLE IF NOT EXISTS ReadProgress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    comic_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    total_pages INTEGER NOT NULL,
    page INTEGER NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES Chapter(id),
    FOREIGN KEY (comic_id) REFERENCES Comic(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapter_comic_id ON Chapter(comic_id);
CREATE INDEX IF NOT EXISTS idx_read_progress_chapter_id ON ReadProgress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_read_progress_comic_id ON ReadProgress(comic_id);
CREATE INDEX IF NOT EXISTS idx_read_progress_user_id ON ReadProgress(user_id);
