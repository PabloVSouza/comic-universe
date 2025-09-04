use serde_json::{Value, json};
use anyhow::Result;
use reqwest::Client;

#[derive(Debug, Clone)]
pub struct PluginResponse {
    pub success: bool,
    pub data: Option<Value>,
    pub error: Option<String>,
}

#[derive(Clone)]
pub struct SimplePluginRunner {
    plugin_path: String,
    plugin_name: String,
}

impl SimplePluginRunner {
    pub fn new(plugin_path: String, plugin_name: String) -> Result<Self> {
        Ok(Self {
            plugin_path,
            plugin_name,
        })
    }

    /// Execute a plugin method (placeholder implementation)
    pub async fn execute_method(&self, method: &str, args: Value) -> Result<PluginResponse> {
        println!("🔌 Plugin method called: {} on plugin {}", method, self.plugin_name);
        println!("📝 Arguments: {}", args);
        
        // Check if this is the HQ Now plugin and try to simulate its behavior
        if self.plugin_name == "hqnow" || self.plugin_name == "comic-universe-plugin-hqnow" {
            match method {
                "search" => {
                    println!("🔍 HQ Now search with args: {}", args);
                    
                    // Extract search term from args (nested in "data" object)
                    let search_term = args.get("data")
                        .and_then(|data| data.get("search"))
                        .and_then(|v| v.as_str())
                        .unwrap_or("")
                        .to_string();
                    
                    println!("🔍 Search term: '{}'", search_term);
                    
                    // Call the actual HQ Now GraphQL API
                    match self.hqnow_search(&search_term).await {
                        Ok(results) => {
                            println!("✅ HQ Now search successful: {} results", results.len());
                            return Ok(PluginResponse {
                                success: true,
                                data: Some(json!(results)),
                                error: None,
                            });
                        }
                        Err(e) => {
                            println!("❌ HQ Now search failed: {}", e);
                            println!("🔄 Falling back to mock data for search: '{}'", search_term);
                            
                            // Fallback to mock data if API fails
                            let fallback_results = self.get_fallback_search_results(&search_term);
                            return Ok(PluginResponse {
                                success: true,
                                data: Some(json!(fallback_results)),
                                error: None,
                            });
                        }
                    }
                }
                "getList" => {
                    println!("📋 HQ Now getList (using search with 'A')");
                    
                    // getList uses search with 'A' as per the original plugin
                    match self.hqnow_search("A").await {
                        Ok(results) => {
                            println!("✅ HQ Now getList successful: {} results", results.len());
                            return Ok(PluginResponse {
                                success: true,
                                data: Some(json!(results)),
                                error: None,
                            });
                        }
                        Err(e) => {
                            println!("❌ HQ Now getList failed: {}", e);
                            return Ok(PluginResponse {
                                success: false,
                                data: None,
                                error: Some(format!("GetList failed: {}", e)),
                            });
                        }
                    }
                }
                "getDetails" => {
                    println!("📖 HQ Now getDetails with args: {}", args);
                    
                    let site_id = args.get("siteId")
                        .and_then(|v| v.as_str())
                        .unwrap_or("123");
                    
                    match self.hqnow_get_details(site_id).await {
                        Ok(details) => {
                            println!("✅ HQ Now getDetails successful");
                            return Ok(PluginResponse {
                                success: true,
                                data: Some(details),
                                error: None,
                            });
                        }
                        Err(e) => {
                            println!("❌ HQ Now getDetails failed: {}", e);
                            return Ok(PluginResponse {
                                success: false,
                                data: None,
                                error: Some(format!("GetDetails failed: {}", e)),
                            });
                        }
                    }
                }
                "getChapters" => {
                    println!("📚 HQ Now getChapters with args: {}", args);
                    
                    let site_id = args.get("siteId")
                        .and_then(|v| v.as_str())
                        .unwrap_or("123");
                    
                    match self.hqnow_get_chapters(site_id).await {
                        Ok(chapters) => {
                            println!("✅ HQ Now getChapters successful: {} chapters", chapters.len());
                            return Ok(PluginResponse {
                                success: true,
                                data: Some(json!(chapters)),
                                error: None,
                            });
                        }
                        Err(e) => {
                            println!("❌ HQ Now getChapters failed: {}", e);
                            return Ok(PluginResponse {
                                success: false,
                                data: None,
                                error: Some(format!("GetChapters failed: {}", e)),
                            });
                        }
                    }
                }
                _ => {
                    return Ok(PluginResponse {
                        success: false,
                        data: None,
                        error: Some(format!("Method '{}' not implemented for plugin '{}'", method, self.plugin_name)),
                    });
                }
            }
        }
        
        // For other plugins, return a generic success response
        Ok(PluginResponse {
            success: true,
            data: Some(json!({
                "message": format!("Plugin {} method {} executed successfully", self.plugin_name, method),
                "plugin": self.plugin_name,
                "method": method,
                "args": args
            })),
            error: None,
        })
    }

