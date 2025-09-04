// use chrono::{DateTime, Utc}; // Currently unused
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plugin {
    pub id: i64,
    pub enabled: bool,
    pub name: String,
    pub repository: String,
    pub version: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Comic {
    pub id: i64,
    pub site_id: String,
    pub name: String,
    pub cover: String,
    pub repo: String,
    pub author: Option<String>,
    pub artist: Option<String>,
    pub publisher: Option<String>,
    pub status: Option<String>,
    pub genres: Option<String>,
    pub site_link: Option<String>,
    pub year: Option<String>,
    pub synopsis: String,
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Chapter {
    pub id: i64,
    pub comic_id: i64,
    pub site_id: String,
    pub site_link: Option<String>,
    pub release_id: Option<String>,
    pub repo: String,
    pub name: Option<String>,
    pub number: String,
    pub pages: Option<String>,
    pub date: Option<String>,
    pub offline: bool,
    pub language: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ReadProgress {
    pub id: i64,
    pub chapter_id: i64,
    pub comic_id: i64,
    pub user_id: i64,
    pub total_pages: i64,
    pub page: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub default: bool,
}

// DTOs for API communication
#[derive(Debug, Serialize, Deserialize)]
pub struct ComicWithChapters {
    #[serde(flatten)]
    pub comic: Comic,
    pub chapters: Option<Vec<ChapterWithProgress>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChapterWithProgress {
    #[serde(flatten)]
    pub chapter: Chapter,
    pub read_progress: Option<Vec<ReadProgress>>,
}

// Request/Response types
#[derive(Debug, Deserialize)]
pub struct GetComicRequest {
    pub id: i64,
}

#[derive(Debug, Deserialize)]
pub struct GetComicAdditionalDataRequest {
    pub id: i64,
    pub user_id: i64,
}

#[derive(Debug, Deserialize)]
pub struct InsertComicRequest {
    pub comic: Comic,
    pub chapters: Vec<Chapter>,
    pub repo: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteComicRequest {
    pub comic: Comic,
}

#[derive(Debug, Deserialize)]
pub struct GetChaptersRequest {
    pub comic_id: i64,
}

#[derive(Debug, Deserialize)]
pub struct InsertChaptersRequest {
    pub chapters: Vec<Chapter>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateChapterRequest {
    pub chapter: Chapter,
}

#[derive(Debug, Deserialize)]
pub struct UpdateReadProgressRequest {
    pub read_progress: ReadProgress,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub user: User,
}

#[derive(Debug, Deserialize)]
pub struct DeleteUserRequest {
    pub id: i64,
}

// Plugin-related types
#[derive(Debug, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub path: String,
    pub author: Option<String>,
    pub version: String,
    pub repository: String,
    pub icon_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RepoOption {
    pub label: String,
    pub value: String,
}

// App-related types
#[derive(Debug, Serialize, Deserialize)]
pub struct AppData {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppParams {
    pub app_running_path: String,
    pub app_path: String,
    pub is_dev: bool,
}
