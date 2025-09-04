// use std::sync::Arc; // Currently unused
use tauri::{State, Window};
use crate::{
    utils::{GitHubApi, ComicUniverseApi, FileUtils},
    models::*,
    AppState,
};

// Database Commands
#[tauri::command]
pub async fn db_run_migrations(_state: State<'_, AppState>) -> Result<(), String> {
    // Migrations are run during database initialization
    Ok(())
}

#[tauri::command]
pub async fn db_verify_migrations(_state: State<'_, AppState>) -> Result<bool, String> {
    // In SQLx, migrations are automatically verified
    Ok(true)
}

#[tauri::command]
pub async fn db_get_comic(state: State<'_, AppState>, request: GetComicRequest) -> Result<Option<Comic>, String> {
    let comic = state.db.get_comic(request.id).await.map_err(|e| e.to_string())?;
    Ok(comic)
}

#[tauri::command]
pub async fn db_get_comic_additional_data(
    state: State<'_, AppState>, 
    request: GetComicAdditionalDataRequest
) -> Result<Option<ComicWithChapters>, String> {
    let comic = state.db.get_comic_with_chapters(request.id, request.user_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(comic)
}

#[tauri::command]
pub async fn db_get_all_comics(state: State<'_, AppState>) -> Result<Vec<Comic>, String> {
    let comics = state.db.get_all_comics().await.map_err(|e| e.to_string())?;
    Ok(comics)
}

#[tauri::command]
pub async fn db_insert_comic(
    state: State<'_, AppState>, 
    request: InsertComicRequest
) -> Result<(), String> {
    state.db.insert_comic(&request.comic, &request.chapters, &request.repo)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn db_delete_comic(
    state: State<'_, AppState>, 
    request: DeleteComicRequest
) -> Result<(), String> {
    state.db.delete_comic(&request.comic).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn db_get_all_chapters_no_page(state: State<'_, AppState>) -> Result<Vec<Chapter>, String> {
    let chapters = state.db.get_chapters_without_pages().await.map_err(|e| e.to_string())?;
    Ok(chapters)
}

#[tauri::command]
pub async fn db_get_chapters(
    state: State<'_, AppState>, 
    request: GetChaptersRequest
) -> Result<Vec<Chapter>, String> {
    let chapters = state.db.get_chapters(request.comic_id).await.map_err(|e| e.to_string())?;
    Ok(chapters)
}

#[tauri::command]
pub async fn db_insert_chapters(
    state: State<'_, AppState>, 
    request: InsertChaptersRequest
) -> Result<(), String> {
    state.db.insert_chapters(&request.chapters).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn db_update_chapter(
    state: State<'_, AppState>, 
    request: UpdateChapterRequest
) -> Result<Chapter, String> {
    let chapter = state.db.update_chapter(&request.chapter).await.map_err(|e| e.to_string())?;
    Ok(chapter)
}

#[tauri::command]
pub async fn db_get_read_progress(
    state: State<'_, AppState>,
    chapter_id: Option<i64>,
    comic_id: Option<i64>,
    user_id: Option<i64>
) -> Result<Vec<ReadProgress>, String> {
    let progress = state.db.get_read_progress(chapter_id, comic_id, user_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(progress)
}

#[tauri::command]
pub async fn db_update_read_progress(
    state: State<'_, AppState>, 
    request: UpdateReadProgressRequest
) -> Result<(), String> {
    state.db.update_read_progress(&request.read_progress).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn db_get_all_users(state: State<'_, AppState>) -> Result<Vec<User>, String> {
    let users = state.db.get_all_users().await.map_err(|e| e.to_string())?;
    Ok(users)
}

#[tauri::command]
pub async fn db_update_user(
    state: State<'_, AppState>, 
    request: UpdateUserRequest
) -> Result<User, String> {
    let user = state.db.update_user(&request.user).await.map_err(|e| e.to_string())?;
    Ok(user)
}

#[tauri::command]
pub async fn db_delete_user(
    state: State<'_, AppState>, 
    request: DeleteUserRequest
) -> Result<(), String> {
    state.db.delete_user(request.id).await.map_err(|e| e.to_string())?;
    Ok(())
}

// App Commands
#[tauri::command]
pub fn get_app_data() -> Result<AppData, String> {
    Ok(AppData {
        name: env!("CARGO_PKG_NAME").to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        description: env!("CARGO_PKG_DESCRIPTION").to_string(),
        author: "Pablo Souza".to_string(),
    })
}

#[tauri::command]
pub fn path_join(args: Vec<String>) -> Result<String, String> {
    let path = FileUtils::join_path(&args);
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_app_params(state: State<'_, AppState>) -> Result<AppParams, String> {
    let is_dev = cfg!(debug_assertions);
    let app_params = state.app_params.lock().unwrap();
    Ok(AppParams {
        app_running_path: app_params.app_running_path.clone(),
        app_path: app_params.app_path.clone(),
        is_dev,
    })
}

#[tauri::command]
pub fn maximize_window(window: Window) -> Result<(), String> {
    if window.is_maximized().map_err(|e| e.to_string())? {
        window.unmaximize().map_err(|e| e.to_string())?;
    } else {
        window.maximize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())?;
    Ok(())
}

// Plugin Commands
#[tauri::command]
pub fn verify_plugin_folder_exists(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(state.plugin_manager.verify_plugin_folder_exists())
}

#[tauri::command]
pub async fn install_plugins(state: State<'_, AppState>) -> Result<(), String> {
    state.plugin_manager.update_plugins().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn activate_plugins(state: State<'_, AppState>) -> Result<(), String> {
    state.plugin_manager.startup().await.map_err(|e| e.to_string())?;
    
    // Emit update event to frontend
    // In Tauri 2.0, you would use the event system
    Ok(())
}

#[tauri::command]
pub async fn update_plugins(state: State<'_, AppState>) -> Result<(), String> {
    state.plugin_manager.update_plugins().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn download_and_install_plugin(
    state: State<'_, AppState>, 
    plugin: String
) -> Result<(), String> {
    state.plugin_manager.download_and_install_plugin(&plugin).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_plugins_from_api(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let plugins = state.plugin_manager.get_plugins_from_api().await.map_err(|e| e.to_string())?;
    Ok(plugins)
}

#[tauri::command]
pub fn get_plugin_info_list(state: State<'_, AppState>) -> Result<Vec<PluginInfo>, String> {
    let plugins = state.plugin_manager.get_plugin_info_list().map_err(|e| e.to_string())?;
    Ok(plugins)
}

#[tauri::command]
pub fn get_repo_list(state: State<'_, AppState>) -> Result<Vec<RepoOption>, String> {
    let repos = state.plugin_manager.get_repo_list();
    Ok(repos)
}

#[tauri::command]
pub async fn execute_plugin_method(
    state: State<'_, AppState>,
    plugin_name: String,
    method: String,
    args: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let response = state.plugin_manager.execute_plugin_method(&plugin_name, &method, args).await
        .map_err(|e| e.to_string())?;
    
    if response.success {
        Ok(response.data.unwrap_or(serde_json::Value::Null))
    } else {
        Err(response.error.unwrap_or("Unknown plugin error".to_string()))
    }
}

#[tauri::command]
pub async fn execute_plugin_method_async(
    state: State<'_, AppState>,
    plugin_name: String,
    method: String,
    args: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let response = state.plugin_manager.execute_plugin_method_async(&plugin_name, &method, args).await
        .map_err(|e| e.to_string())?;
    
    if response.success {
        Ok(response.data.unwrap_or(serde_json::Value::Null))
    } else {
        Err(response.error.unwrap_or("Unknown plugin error".to_string()))
    }
}

#[tauri::command]
pub fn get_active_plugins(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let plugins = state.plugin_manager.get_active_plugin_names();
    Ok(plugins)
}

#[tauri::command]
pub fn is_plugin_active(state: State<'_, AppState>, plugin_name: String) -> Result<bool, String> {
    let is_active = state.plugin_manager.is_plugin_active(&plugin_name);
    Ok(is_active)
}

// Search and List Commands
#[tauri::command]
pub async fn search(
    state: State<'_, AppState>,
    repo: String,
    data: serde_json::Value,
) -> Result<Vec<serde_json::Value>, String> {
    println!("🔍 Search command called with repo: {}, data: {}", repo, data);
    
    // Map repo value to plugin name
    let plugin_name = match repo.as_str() {
        "hqnow" => "comic-universe-plugin-hqnow",
        _ => return Err(format!("Unknown repository: {}", repo)),
    };
    
    println!("🔌 Mapped to plugin: {}", plugin_name);
    
    // Check if plugin is active
    if !state.plugin_manager.is_plugin_active(plugin_name) {
        return Err(format!("Plugin for repository '{}' is not active", repo));
    }
    
    println!("✅ Plugin is active, executing search...");
    
    // Execute search method on the plugin
    let response = state.plugin_manager.execute_plugin_method(plugin_name, "search", data).await
        .map_err(|e| e.to_string())?;
    
    if response.success {
        if let Some(data) = response.data {
            if let Some(array) = data.as_array() {
                println!("📋 Search returned {} results", array.len());
                Ok(array.clone())
            } else {
                println!("📋 Search returned single result");
                Ok(vec![data])
            }
        } else {
            println!("📋 Search returned no data");
            Ok(vec![])
        }
    } else {
        println!("❌ Search failed: {:?}", response.error);
        Err(response.error.unwrap_or("Search failed".to_string()))
    }
}

#[tauri::command]
pub async fn get_list(
    state: State<'_, AppState>,
    repo: String,
) -> Result<Vec<serde_json::Value>, String> {
    println!("📚 GetList command called with repo: {}", repo);
    
    // Map repo value to plugin name
    let plugin_name = match repo.as_str() {
        "hqnow" => "comic-universe-plugin-hqnow",
        _ => return Err(format!("Unknown repository: {}", repo)),
    };
    
    println!("🔌 Mapped to plugin: {}", plugin_name);
    
    // Check if plugin is active
    if !state.plugin_manager.is_plugin_active(plugin_name) {
        return Err(format!("Plugin for repository '{}' is not active", repo));
    }
    
    println!("✅ Plugin is active, executing getList...");
    
    // Execute getList method on the plugin
    let response = state.plugin_manager.execute_plugin_method(plugin_name, "getList", serde_json::Value::Object(serde_json::Map::new())).await
        .map_err(|e| e.to_string())?;
    
    if response.success {
        if let Some(data) = response.data {
            if let Some(array) = data.as_array() {
                println!("📋 GetList returned {} results", array.len());
                Ok(array.clone())
            } else {
                println!("📋 GetList returned single result");
                Ok(vec![data])
            }
        } else {
            println!("📋 GetList returned no data");
            Ok(vec![])
        }
    } else {
        println!("❌ GetList failed: {:?}", response.error);
        Err(response.error.unwrap_or("Get list failed".to_string()))
    }
}

// Utility Commands
#[tauri::command]
pub async fn download_file(url: String, dest_dir: String) -> Result<String, String> {
    let dest_path = FileUtils::download_file(&url, &dest_dir).await.map_err(|e| e.to_string())?;
    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_directory(path: String) -> Result<(), String> {
    FileUtils::create_directory(&path).map_err(|e| e.to_string())?;
    Ok(())
}

// GitHub API Commands
#[tauri::command]
pub async fn github_get_latest_release(repo: String) -> Result<serde_json::Value, String> {
    let github_api = GitHubApi::new();
    let release = github_api.get_latest_release(&repo).await.map_err(|e| e.to_string())?;
    Ok(release)
}

#[tauri::command]
pub async fn github_get(endpoint: String) -> Result<serde_json::Value, String> {
    let github_api = GitHubApi::new();
    let data = github_api.get(&endpoint).await.map_err(|e| e.to_string())?;
    Ok(data)
}

// Comic Universe API Commands
#[tauri::command]
pub async fn comic_universe_api_get(endpoint: String) -> Result<serde_json::Value, String> {
    let api = ComicUniverseApi::new();
    let data = api.get(&endpoint).await.map_err(|e| e.to_string())?;
    Ok(data)
}