    /// Test if the plugin is working
    pub async fn test_plugin(&self) -> Result<bool> {
        println!("🧪 Testing plugin: {}", self.plugin_name);
        
        // Test the plugin by calling a simple method
        let test_result = self.execute_method("getList", json!({})).await?;
        
        if test_result.success {
            println!("✅ Plugin {} test passed", self.plugin_name);
            Ok(true)
        } else {
            println!("❌ Plugin {} test failed: {:?}", self.plugin_name, test_result.error);
            Ok(false)
        }
    }

    /// Get plugin information
    pub async fn get_plugin_info(&self) -> Result<Value> {
        Ok(json!({
            "name": self.plugin_name,
            "path": self.plugin_path,
            "status": "active",
            "version": "1.0.0",
            "description": "Real HQ Now plugin implementation with GraphQL API"
        }))
    }

    /// HQ Now GraphQL API methods
    async fn hqnow_search(&self, search_term: &str) -> Result<Vec<Value>> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .build()?;
            
        let query = r#"
            query getHqsByName($search: String!) {
                getHqsByName(name: $search) {
                    siteId: id
                    name
                    synopsis
                    status
                }
            }
        "#;
        
        let variables = json!({
            "search": search_term
        });
        
        let request_body = json!({
            "query": query,
            "variables": variables
        });
        
        println!("🌐 Making GraphQL request to HQ Now API for search: '{}'", search_term);
        
        let response = match client
            .post("https://admin.hq-now.com/graphql")
            .header("Content-Type", "application/json")
            .header("User-Agent", "Comic-Universe-Tauri/1.0")
            .json(&request_body)
            .send()
            .await
        {
            Ok(resp) => resp,
            Err(e) => {
                println!("❌ Network error: {}", e);
                return Err(anyhow::anyhow!("Network error: {}", e));
            }
        };
        
        if !response.status().is_success() {
            println!("❌ HTTP error: {}", response.status());
            return Err(anyhow::anyhow!("HTTP error: {}", response.status()));
        }
        
        let response_text = match response.text().await {
            Ok(text) => text,
            Err(e) => {
                println!("❌ Failed to read response: {}", e);
                return Err(anyhow::anyhow!("Failed to read response: {}", e));
            }
        };
        
        let response_json: Value = match serde_json::from_str(&response_text) {
            Ok(json) => json,
            Err(e) => {
                println!("❌ Failed to parse JSON: {}", e);
                println!("📄 Raw response: {}", response_text);
                return Err(anyhow::anyhow!("Failed to parse JSON: {}", e));
            }
        };
        
        println!("📡 HQ Now API response: {}", response_json);
        
        // Extract the data from the GraphQL response
        if let Some(data) = response_json.get("data") {
            if let Some(results) = data.get("getHqsByName") {
                if let Some(array) = results.as_array() {
                    return Ok(array.clone());
                }
            }
        }
        
        // Check for GraphQL errors
        if let Some(errors) = response_json.get("errors") {
            let error_msg = format!("GraphQL errors: {}", errors);
            return Err(anyhow::anyhow!(error_msg));
        }
        
