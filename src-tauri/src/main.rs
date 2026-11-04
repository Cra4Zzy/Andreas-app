#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(feature = "desktop-auto-update")]
use tauri_plugin_updater::UpdaterExt;

// Desktop updates use a signed, versioned GitHub release feed. The update
// signing public key is embedded at BUILD time by the release workflow.
// Preview installers do not enable this feature and remain unchanged.
#[cfg(feature = "desktop-auto-update")]
async fn install_available_update(
    app: tauri::AppHandle,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let endpoint = "https://github.com/Cra4Zzy/Andreas-app/releases/download/desktop-update-feed/latest.json";
    let updater = app
        .updater_builder()
        .endpoints(vec![endpoint.parse()?])?
        .build()?;

    if let Some(update) = updater.check().await? {
        // This updater verifies the release signature before installation.
        // Only check on a NEW app launch: never interrupt a long-running
        // learning session or examination with a periodic restart.
        update.download_and_install(|_chunk, _size| {}, || {}).await?;
        app.restart();
    }
    Ok(())
}

fn main() {
    // No privileged native commands are exposed. Authentication, records and
    // permissions continue to be enforced by Supabase.
    let builder = tauri::Builder::default();

    #[cfg(feature = "desktop-auto-update")]
    let builder = {
        // An unsigned pilot never embeds a dummy key; release builds require
        // ABBATE_UPDATER_PUBLIC_KEY to be present during Rust compilation.
        let updater =
            tauri_plugin_updater::Builder::new().pubkey(env!("ABBATE_UPDATER_PUBLIC_KEY"));
        #[cfg(target_os = "macos")]
        let updater = updater.target("darwin-universal");
        builder.plugin(updater.build())
    };

    builder
        .setup(|app| {
            #[cfg(feature = "desktop-auto-update")]
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(err) = install_available_update(app_handle).await {
                        // A network or feed error must never stop the learner
                        // from opening the installed app.
                        eprintln!("Abbate: Desktop-Update derzeit nicht verfügbar: {err}");
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Abbate Lernraum konnte nicht gestartet werden");
}
