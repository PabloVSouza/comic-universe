use std::process::{Command, Stdio};
use serde_json::{Value, json};
use anyhow::Result;
use tokio::process::Command as AsyncCommand;

#[derive(Debug, Clone)]
pub struct PluginMethod {
    pub name: String,
    pub args: Value,
}

#[derive(Debug, Clone)]
pub struct PluginResponse {
    pub success: bool,
    pub data: Option<Value>,
    pub error: Option<String>,
}

pub struct PluginRunner {
    plugin_path: String,
    plugin_name: String,
}

impl PluginRunner {
    pub fn new(plugin_path: String, plugin_name: String) -> Self {
        Self {
            plugin_path,
            plugin_name,
        }
    }

    /// Execute a plugin method synchronously
    pub fn execute_method(&self, method: &str, args: Value) -> Result<PluginResponse> {
        // Get the plugin runner script path (in the plugins directory)
        let plugin_runner_path = std::env::current_dir()
            .map_err(|e| anyhow::anyhow!("Could not get current directory: {}", e))?
            .parent()
            .ok_or_else(|| anyhow::anyhow!("Could not find project root directory"))?
            .join("plugins")
            .join("plugin-runner.js");

        let output = Command::new("node")
            .arg(plugin_runner_path)
            .arg(&self.plugin_path)
            .arg("--method")
            .arg(method)
            .arg("--args")
            .arg(args.to_string())
            .arg("--plugin-name")
            .arg(&self.plugin_name)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if !output.status.success() {
            return Ok(PluginResponse {
                success: false,
                data: None,
                error: Some(format!("Plugin execution failed: {}", stderr)),
            });
        }

        // Try to parse JSON response
        match serde_json::from_str::<Value>(&stdout) {
            Ok(json_response) => {
                if let Some(error) = json_response.get("error") {
                    Ok(PluginResponse {
                        success: false,
                        data: None,
                        error: Some(error.as_str().unwrap_or("Unknown error").to_string()),
                    })
                } else {
                    Ok(PluginResponse {
                        success: true,
                        data: Some(json_response),
                        error: None,
                    })
                }
            }
            Err(_) => {
                // If not JSON, treat as plain text response
                Ok(PluginResponse {
                    success: true,
                    data: Some(json!({ "result": stdout.trim() })),
                    error: None,
                })
            }
        }
    }

    /// Execute a plugin method asynchronously
    pub async fn execute_method_async(&self, method: &str, args: Value) -> Result<PluginResponse> {
        // Get the plugin runner script path (in the plugins directory)
        let plugin_runner_path = std::env::current_dir()
            .map_err(|e| anyhow::anyhow!("Could not get current directory: {}", e))?
            .parent()
            .ok_or_else(|| anyhow::anyhow!("Could not find project root directory"))?
            .join("plugins")
            .join("plugin-runner.js");

        let child = AsyncCommand::new("node")
            .arg(plugin_runner_path)
            .arg(&self.plugin_path)
            .arg("--method")
            .arg(method)
            .arg("--args")
            .arg(args.to_string())
            .arg("--plugin-name")
            .arg(&self.plugin_name)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let output = child.wait_with_output().await?;
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if !output.status.success() {
            return Ok(PluginResponse {
                success: false,
                data: None,
                error: Some(format!("Plugin execution failed: {}", stderr)),
            });
        }

        // Try to parse JSON response
        match serde_json::from_str::<Value>(&stdout) {
            Ok(json_response) => {
                if let Some(error) = json_response.get("error") {
                    Ok(PluginResponse {
                        success: false,
                        data: None,
                        error: Some(error.as_str().unwrap_or("Unknown error").to_string()),
                    })
                } else {
                    Ok(PluginResponse {
                        success: true,
                        data: Some(json_response),
                        error: None,
                    })
                }
            }
            Err(_) => {
                // If not JSON, treat as plain text response
                Ok(PluginResponse {
                    success: true,
                    data: Some(json!({ "result": stdout.trim() })),
                    error: None,
                })
            }
        }
    }

    /// Test if the plugin is working by calling a simple method
    pub fn test_plugin(&self) -> Result<bool> {
        let response = self.execute_method("getList", json!({}))?;
        Ok(response.success)
    }

    /// Get plugin information
    pub fn get_plugin_info(&self) -> Result<Value> {
        let response = self.execute_method("getInfo", json!({}))?;
        if response.success {
            Ok(response.data.unwrap_or(json!({})))
        } else {
            Err(anyhow::anyhow!("Failed to get plugin info: {:?}", response.error))
        }
    }
}

/// Create a plugin runner for a specific plugin
pub fn create_plugin_runner(plugin_path: &str, plugin_name: &str) -> PluginRunner {
    PluginRunner::new(plugin_path.to_string(), plugin_name.to_string())
}

/// Execute a plugin method with error handling
pub fn execute_plugin_method(
    plugin_path: &str,
    plugin_name: &str,
    method: &str,
    args: Value,
) -> Result<PluginResponse> {
    let runner = create_plugin_runner(plugin_path, plugin_name);
    runner.execute_method(method, args)
}

/// Execute a plugin method asynchronously with error handling
pub async fn execute_plugin_method_async(
    plugin_path: &str,
    plugin_name: &str,
    method: &str,
    args: Value,
) -> Result<PluginResponse> {
    let runner = create_plugin_runner(plugin_path, plugin_name);
    runner.execute_method_async(method, args).await
}
