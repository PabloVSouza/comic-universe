use std::collections::HashMap;
use std::path::PathBuf;
use std::fs;
use std::sync::Mutex;
use anyhow::Result;
use serde_json::Value;
use flate2::read::GzDecoder;
use tar::Archive;
use crate::models::{PluginInfo, RepoOption};
use crate::simple_plugin_runner::{SimplePluginRunner, PluginResponse};
use dirs::data_dir;

pub struct PluginManager {
    plugins_path: PathBuf,
    active_plugins: Mutex<HashMap<String, SimplePluginRunner>>,
}

impl PluginManager {
    pub fn new(is_dev: bool) -> Result<Self> {
        let plugins_path = if is_dev {
            // Use project root directory in dev for easy access (go up one level from src-tauri)
            std::env::current_dir()
                .map_err(|e| anyhow::anyhow!("Could not get current directory: {}", e))?
                .parent()
                .ok_or_else(|| anyhow::anyhow!("Could not find project root directory"))?
                .join("plugins")
        } else {
            data_dir()
                .ok_or_else(|| anyhow::anyhow!("Could not find data directory"))?
                .join("comic-universe")
                .join("plugins")
        };

        // Create plugins directory if it doesn't exist
        if !plugins_path.exists() {
            fs::create_dir_all(&plugins_path)?;
        }

        Ok(Self {
            plugins_path,
            active_plugins: Mutex::new(HashMap::new()),
        })
    }

    pub async fn startup(&self) -> Result<()> {
        println!("🚀 Starting plugin system...");
        println!("📁 Plugins path: {}", self.plugins_path.display());
        
        self.install_plugins().await?;
        self.activate_plugins().await?;
        
        let active_count = self.active_plugins.lock().unwrap().len();
        println!("✅ Plugin startup complete. {} plugins active.", active_count);
        
        Ok(())
    }

    pub fn verify_plugin_folder_exists(&self) -> bool {
        self.plugins_path.exists()
    }

    async fn install_plugins(&self) -> Result<()> {
        let plugin_files = self.get_not_installed_plugins_list()?;

        for plugin_file in plugin_files {
            self.extract_plugin(&plugin_file).await?;
        }

        Ok(())
    }

    async fn extract_plugin(&self, plugin_file: &str) -> Result<()> {
        let plugin_path = self.plugins_path.join(plugin_file);
        
        // Extract .tgz file
        let file = fs::File::open(&plugin_path)?;
        let decoder = GzDecoder::new(file);
        let mut archive = Archive::new(decoder);

        // Get destination directory name (remove version suffix)
        let dest_name = plugin_file
            .strip_suffix(".tgz")
            .unwrap_or(plugin_file)
            .rsplitn(2, '-')
            .last()
            .unwrap_or(plugin_file);

        let dest_path = self.plugins_path.join(dest_name);
        
        // Create destination directory
        if !dest_path.exists() {
            fs::create_dir_all(&dest_path)?;
        }

        archive.unpack(&dest_path)?;

        // Remove the .tgz file after extraction
        fs::remove_file(&plugin_path)?;

        Ok(())
    }

    async fn activate_plugins(&self) -> Result<()> {
        let plugin_info_list = self.get_plugin_info_list()?;
        println!("🔍 Found {} plugins to activate", plugin_info_list.len());

        for plugin_info in plugin_info_list {
            let plugin_path = self.plugins_path
                .join(&plugin_info.name)
                .join(&plugin_info.path);
            
            if plugin_path.exists() {
                match SimplePluginRunner::new(
                    plugin_path.to_string_lossy().to_string(),
                    plugin_info.name.clone()
                ) {
                    Ok(runner) => {
                        // Test the plugin
                        match runner.test_plugin().await {
                            Ok(true) => {
                                println!("✅ Plugin activated: {} v{}", plugin_info.name, plugin_info.version);
                                self.active_plugins.lock().unwrap().insert(plugin_info.name.clone(), runner);
                            }
                            Ok(false) => {
                                println!("❌ Plugin test failed: {} v{}", plugin_info.name, plugin_info.version);
                            }
                            Err(e) => {
                                println!("❌ Plugin activation error: {} v{} - {}", plugin_info.name, plugin_info.version, e);
                            }
                        }
                    }
                    Err(e) => {
                        println!("❌ Plugin creation error: {} v{} - {}", plugin_info.name, plugin_info.version, e);
                    }
                }
            } else {
                println!("❌ Plugin file not found: {}", plugin_path.display());
            }
        }

        Ok(())
    }

    pub async fn update_plugins(&self) -> Result<()> {
        self.install_plugins().await?;
        self.activate_plugins().await?;
        Ok(())
    }

