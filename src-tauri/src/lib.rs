use serde::Serialize;
use serde_json::Value;
use std::time::Duration;

/// Result of a proxied HTTP call to a camera's REST API.
#[derive(Serialize)]
struct ApiResponse {
    status: u16,
    ok: bool,
    body: Option<Value>,
}

fn normalize_host(host: &str) -> String {
    let h = host.trim();
    if h.starts_with("http://") || h.starts_with("https://") {
        h.trim_end_matches('/').to_string()
    } else {
        format!("http://{}", h.trim_end_matches('/'))
    }
}

/// Proxy a single HTTP request to a Blackmagic camera REST API.
///
/// The webview cannot call the camera directly (CORS + secure-context mixed
/// content), so all traffic is funneled through this command. `path` already
/// includes the `control/api/v1/...` prefix; `host` is an IP / hostname,
/// optionally with a scheme and/or port.
#[tauri::command]
async fn camera_request(
    host: String,
    method: String,
    path: String,
    body: Option<Value>,
) -> Result<ApiResponse, String> {
    let base = normalize_host(&host);
    let url = format!("{}/{}", base, path.trim_start_matches('/'));

    let client = reqwest::Client::builder()
        // Cameras may serve a self-signed cert when HTTPS is enabled.
        .danger_accept_invalid_certs(true)
        .connect_timeout(Duration::from_secs(3))
        .timeout(Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let req = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "PUT" => client.put(&url).json(&body.unwrap_or(Value::Null)),
        "POST" => client
            .post(&url)
            .json(&body.unwrap_or_else(|| Value::Object(Default::default()))),
        "DELETE" => client.delete(&url),
        other => return Err(format!("unsupported method: {other}")),
    };

    let resp = req.send().await.map_err(|e| e.to_string())?;
    let status = resp.status().as_u16();
    let ok = resp.status().is_success();

    // Body may be empty (e.g. 204 No Content) or non-JSON; tolerate both.
    let text = resp.text().await.unwrap_or_default();
    let body = if text.trim().is_empty() {
        None
    } else {
        serde_json::from_str::<Value>(&text).ok()
    };

    Ok(ApiResponse { status, ok, body })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![camera_request])
        .run(tauri::generate_context!())
        .expect("error while running StudioCTRL");
}
