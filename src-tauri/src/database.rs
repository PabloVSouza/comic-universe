use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool, query, query_as};
use std::path::Path;
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
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Self { pool })
    }

    // Plugin methods
    pub async fn get_all_plugins(&self) -> Result<Vec<Plugin>> {
        let plugins = sqlx::query_as::<_, Plugin>("SELECT * FROM Plugin")
            .fetch_all(&self.pool)
            .await?;
        Ok(plugins)
    }

    pub async fn insert_plugin(&self, plugin: &Plugin) -> Result<i64> {
        let result = sqlx::query!(
            "INSERT INTO Plugin (enabled, name, repository, version, path) VALUES (?, ?, ?, ?, ?)",
            plugin.enabled,
            plugin.name,
            plugin.repository,
            plugin.version,
            plugin.path
        )
        .execute(&self.pool)
        .await?;
        
        Ok(result.last_insert_rowid())
    }

    // Comic methods
    pub async fn get_comic(&self, id: i64) -> Result<Option<Comic>> {
        let comic = sqlx::query_as::<_, Comic>("SELECT * FROM Comic WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(comic)
    }

    pub async fn get_comic_with_chapters(&self, id: i64, user_id: i64) -> Result<Option<ComicWithChapters>> {
        let comic = self.get_comic(id).await?;
        
        if let Some(comic) = comic {
            let chapters = sqlx::query!(
                r#"
                SELECT c.*, rp.id as progress_id, rp.total_pages, rp.page as current_page
                FROM Chapter c
                LEFT JOIN ReadProgress rp ON c.id = rp.chapter_id AND rp.user_id = ?
                WHERE c.comic_id = ?
                "#,
                user_id,
                id
            )
            .fetch_all(&self.pool)
            .await?;

            let chapters_with_progress: Vec<ChapterWithProgress> = chapters
                .into_iter()
                .map(|row| {
                    let chapter = Chapter {
                        id: row.id,
                        comic_id: row.comic_id,
                        site_id: row.site_id,
                        site_link: row.site_link,
                        release_id: row.release_id,
                        repo: row.repo,
                        name: row.name,
                        number: row.number,
                        pages: row.pages,
                        date: row.date,
                        offline: row.offline != 0,
                        language: row.language,
                    };

                    let read_progress = if let Some(progress_id) = row.progress_id {
                        Some(vec![ReadProgress {
                            id: progress_id,
                            chapter_id: row.id,
                            comic_id: id,
                            user_id,
                            total_pages: row.total_pages.unwrap_or(0),
                            page: row.current_page.unwrap_or(0),
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
        let comics = sqlx::query_as::<_, Comic>("SELECT * FROM Comic")
            .fetch_all(&self.pool)
            .await?;
        Ok(comics)
    }

    pub async fn insert_comic(&self, comic: &Comic, chapters: &[Chapter], repo: &str) -> Result<i64> {
        let mut tx = self.pool.begin().await?;

        // Insert comic
        let comic_result = sqlx::query!(
            r#"
            INSERT INTO Comic (site_id, name, cover, repo, author, artist, publisher, status, genres, site_link, year, synopsis, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            comic.site_id,
            comic.name,
            comic.cover,
            repo,
            comic.author,
            comic.artist,
            comic.publisher,
            comic.status,
            comic.genres,
            comic.site_link,
            comic.year,
            comic.synopsis,
            comic.r#type
        )
        .execute(&mut *tx)
        .await?;

        let comic_id = comic_result.last_insert_rowid();

        // Insert chapters
        for chapter in chapters {
            sqlx::query!(
                r#"
                INSERT INTO Chapter (comic_id, site_id, site_link, release_id, repo, name, number, pages, date, offline, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
                comic_id,
                chapter.site_id,
                chapter.site_link,
                chapter.release_id,
                repo,
                chapter.name,
                chapter.number,
                chapter.pages,
                chapter.date,
                chapter.offline,
                chapter.language
            )
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(comic_id)
    }

    pub async fn delete_comic(&self, comic: &Comic) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Delete read progress
        sqlx::query!("DELETE FROM ReadProgress WHERE comic_id = ?", comic.id)
            .execute(&mut *tx)
            .await?;

        // Delete chapters
        sqlx::query!("DELETE FROM Chapter WHERE comic_id = ?", comic.id)
            .execute(&mut *tx)
            .await?;

        // Delete comic
        sqlx::query!("DELETE FROM Comic WHERE id = ?", comic.id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }

    // Chapter methods
    pub async fn get_chapters(&self, comic_id: i64) -> Result<Vec<Chapter>> {
        let chapters = sqlx::query_as::<_, Chapter>("SELECT * FROM Chapter WHERE comic_id = ?")
            .bind(comic_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(chapters)
    }

    pub async fn get_chapters_without_pages(&self) -> Result<Vec<Chapter>> {
        let chapters = sqlx::query_as::<_, Chapter>("SELECT * FROM Chapter WHERE pages IS NULL")
            .fetch_all(&self.pool)
            .await?;
        Ok(chapters)
    }

    pub async fn insert_chapters(&self, chapters: &[Chapter]) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        for chapter in chapters {
            sqlx::query!(
                r#"
                INSERT INTO Chapter (comic_id, site_id, site_link, release_id, repo, name, number, pages, date, offline, language)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
                chapter.comic_id,
                chapter.site_id,
                chapter.site_link,
                chapter.release_id,
                chapter.repo,
                chapter.name,
                chapter.number,
                chapter.pages,
                chapter.date,
                chapter.offline,
                chapter.language
            )
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn update_chapter(&self, chapter: &Chapter) -> Result<Chapter> {
        sqlx::query!(
            r#"
            UPDATE Chapter 
            SET site_id = ?, site_link = ?, release_id = ?, repo = ?, name = ?, number = ?, pages = ?, date = ?, offline = ?, language = ?
            WHERE id = ?
            "#,
            chapter.site_id,
            chapter.site_link,
            chapter.release_id,
            chapter.repo,
            chapter.name,
            chapter.number,
            chapter.pages,
            chapter.date,
            chapter.offline,
            chapter.language,
            chapter.id
        )
        .execute(&self.pool)
        .await?;

        Ok(chapter.clone())
    }

    // Read Progress methods
    pub async fn get_read_progress(&self, chapter_id: Option<i64>, comic_id: Option<i64>, user_id: Option<i64>) -> Result<Vec<ReadProgress>> {
        let mut query = "SELECT * FROM ReadProgress WHERE 1=1".to_string();
        let mut params = Vec::new();

        if let Some(chapter_id) = chapter_id {
            query.push_str(" AND chapter_id = ?");
            params.push(chapter_id.to_string());
        }

        if let Some(comic_id) = comic_id {
            query.push_str(" AND comic_id = ?");
            params.push(comic_id.to_string());
        }

        if let Some(user_id) = user_id {
            query.push_str(" AND user_id = ?");
            params.push(user_id.to_string());
        }

        let mut query_builder = sqlx::query_as::<_, ReadProgress>(&query);
        
        for param in params {
            query_builder = query_builder.bind(param.parse::<i64>().unwrap());
        }

        let progress = query_builder.fetch_all(&self.pool).await?;
        Ok(progress)
    }

    pub async fn update_read_progress(&self, read_progress: &ReadProgress) -> Result<()> {
        if read_progress.id == 0 {
            // Insert new progress
            sqlx::query!(
                "INSERT INTO ReadProgress (chapter_id, comic_id, user_id, total_pages, page) VALUES (?, ?, ?, ?, ?)",
                read_progress.chapter_id,
                read_progress.comic_id,
                read_progress.user_id,
                read_progress.total_pages,
                read_progress.page
            )
            .execute(&self.pool)
            .await?;
        } else {
            // Update existing progress
            sqlx::query!(
                "UPDATE ReadProgress SET chapter_id = ?, comic_id = ?, user_id = ?, total_pages = ?, page = ? WHERE id = ?",
                read_progress.chapter_id,
                read_progress.comic_id,
                read_progress.user_id,
                read_progress.total_pages,
                read_progress.page,
                read_progress.id
            )
            .execute(&self.pool)
            .await?;
        }

        Ok(())
    }

    // User methods
    pub async fn get_all_users(&self) -> Result<Vec<User>> {
        let users = sqlx::query_as::<_, User>("SELECT * FROM User")
            .fetch_all(&self.pool)
            .await?;
        Ok(users)
    }

    pub async fn update_user(&self, user: &User) -> Result<User> {
        if user.id == 0 {
            // Insert new user
            let result = sqlx::query!(
                "INSERT INTO User (name, \"default\") VALUES (?, ?)",
                user.name,
                user.default
            )
            .execute(&self.pool)
            .await?;

            Ok(User {
                id: result.last_insert_rowid(),
                name: user.name.clone(),
                default: user.default,
            })
        } else {
            // Update existing user
            sqlx::query!(
                "UPDATE User SET name = ?, \"default\" = ? WHERE id = ?",
                user.name,
                user.default,
                user.id
            )
            .execute(&self.pool)
            .await?;

            Ok(user.clone())
        }
    }

    pub async fn delete_user(&self, id: i64) -> Result<()> {
        let mut tx = self.pool.begin().await?;

        // Delete read progress
        sqlx::query!("DELETE FROM ReadProgress WHERE user_id = ?", id)
            .execute(&mut *tx)
            .await?;

        // Delete user
        sqlx::query!("DELETE FROM User WHERE id = ?", id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(())
    }
}