    pub async fn download_and_install_plugin(&self, repository: &str) -> Result<()> {
        // This would download from GitHub releases
        // For now, we'll return a placeholder implementation
        println!("Would download plugin from repository: {}", repository);
        Ok(())
    }

    fn get_not_installed_plugins_list(&self) -> Result<Vec<String>> {
        let entries = fs::read_dir(&self.plugins_path)?;
        
        let tgz_files: Vec<String> = entries
            .filter_map(|entry| {
                entry.ok().and_then(|e| {
                    let file_name = e.file_name().into_string().ok()?;
                    if file_name.ends_with(".tgz") && e.file_type().ok()?.is_file() {
                        Some(file_name)
                    } else {
                        None
                    }
                })
            })
            .collect();

        Ok(tgz_files)
    }

    fn get_plugin_folder_list(&self) -> Result<Vec<String>> {
        let entries = fs::read_dir(&self.plugins_path)?;
        
        let folders: Vec<String> = entries
            .filter_map(|entry| {
                entry.ok().and_then(|e| {
                    let file_name = e.file_name().into_string().ok()?;
                    if file_name != ".DS_Store" && e.file_type().ok()?.is_dir() {
                        Some(file_name)
                    } else {
                        None
                    }
                })
            })
            .collect();

        Ok(folders)
    }

    pub fn get_plugin_info_list(&self) -> Result<Vec<PluginInfo>> {
        let folder_list = self.get_plugin_folder_list()?;
        let mut plugins_list = Vec::new();

        for folder in folder_list {
            let folder_path = self.plugins_path.join(&folder);
            let package_path = folder_path.join("package.json");

            if package_path.exists() {
                let package_content = fs::read_to_string(&package_path)?;
                
                if let Ok(package_json) = serde_json::from_str::<Value>(&package_content) {
                    let plugin_info = PluginInfo {
                        name: package_json["name"].as_str().unwrap_or(&folder).to_string(),
                        path: package_json["main"].as_str().unwrap_or("index.js").to_string(),
                        author: package_json["author"].as_str().map(|s| s.to_string()),
                        version: package_json["version"].as_str().unwrap_or("0.0.0").to_string(),
                        repository: package_json["repository"].as_str().unwrap_or("").to_string(),
                        icon_path: folder_path
                            .join(package_json["icon"].as_str().unwrap_or("icon.png"))
                            .to_string_lossy()
                            .to_string(),
                    };

                    plugins_list.push(plugin_info);
                }
            }
        }

        Ok(plugins_list)
    }

    pub fn get_repo_list(&self) -> Vec<RepoOption> {
        // Return available repositories from active plugins
        let mut repos = Vec::new();
        
        // Add HQ Now if the plugin is active
        if self.is_plugin_active("comic-universe-plugin-hqnow") {
            repos.push(RepoOption {
                label: "HQ Now".to_string(),
                value: "hqnow".to_string(),
            });
        }
        
        repos
    }

    pub async fn get_plugins_from_api(&self) -> Result<Vec<Value>> {
        // This would fetch from the Comic Universe API
        // For now, return a placeholder
        Ok(vec![])
    }

    /// Execute a method on a specific plugin
    pub async fn execute_plugin_method(&self, plugin_name: &str, method: &str, args: Value) -> Result<PluginResponse> {
        let runner = {
            let plugins = self.active_plugins.lock().unwrap();
            plugins.get(plugin_name).cloned()
        };
        
        if let Some(runner) = runner {
            runner.execute_method(method, args).await
        } else {
            Ok(PluginResponse {
                success: false,
                data: None,
                error: Some(format!("Plugin '{}' not found or not active", plugin_name)),
            })
        }
    }

    /// Execute a method on a specific plugin asynchronously (alias for execute_plugin_method)
    pub async fn execute_plugin_method_async(&self, plugin_name: &str, method: &str, args: Value) -> Result<PluginResponse> {
        self.execute_plugin_method(plugin_name, method, args).await
    }

    /// Get list of active plugin names
    pub fn get_active_plugin_names(&self) -> Vec<String> {
        self.active_plugins.lock().unwrap().keys().cloned().collect()
    }

    /// Check if a plugin is active
    pub fn is_plugin_active(&self, plugin_name: &str) -> bool {
        self.active_plugins.lock().unwrap().contains_key(plugin_name)
    }
}

// Trait for plugin repositories - this would be implemented by loaded plugins
pub trait PluginRepository: Send + Sync {
    fn repo_name(&self) -> &str;
    fn repo_tag(&self) -> &str;
    // Add other plugin methods as needed
}
