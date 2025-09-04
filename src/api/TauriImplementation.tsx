import { invoke } from '@tauri-apps/api/core'

// Method name mappings from frontend to Rust commands
const methodMappings: Record<string, string> = {
  // Database commands
  'dbRunMigrations': 'db_run_migrations',
  'dbVerifyMigrations': 'db_verify_migrations',
  'dbGetComic': 'db_get_comic',
  'dbGetComicAdditionalData': 'db_get_comic_additional_data',
  'dbGetAllComics': 'db_get_all_comics',
  'dbInsertComic': 'db_insert_comic',
  'dbDeleteComic': 'db_delete_comic',
  'dbGetAllChaptersNoPage': 'db_get_all_chapters_no_page',
  'dbGetChapters': 'db_get_chapters',
  'dbInsertChapters': 'db_insert_chapters',
  'dbUpdateChapter': 'db_update_chapter',
  'dbGetReadProgress': 'db_get_read_progress',
  'dbUpdateReadProgress': 'db_update_read_progress',
  'dbGetAllUsers': 'db_get_all_users',
  'dbUpdateUser': 'db_update_user',
  'dbDeleteUser': 'db_delete_user',
  
  // App commands
  'getAppData': 'get_app_data',
  'path': 'path_join',
  'getAppParams': 'get_app_params',
  'maximizeWindow': 'maximize_window',
  'closeWindow': 'close_window',
  
  // Plugin commands
  'verifyPluginFolderExists': 'verify_plugin_folder_exists',
  'installPlugins': 'install_plugins',
  'activatePlugins': 'activate_plugins',
  'updatePlugins': 'update_plugins',
  'downloadAndInstallPlugin': 'download_and_install_plugin',
  'getPluginsFromApi': 'get_plugins_from_api',
  'getPluginInfoList': 'get_plugin_info_list',
  'getRepoList': 'get_repo_list',
  'executePluginMethod': 'execute_plugin_method',
  'executePluginMethodAsync': 'execute_plugin_method_async',
  'getActivePlugins': 'get_active_plugins',
  'isPluginActive': 'is_plugin_active',
  
  // Search and List commands
  'search': 'search',
  'getList': 'get_list',
  
  // Utility commands
  'downloadFile': 'download_file',
  'createDirectory': 'create_directory',
  'githubGetLatestRelease': 'github_get_latest_release',
  'githubGet': 'github_get',
  'comicUniverseApiGet': 'comic_universe_api_get',
  
  // Legacy/compatibility
  'resetEvents': 'db_run_migrations' // Placeholder - events handled differently in Tauri
}

const TauriImplementation = {
  invoke: async (method: string, args?: any) => {
    try {
      // Get the mapped command name or convert camelCase to snake_case
      const rustCommand = methodMappings[method] || method.replace(/([A-Z])/g, '_$1').toLowerCase()
      
      console.log(`Invoking Tauri command: ${rustCommand} (from ${method})`, args)
      
      if (args) {
        return await invoke(rustCommand, args)
      } else {
        return await invoke(rustCommand)
      }
    } catch (error) {
      console.error(`Tauri command error for ${method} (${methodMappings[method] || 'unmapped'}):`, error)
      throw error
    }
  },
  on: (channel: string, callback: Function) => {
    // Tauri events would be handled differently using the event system
    // For now, we'll implement basic event listening
    console.warn('Event listening not implemented for Tauri yet:', channel)
  }
}

export default TauriImplementation
