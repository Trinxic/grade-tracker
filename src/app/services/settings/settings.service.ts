import { Injectable, signal, effect } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";

export interface Setting {
  key: string;
  value: string | number | boolean;
  description: string;
}

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private settingsFile: string = "settings.json";

  constructor() {}

  async getSettings(): Promise<Setting[]> {
    const appData = await appDataDir();
    const settingsPath = await join(appData, this.settingsFile);
    try {
      const settings = await invoke<Setting[]>("get_settings", {
        root: settingsPath,
      });
      return settings;
    } catch (err) {
      // FIXME: Change to user-friendly error handling
      console.error("Error loading settings:", err);
    }
    return [];
  }

  async setSettings(settings: Setting[]): Promise<void> {
    const appData = await appDataDir();
    const settingsPath = await join(appData, this.settingsFile);
    try {
      await invoke("write_settings", {
        root: settingsPath,
        settings: settings,
      });
    } catch (err) {
      // FIXME: Change to user-friendly error handling
      console.error("Error saving settings:", err);
    }
  }
}
