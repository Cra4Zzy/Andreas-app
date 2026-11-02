#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // The Supabase authentication and authorization remain in the existing
    // frontend/backend. No privileged native commands are exposed here.
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("Abbate Lernraum konnte nicht gestartet werden");
}
