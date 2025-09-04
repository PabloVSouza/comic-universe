use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool, Row};
use anyhow::Result;
use crate::models::*;

pub struct DatabaseManager {
    pool: SqlitePool,
}

impl DatabaseManager {
    pub async fn new(database_path: &str) -> Result<Self> {
        // Create database if it doesn't exist
        if !Sqlite::database_exists(database_path).await.unwrap_or(false) {
            Sqlite::create_database(database_path).await?;
        }

        let pool = SqlitePool::connect(database_path).await?;
        
        // Create tables manually since we're not using migrations
        let db = Self { pool };
        db.create_tables().await?;
        
        Ok(db)
    }

    async fn create_tables(&self) -> Result<()> {
        // Create tables manually
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS Plugin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                enabled BOOLEAN NOT NULL DEFAULT TRUE,
                name TEXT NOT NULL,
                repository TEXT NOT NULL,
                version TEXT NOT NULL,
                path TEXT NOT NULL
            )
        "#).execute(&self.pool).await?;

        sqlx::query(r#"
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
            )
        "#).execute(&self.pool).await?;

        sqlx::query(r#"
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
            )
        "#).execute(&self.pool).await?;

        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS User (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                "default" BOOLEAN NOT NULL DEFAULT FALSE
            )
        "#).execute(&self.pool).await?;

        sqlx::query(r#"
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
            )
        "#).execute(&self.pool).await?;