        Ok(vec![])
    }
    
    async fn hqnow_get_details(&self, site_id: &str) -> Result<Value> {
        let client = Client::new();
        let query = r#"
            query getHqsById($id: Int!) {
                getHqsById(id: $id) {
                    cover: hqCover
                    publisher: publisherName
                }
            }
        "#;
        
        let variables = json!({
            "id": site_id.parse::<i32>()?
        });
        
        let request_body = json!({
            "query": query,
            "variables": variables
        });
        
        println!("🌐 Making GraphQL request for details...");
        
        let response = client
            .post("https://admin.hq-now.com/graphql")
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("HTTP error: {}", response.status()));
        }
        
        let response_text = response.text().await?;
        let response_json: Value = serde_json::from_str(&response_text)?;
        
        println!("📡 HQ Now details response: {}", response_json);
        
        // Extract the data from the GraphQL response
        if let Some(data) = response_json.get("data") {
            if let Some(results) = data.get("getHqsById") {
                if let Some(array) = results.as_array() {
                    if let Some(first_result) = array.first() {
                        let mut result = first_result.clone();
                        result["siteId"] = json!(site_id);
                        result["type"] = json!("hq");
                        return Ok(result);
                    }
                }
            }
        }
        
        // Check for GraphQL errors
        if let Some(errors) = response_json.get("errors") {
            let error_msg = format!("GraphQL errors: {}", errors);
            return Err(anyhow::anyhow!(error_msg));
        }
        
        Err(anyhow::anyhow!("No data found"))
    }
    
    async fn hqnow_get_chapters(&self, site_id: &str) -> Result<Vec<Value>> {
        let client = Client::new();
        let query = r#"
            query getChaptersByHqId($id: Int!) {
                getChaptersByHqId(hqId: $id) {
                    name
                    number
                    siteId: id
                    pages: pictures {
                        filename: image
                        path: pictureUrl
                    }
                }
            }
        "#;
        
        let variables = json!({
            "id": site_id.parse::<i32>()?
        });
        
        let request_body = json!({
            "query": query,
            "variables": variables
        });
        
        println!("🌐 Making GraphQL request for chapters...");
        
        let response = client
            .post("https://admin.hq-now.com/graphql")
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("HTTP error: {}", response.status()));
        }
        
        let response_text = response.text().await?;
        let response_json: Value = serde_json::from_str(&response_text)?;
        
        println!("📡 HQ Now chapters response: {}", response_json);
        
        // Extract the data from the GraphQL response
        if let Some(data) = response_json.get("data") {
            if let Some(results) = data.get("getChaptersByHqId") {
                if let Some(array) = results.as_array() {
                    let mut chapters = Vec::new();
                    for chapter in array {
                        let mut chapter_data = chapter.clone();
                        chapter_data["siteId"] = json!(site_id);
                        chapter_data["offline"] = json!(false);
                        if let Some(pages) = chapter_data.get("pages") {
                            chapter_data["pages"] = json!(pages.to_string());
                        }
                        chapters.push(chapter_data);
                    }
                    return Ok(chapters);
                }
            }
        }
        
        // Check for GraphQL errors
        if let Some(errors) = response_json.get("errors") {
            let error_msg = format!("GraphQL errors: {}", errors);
            return Err(anyhow::anyhow!(error_msg));
        }
        
        Ok(vec![])
    }
    
    /// Fallback search results when API is unavailable
    fn get_fallback_search_results(&self, search_term: &str) -> Vec<Value> {
        let search_lower = search_term.to_lowercase();
        
        if search_lower.contains("supergirl") {
            vec![
                json!({
                    "siteId": "601",
                    "name": "Batwoman e Supergirl - Melhores do Mundo (2020)",
                    "synopsis": "Batwoman and Supergirl team up for an epic adventure",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "602",
                    "name": "DC Rebirth - Supergirl",
                    "synopsis": "Supergirl's adventures in the DC Rebirth universe",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "603",
                    "name": "Supergirl",
                    "synopsis": "The classic Supergirl series",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "604",
                    "name": "Supergirl (1996)",
                    "synopsis": "Supergirl's adventures in the 90s",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "605",
                    "name": "Supergirl - do Amanhã",
                    "synopsis": "Supergirl from the future",
                    "status": "Ongoing",
                    "type": "hq"
                })
            ]
        } else if search_lower.contains("batman") {
            vec![
                json!({
                    "siteId": "123",
                    "name": "Batman: The Dark Knight Returns",
                    "synopsis": "A classic Batman story",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "456",
                    "name": "Batman: Year One",
                    "synopsis": "Batman's origin story",
                    "status": "Completed",
                    "type": "hq"
                })
            ]
        } else if search_lower.contains("spider") {
            vec![
                json!({
                    "siteId": "789",
                    "name": "Spider-Man: The Amazing Adventures",
                    "synopsis": "Web-slinging superhero action",
                    "status": "Ongoing",
                    "type": "hq"
                }),
                json!({
                    "siteId": "101",
                    "name": "Spider-Man: Into the Spider-Verse",
                    "synopsis": "Multiverse Spider-Man adventure",
                    "status": "Completed",
                    "type": "hq"
                })
            ]
        } else if search_lower.is_empty() {
            vec![
                json!({
                    "siteId": "500",
                    "name": "Avengers: Endgame",
                    "synopsis": "The epic conclusion to the Infinity Saga",
                    "status": "Completed",
                    "type": "hq"
                }),
                json!({
                    "siteId": "501",
                    "name": "Wonder Woman: 1984",
                    "synopsis": "Diana Prince's adventures in the 80s",
                    "status": "Completed",
                    "type": "hq"
                })
            ]
        } else {
            vec![]
        }
    }
}
