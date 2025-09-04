use std::path::{Path, PathBuf};
use std::fs;
use anyhow::Result;
use reqwest;
use tokio::io::AsyncWriteExt;
use url::Url;

pub struct FileUtils;

impl FileUtils {
    /// Create a directory if it doesn't exist
    pub fn create_directory<P: AsRef<Path>>(path: P) -> Result<()> {
        let path = path.as_ref();
        if !path.exists() {
            fs::create_dir_all(path)?;
        }
        Ok(())
    }

    /// Download a file from URL to destination
    pub async fn download_file<P: AsRef<Path>>(url: &str, dest_dir: P) -> Result<PathBuf> {
        let url_parsed = Url::parse(url)?;
        let file_name = url_parsed
            .path_segments()
            .and_then(|segments| segments.last())
            .ok_or_else(|| anyhow::anyhow!("Could not extract filename from URL"))?;

        let dest_path = dest_dir.as_ref().join(file_name);

        let response = reqwest::get(url).await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Failed to download file: HTTP {}", response.status()));
        }

        let mut file = tokio::fs::File::create(&dest_path).await?;
        let content = response.bytes().await?;
        file.write_all(&content).await?;

        Ok(dest_path)
    }

    /// Get file size in bytes
    pub fn get_file_size<P: AsRef<Path>>(path: P) -> Result<u64> {
        let metadata = fs::metadata(path)?;
        Ok(metadata.len())
    }

    /// Check if path exists
    pub fn path_exists<P: AsRef<Path>>(path: P) -> bool {
        path.as_ref().exists()
    }

    /// Join path components
    pub fn join_path(components: &[String]) -> PathBuf {
        let mut path = PathBuf::new();
        for component in components {
            path = path.join(component);
        }
        path
    }

    /// Get parent directory of a path
    pub fn get_parent_dir<P: AsRef<Path>>(path: P) -> Option<PathBuf> {
        path.as_ref().parent().map(|p| p.to_path_buf())
    }

    /// Copy file from source to destination
    pub fn copy_file<P: AsRef<Path>, Q: AsRef<Path>>(src: P, dest: Q) -> Result<()> {
        fs::copy(src, dest)?;
        Ok(())
    }

    /// Delete file
    pub fn delete_file<P: AsRef<Path>>(path: P) -> Result<()> {
        fs::remove_file(path)?;
        Ok(())
    }

    /// Delete directory recursively
    pub fn delete_directory<P: AsRef<Path>>(path: P) -> Result<()> {
        fs::remove_dir_all(path)?;
        Ok(())
    }

    /// List files in directory
    pub fn list_directory<P: AsRef<Path>>(path: P) -> Result<Vec<PathBuf>> {
        let entries = fs::read_dir(path)?;
        let mut files = Vec::new();

        for entry in entries {
            let entry = entry?;
            files.push(entry.path());
        }

        Ok(files)
    }

    /// Read file to string
    pub fn read_file_to_string<P: AsRef<Path>>(path: P) -> Result<String> {
        let content = fs::read_to_string(path)?;
        Ok(content)
    }

    /// Write string to file
    pub fn write_string_to_file<P: AsRef<Path>>(path: P, content: &str) -> Result<()> {
        fs::write(path, content)?;
        Ok(())
    }
}

/// GitHub API utilities
pub struct GitHubApi {
    client: reqwest::Client,
    base_url: String,
}

impl GitHubApi {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: "https://api.github.com".to_string(),
        }
    }

    pub async fn get_latest_release(&self, repo: &str) -> Result<serde_json::Value> {
        let url = format!("{}/repos/{}/releases/latest", self.base_url, repo);
        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("GitHub API request failed: HTTP {}", response.status()));
        }

        let json = response.json().await?;
        Ok(json)
    }

    pub async fn get(&self, endpoint: &str) -> Result<serde_json::Value> {
        let url = format!("{}/{}", self.base_url, endpoint);
        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("GitHub API request failed: HTTP {}", response.status()));
        }

        let json = response.json().await?;
        Ok(json)
    }
}

/// Comic Universe API utilities
pub struct ComicUniverseApi {
    client: reqwest::Client,
    base_url: String,
}

impl ComicUniverseApi {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: "https://api.comic-universe.app".to_string(), // Replace with actual API URL
        }
    }

    pub async fn get(&self, endpoint: &str) -> Result<serde_json::Value> {
        let url = format!("{}/{}", self.base_url, endpoint);
        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Comic Universe API request failed: HTTP {}", response.status()));
        }

        let json = response.json().await?;
        Ok(json)
    }

    pub async fn get_plugins(&self) -> Result<Vec<serde_json::Value>> {
        let response = self.get("plugins").await?;
        
        // Assuming the response is an array of plugins
        if let serde_json::Value::Array(plugins) = response {
            Ok(plugins)
        } else {
            Err(anyhow::anyhow!("Invalid response format from plugins API"))
        }
    }
}