        Ok(())
    }

    // Comic methods
    pub async fn get_comic(&self, id: i64) -> Result<Option<Comic>> {
        let row = sqlx::query("SELECT * FROM Comic WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(row) = row {
            Ok(Some(Comic {
                id: row.get("id"),
                site_id: row.get("site_id"),
                name: row.get("name"),
                cover: row.get("cover"),
                repo: row.get("repo"),
                author: row.get("author"),
                artist: row.get("artist"),
                publisher: row.get("publisher"),
                status: row.get("status"),
                genres: row.get("genres"),
                site_link: row.get("site_link"),
                year: row.get("year"),
                synopsis: row.get("synopsis"),
                r#type: row.get("type"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_comic_with_chapters(&self, id: i64, user_id: i64) -> Result<Option<ComicWithChapters>> {
        let comic = self.get_comic(id).await?;
        
        if let Some(comic) = comic {
            let chapters_rows = sqlx::query(
                r#"
                SELECT c.*, rp.id as progress_id, rp.total_pages, rp.page as current_page
                FROM Chapter c
                LEFT JOIN ReadProgress rp ON c.id = rp.chapter_id AND rp.user_id = ?
                WHERE c.comic_id = ?
                "#
            )
            .bind(user_id)
            .bind(id)
            .fetch_all(&self.pool)
            .await?;

            let chapters_with_progress: Vec<ChapterWithProgress> = chapters_rows
                .into_iter()
                .map(|row| {
                    let chapter = Chapter {
                        id: row.get("id"),
                        comic_id: row.get("comic_id"),
                        site_id: row.get("site_id"),
                        site_link: row.get("site_link"),
                        release_id: row.get("release_id"),
                        repo: row.get("repo"),
                        name: row.get("name"),
                        number: row.get("number"),
                        pages: row.get("pages"),
                        date: row.get("date"),
                        offline: row.get::<i64, _>("offline") != 0,
                        language: row.get("language"),
                    };

                    let read_progress = if let Some(progress_id) = row.try_get::<Option<i64>, _>("progress_id").ok().flatten() {
                        Some(vec![ReadProgress {
                            id: progress_id,
                            chapter_id: row.get("id"),
                            comic_id: id,
                            user_id,
                            total_pages: row.get::<Option<i64>, _>("total_pages").unwrap_or(0),
                            page: row.get::<Option<i64>, _>("current_page").unwrap_or(0),
                        }])
                    } else {
                        None
                    };

                    ChapterWithProgress {
                        chapter,
                        read_progress,
                    }
                })
                .collect();

            Ok(Some(ComicWithChapters {
                comic,
                chapters: Some(chapters_with_progress),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_all_comics(&self) -> Result<Vec<Comic>> {
        let rows = sqlx::query("SELECT * FROM Comic")
            .fetch_all(&self.pool)
            .await?;

        let comics = rows.into_iter().map(|row| Comic {
            id: row.get("id"),
            site_id: row.get("site_id"),
            name: row.get("name"),
            cover: row.get("cover"),
            repo: row.get("repo"),
            author: row.get("author"),
            artist: row.get("artist"),
            publisher: row.get("publisher"),
            status: row.get("status"),
            genres: row.get("genres"),
            site_link: row.get("site_link"),
            year: row.get("year"),
            synopsis: row.get("synopsis"),
            r#type: row.get("type"),
        }).collect();

        Ok(comics)
    }

    pub async fn insert_comic(&self, comic: &Comic, chapters: &[Chapter], repo: &str) -> Result<i64> {
        let mut tx = self.pool.begin().await?;

        // Insert comic
        let comic_result = sqlx::query(
            r#"
            INSERT INTO Comic (site_id, name, cover, repo, author, artist, publisher, status, genres, site_link, year, synopsis, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&comic.site_id)
        .bind(&comic.name)
        .bind(&comic.cover)
        .bind(repo)
        .bind(&comic.author)
        .bind(&comic.artist)
        .bind(&comic.publisher)
        .bind(&comic.status)
        .bind(&comic.genres)
        .bind(&comic.site_link)
        .bind(&comic.year)
        .bind(&comic.synopsis)
        .bind(&comic.r#type)
        .execute(&mut *tx)
        .await?;

        let comic_id = comic_result.last_insert_rowid();

        // Insert chapters
        for chapter in chapters {
            sqlx::query(
                r#"
                INSERT INTO Chapter (comic_id, site_id, site_link, release_id, repo, name, number, pages, date, offline, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#
            )
            .bind(comic_id)
            .bind(&chapter.site_id)
            .bind(&chapter.site_link)
            .bind(&chapter.release_id)
            .bind(repo)
            .bind(&chapter.name)
            .bind(&chapter.number)
            .bind(&chapter.pages)
            .bind(&chapter.date)
            .bind(chapter.offline)
            .bind(&chapter.language)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(comic_id)
    }

    pub async fn delete_comic(&self, comic: &Comic) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Delete read progress
        sqlx::query("DELETE FROM ReadProgress WHERE comic_id = ?")
            .bind(comic.id)
            .execute(&mut *tx)
            .await?;

        // Delete chapters
        sqlx::query("DELETE FROM Chapter WHERE comic_id = ?")
            .bind(comic.id)
            .execute(&mut *tx)
            .await?;

        // Delete comic
        sqlx::query("DELETE FROM Comic WHERE id = ?")
            .bind(comic.id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    // Chapter methods
    pub async fn get_chapters(&self, comic_id: i64) -> Result<Vec<Chapter>> {
        let rows = sqlx::query("SELECT * FROM Chapter WHERE comic_id = ?")
            .bind(comic_id)
            .fetch_all(&self.pool)
            .await?;

        let chapters = rows.into_iter().map(|row| Chapter {
            id: row.get("id"),
            comic_id: row.get("comic_id"),
            site_id: row.get("site_id"),
            site_link: row.get("site_link"),
            release_id: row.get("release_id"),
            repo: row.get("repo"),
            name: row.get("name"),
            number: row.get("number"),
            pages: row.get("pages"),
            date: row.get("date"),
            offline: row.get::<i64, _>("offline") != 0,
            language: row.get("language"),
        }).collect();

        Ok(chapters)
    }

    pub async fn get_chapters_without_pages(&self) -> Result<Vec<Chapter>> {
        let rows = sqlx::query("SELECT * FROM Chapter WHERE pages IS NULL")
            .fetch_all(&self.pool)
            .await?;

        let chapters = rows.into_iter().map(|row| Chapter {
            id: row.get("id"),
            comic_id: row.get("comic_id"),
            site_id: row.get("site_id"),
            site_link: row.get("site_link"),
            release_id: row.get("release_id"),
            repo: row.get("repo"),
            name: row.get("name"),
            number: row.get("number"),
            pages: row.get("pages"),
            date: row.get("date"),
            offline: row.get::<i64, _>("offline") != 0,
            language: row.get("language"),
        }).collect();

        Ok(chapters)
    }

    pub async fn insert_chapters(&self, chapters: &[Chapter]) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        for chapter in chapters {
            sqlx::query(
                r#"
                INSERT INTO Chapter (comic_id, site_id, site_link, release_id, repo, name, number, pages, date, offline, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#
            )
            .bind(chapter.comic_id)
            .bind(&chapter.site_id)
            .bind(&chapter.site_link)
            .bind(&chapter.release_id)
            .bind(&chapter.repo)
            .bind(&chapter.name)
            .bind(&chapter.number)
            .bind(&chapter.pages)
            .bind(&chapter.date)
            .bind(chapter.offline)
            .bind(&chapter.language)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn update_chapter(&self, chapter: &Chapter) -> Result<Chapter> {
        sqlx::query(
            r#"
            UPDATE Chapter 
            SET site_id = ?, site_link = ?, release_id = ?, repo = ?, name = ?, number = ?, pages = ?, date = ?, offline = ?, language = ?
            WHERE id = ?
            "#
        )
        .bind(&chapter.site_id)
        .bind(&chapter.site_link)
        .bind(&chapter.release_id)
        .bind(&chapter.repo)
        .bind(&chapter.name)
        .bind(&chapter.number)
        .bind(&chapter.pages)
        .bind(&chapter.date)
        .bind(chapter.offline)
        .bind(&chapter.language)
        .bind(chapter.id)
        .execute(&self.pool)
        .await?;

        Ok(chapter.clone())
    }

    // Read Progress methods
    pub async fn get_read_progress(&self, chapter_id: Option<i64>, comic_id: Option<i64>, user_id: Option<i64>) -> Result<Vec<ReadProgress>> {
        // Build the query dynamically with proper parameter binding
        let mut conditions = Vec::new();
        let mut params = Vec::new();

        if let Some(chapter_id) = chapter_id {
            conditions.push("chapter_id = ?");
            params.push(chapter_id);
        }

        if let Some(comic_id) = comic_id {
            conditions.push("comic_id = ?");
            params.push(comic_id);
        }

        if let Some(user_id) = user_id {
            conditions.push("user_id = ?");
            params.push(user_id);
        }

        let mut query_str = "SELECT * FROM ReadProgress".to_string();
        if !conditions.is_empty() {
            query_str.push_str(" WHERE ");
            query_str.push_str(&conditions.join(" AND "));
        }

        let mut query = sqlx::query(&query_str);
        for param in params {
            query = query.bind(param);
        }

        let rows = query.fetch_all(&self.pool).await?;

        let progress = rows.into_iter().map(|row| ReadProgress {
            id: row.get("id"),
            chapter_id: row.get("chapter_id"),
            comic_id: row.get("comic_id"),
            user_id: row.get("user_id"),
            total_pages: row.get("total_pages"),
            page: row.get("page"),
        }).collect();

        Ok(progress)
    }

    pub async fn update_read_progress(&self, read_progress: &ReadProgress) -> Result<()> {
        if read_progress.id == 0 {
            // Insert new progress
            sqlx::query(
                "INSERT INTO ReadProgress (chapter_id, comic_id, user_id, total_pages, page) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(read_progress.chapter_id)
            .bind(read_progress.comic_id)
            .bind(read_progress.user_id)
            .bind(read_progress.total_pages)
            .bind(read_progress.page)
            .execute(&self.pool)
            .await?;
        } else {
            // Update existing progress
            sqlx::query(
                "UPDATE ReadProgress SET chapter_id = ?, comic_id = ?, user_id = ?, total_pages = ?, page = ? WHERE id = ?"
            )
            .bind(read_progress.chapter_id)
            .bind(read_progress.comic_id)
            .bind(read_progress.user_id)
            .bind(read_progress.total_pages)
            .bind(read_progress.page)
            .bind(read_progress.id)
            .execute(&self.pool)
            .await?;
        }

        Ok(())
    }

    // User methods
    pub async fn get_all_users(&self) -> Result<Vec<User>> {
        let rows = sqlx::query("SELECT * FROM User")
            .fetch_all(&self.pool)
            .await?;

        let users = rows.into_iter().map(|row| User {
            id: row.get("id"),
            name: row.get("name"),
            default: row.get::<i64, _>("default") != 0,
        }).collect();

        Ok(users)
    }

    pub async fn update_user(&self, user: &User) -> Result<User> {
        if user.id == 0 {
            // Insert new user
            let result = sqlx::query(
                "INSERT INTO User (name, \"default\") VALUES (?, ?)"
            )
            .bind(&user.name)
            .bind(user.default)
            .execute(&self.pool)
            .await?;

            Ok(User {
                id: result.last_insert_rowid(),
                name: user.name.clone(),
                default: user.default,
            })
        } else {
            // Update existing user
            sqlx::query(
                "UPDATE User SET name = ?, \"default\" = ? WHERE id = ?"
            )
            .bind(&user.name)
            .bind(user.default)
            .bind(user.id)
            .execute(&self.pool)
            .await?;

            Ok(user.clone())
        }
    }

    pub async fn delete_user(&self, id: i64) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Delete read progress
        sqlx::query("DELETE FROM ReadProgress WHERE user_id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        // Delete user
        sqlx::query("DELETE FROM User WHERE id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }
}
