// Lulwimi desktop shell: tray icon, global hotkey, close-to-tray, opens in the bottom-right corner.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, WindowEvent,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn show(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

fn toggle(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        if w.is_visible().unwrap_or(false) && w.is_focused().unwrap_or(false) {
            let _ = w.hide();
        } else {
            show(app);
        }
    }
}

// Pronunciation practice records your voice. The window only ever shows Lulwimi's own bundled pages,
// so microphone requests from it are allowed instead of showing a WebView2 prompt that could open
// while the window is hidden in the tray.
#[cfg(windows)]
fn allow_microphone(w: &tauri::WebviewWindow) {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        COREWEBVIEW2_PERMISSION_KIND, COREWEBVIEW2_PERMISSION_KIND_MICROPHONE, COREWEBVIEW2_PERMISSION_STATE_ALLOW,
    };
    use webview2_com::PermissionRequestedEventHandler;
    let _ = w.with_webview(|wv| unsafe {
        let Ok(core) = wv.controller().CoreWebView2() else { return };
        let handler = PermissionRequestedEventHandler::create(Box::new(|_, args| {
            if let Some(args) = args {
                let mut kind = COREWEBVIEW2_PERMISSION_KIND::default();
                args.PermissionKind(&mut kind)?;
                if kind == COREWEBVIEW2_PERMISSION_KIND_MICROPHONE {
                    args.SetState(COREWEBVIEW2_PERMISSION_STATE_ALLOW)?;
                }
            }
            Ok(())
        }));
        let mut token = Default::default();
        let _ = core.add_PermissionRequested(&handler, &mut token);
    });
}

fn main() {
    let hotkey = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyL);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, sc, event| {
                    if sc == &hotkey && event.state() == ShortcutState::Pressed {
                        toggle(app);
                    }
                })
                .build(),
        )
        .setup(move |app| {
            // Another app may already own the hotkey; carry on without it.
            if let Err(e) = app.global_shortcut().register(hotkey) {
                eprintln!("hotkey unavailable: {e}");
            }

            let toggle_item = MenuItem::with_id(app, "toggle", "Show / hide  (Alt+Shift+L)", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Lulwimi", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_item, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Lulwimi")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, e| match e.id.as_ref() {
                    "toggle" => toggle(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, e| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = e {
                        show(tray.app_handle());
                    }
                })
                .build(app)?;

            // Sit in the bottom-right corner, above the taskbar, like a widget.
            if let Some(w) = app.get_webview_window("main") {
                #[cfg(windows)]
                allow_microphone(&w);
                if let (Ok(Some(m)), Ok(size)) = (w.current_monitor(), w.outer_size()) {
                    let area = m.work_area();
                    let margin = (16.0 * m.scale_factor()) as i32;
                    let x = area.position.x + area.size.width as i32 - size.width as i32 - margin;
                    let y = area.position.y + area.size.height as i32 - size.height as i32 - margin;
                    let _ = w.set_position(PhysicalPosition::new(x.max(0), y.max(0)));
                }
                let _ = w.show();
            }
            Ok(())
        })
        .on_window_event(|w, e| {
            if let WindowEvent::CloseRequested { api, .. } = e {
                api.prevent_close();
                let _ = w.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Lulwimi");
}
