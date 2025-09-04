use std::sync::{Arc, Mutex};
use tauri::Manager;
use dirs::data_dir;

mod models;
mod database_simple;
mod plugins;
mod plugin_runner;
mod simple_plugin_runner;
mod utils;
mod commands;

use database_simple::DatabaseManager;
use plugins::PluginManager;

pub struct AppState {
    pub db: Arc<DatabaseManager>,
    pub plugin_manager: Arc<PluginManager>,
    pub app_params: Arc<Mutex<AppParams>>,
}

pub struct AppParams {
    pub app_running_path: String,
    pub app_path: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let is_dev = cfg!(debug_assertions);
            
            // Setup database path
            let data_dir = if is_dev {
                // Use project root directory in dev for easy access (go up one level from src-tauri)
                std::env::current_dir()
                    .map_err(|e| format!("Could not get current directory: {}", e))?
                    .parent()
                    .ok_or("Could not find project root directory")?
                    .to_path_buf()
            } else {
                data_dir()
                    .ok_or("Could not find data directory")?
                    .join("comic-universe")
            };

            // Create data directory if it doesn't exist
            std::fs::create_dir_all(&data_dir)?;

            let db_path = data_dir.join("database.db");
            let db_url = format!("sqlite://{}", db_path.display());

            // Initialize database
            let rt = tokio::runtime::Runtime::new().unwrap();
            let db = rt.block_on(async {
                DatabaseManager::new(&db_url).await
            })?;

            // Initialize plugin manager
            let plugin_manager = PluginManager::new(is_dev)?;
            
            // Start up plugins (install and activate)
            rt.block_on(async {
                plugin_manager.startup().await
            })?;

            // Setup app params
            let app_params = AppParams {
                app_running_path: if is_dev {
                    std::env::current_dir().unwrap().to_string_lossy().to_string()
                } else {
                    app.path().app_data_dir().unwrap().to_string_lossy().to_string()
                },
                app_path: app.path().app_data_dir().unwrap().to_string_lossy().to_string(),
            };

            // Setup app state
            app.manage(AppState {
                db: Arc::new(db),
                plugin_manager: Arc::new(plugin_manager),
                app_params: Arc::new(Mutex::new(app_params)),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Database commands
            commands::db_run_migrations,
            commands::db_verify_migrations,
            commands::db_get_comic,
            commands::db_get_comic_additional_data,
            commands::db_get_all_comics,
            commands::db_insert_comic,
            commands::db_delete_comic,
            commands::db_get_all_chapters_no_page,
            commands::db_get_chapters,
            commands::db_insert_chapters,
            commands::db_update_chapter,
            commands::db_get_read_progress,
            commands::db_update_read_progress,
            commands::db_get_all_users,
            commands::db_update_user,
            commands::db_delete_user,
            
            // App commands
            commands::get_app_data,
            commands::path_join,
            commands::get_app_params,
            commands::maximize_window,
            commands::close_window,
            
            // Plugin commands
            commands::verify_plugin_folder_exists,
            commands::install_plugins,
            commands::activate_plugins,
            commands::update_plugins,
            commands::download_and_install_plugin,
            commands::get_plugins_from_api,
            commands::get_plugin_info_list,
            commands::get_repo_list,
            commands::execute_plugin_method,
            commands::execute_plugin_method_async,
            commands::get_active_plugins,
            commands::is_plugin_active,
            
            // Search and List commands
            commands::search,
            commands::get_list,
            
            // Utility commands
            commands::download_file,
            commands::create_directory,
            commands::github_get_latest_release,
            commands::github_get,
            commands::comic_universe_api_get,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
