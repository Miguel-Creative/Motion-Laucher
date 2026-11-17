package pro.creativezone.motionlauncher;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import android.net.Uri;
import android.net.ConnectivityManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.view.KeyEvent;
import android.view.Gravity;
import android.widget.FrameLayout;
import android.widget.VideoView;
import java.io.File;
import java.io.FileOutputStream;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.util.Log;
import android.webkit.ConsoleMessage;

import org.json.JSONArray;
import org.json.JSONObject;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;

/** Android HOME host for the real Motion Launcher React interface. */
public class MainActivity extends Activity {
    private static final String LIVE_HOST = "motion-laucher.contato-creativezone.workers.dev";
    private static final String OFFLINE_HOST = "motion-offline.invalid";
    private static final String LIVE_URL = "https://" + LIVE_HOST + "/";
    private WebView web;
    private FrameLayout root;
    private VideoView fireVideo;
    private File fireTemp;
    private int fireIndex = 0;
    private static final String[] FIRE_FILES = {"classic", "cozy", "logs"};
    private boolean inOfflineMode = false;
    private volatile String cachedAppsJson;
    private ConnectivityManager networkManager;
    private ConnectivityManager.NetworkCallback networkCallback;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.BLACK);
        getWindow().setNavigationBarColor(Color.BLACK);
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(12, 12, 19));
        web.setFocusable(true);
        web.setFocusableInTouchMode(true);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        web.addJavascriptInterface(new NativeBridge(), "MotionNative");
        web.setWebChromeClient(new WebChromeClient() { @Override public boolean onConsoleMessage(ConsoleMessage msg) { Log.e("MotionUI",msg.message()); return true; } });
        web.setWebViewClient(new MotionWebClient());
        root = new FrameLayout(this);
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        // When Wi-Fi returns, refresh the clock and restore the live UI if offline.
        if (Build.VERSION.SDK_INT >= 24) {
            try {
                networkManager = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
                if (networkManager != null) {
                    networkCallback = new ConnectivityManager.NetworkCallback() {
                        @Override public void onAvailable(android.net.Network network) {
                            if (web == null) return;
                            web.post(() -> {
                                if (web == null) return;
                                if (inOfflineMode) {
                                    inOfflineMode = false;
                                    web.loadUrl(LIVE_URL);
                                } else {
                                    web.evaluateJavascript("window.dispatchEvent(new Event('online'))", null);
                                }
                            });
                        }
                    };
                    networkManager.registerDefaultNetworkCallback(networkCallback);
                }
            } catch (Exception e) { Log.w("MotionUI", "Network callback unavailable"); }
        }
        web.loadUrl(LIVE_URL);
    }

    private void fallbackOffline() {
        if (inOfflineMode) return;
        inOfflineMode = true;
        web.post(() -> web.loadUrl("https://" + OFFLINE_HOST + "/"));
    }

    private class MotionWebClient extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
            Uri u = request.getUrl();
            String h = u.getHost();
            if ("https".equalsIgnoreCase(u.getScheme()) &&
                    (LIVE_HOST.equalsIgnoreCase(h) || OFFLINE_HOST.equalsIgnoreCase(h))) return false;
            if (request.isForMainFrame() && "https".equalsIgnoreCase(u.getScheme())) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); }
                catch (Exception ignored) {}
            }
            return true;
        }

        @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest request) {
            Uri u = request.getUrl();
            String path = u.getPath();
            if (LIVE_HOST.equalsIgnoreCase(u.getHost())) {
                // Match bundled HTML, JS and compatible CSS to the installed APK,
                // while preserving the live origin, localStorage and real provider API.
                // No old server UI or fictional wallpapers can reappear on navigation.
                if (path != null && (path.equals("/api") || path.startsWith("/api/"))) return null;
                if (request.isForMainFrame() && (path == null || path.equals("/") ||
                    path.equals("/launcher") || path.equals("/library") || path.equals("/wallpapers") ||
                    path.equals("/settings") || path.equals("/welcome") || path.equals("/onboarding") || path.equals("/recovery"))) {
                    path = "/index.html";
                }
            }
            // Both origins may read local packaged assets. Real API calls remain on LIVE_HOST.
            if (!LIVE_HOST.equalsIgnoreCase(u.getHost()) && !OFFLINE_HOST.equalsIgnoreCase(u.getHost())) return null;
            if (path == null || path.equals("/")) path = "/index.html";
            if (path.contains("..") || path.indexOf('\\') >= 0) return null;
            try {
                InputStream stream = getAssets().open("webroot" + path);
                String ext = path.toLowerCase(Locale.ROOT);
                String mime = ext.endsWith(".js") ? "application/javascript" :
                    ext.endsWith(".css") ? "text/css" :
                    ext.endsWith(".mp4") ? "video/mp4" :
                    ext.endsWith(".webp") ? "image/webp" :
                    ext.endsWith(".jpg") || ext.endsWith(".jpeg") ? "image/jpeg" :
                    ext.endsWith(".png") ? "image/png" :
                    ext.endsWith(".svg") ? "image/svg+xml" : "text/html";
                return new WebResourceResponse(mime, "UTF-8", stream);
            } catch (Exception ignored) { return null; }
        }

        @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
            if (r.isForMainFrame() && LIVE_HOST.equals(r.getUrl().getHost())) { Log.e("MotionUI","Page loading error: " + e.getDescription()); fallbackOffline(); }
        }

        @Override public void onReceivedHttpError(WebView v, WebResourceRequest r, WebResourceResponse e) {
            if (r.isForMainFrame() && LIVE_HOST.equals(r.getUrl().getHost()) &&
                e.getStatusCode() >= 400) fallbackOffline();
        }
    }

    /** Only one local video decoder is active; no streaming or animated thumbnails. */
    private void releaseFireVideo() {
        if (fireVideo != null) {
            fireVideo.stopPlayback();
            root.removeView(fireVideo);
            fireVideo = null;
        }
        if (fireTemp != null) {
            fireTemp.delete();
            fireTemp = null;
        }
    }

    private void closeFireplace() {
        releaseFireVideo();
        if (web != null) {
            web.setVisibility(View.VISIBLE);
            web.requestFocus();
            web.evaluateJavascript("window.dispatchEvent(new Event('motion-fireplace-closed'))", null);
        }
    }

    private void playFireplace(int index) {
        if (index < 0 || index >= FIRE_FILES.length || root == null || web == null) return;
        releaseFireVideo();
        fireIndex = index;
        try {
            fireTemp = File.createTempFile("motion-fire-", ".mp4", getCacheDir());
            try (InputStream input = getAssets().open("webroot/ambient/" + FIRE_FILES[index] + ".mp4");
                 FileOutputStream out = new FileOutputStream(fireTemp)) {
                byte[] buffer = new byte[32768];
                int count;
                while ((count = input.read(buffer)) != -1) out.write(buffer, 0, count);
            }
            web.setVisibility(View.INVISIBLE);
            root.setBackgroundColor(Color.BLACK);
            final VideoView video = new VideoView(this);
            fireVideo = video;
            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(-1,-1,Gravity.CENTER);
            root.addView(video, params);
            video.setOnPreparedListener(player -> {
                if (fireVideo != video) return;
                player.setLooping(true);
                player.setVolume(0f, 0f);
                video.start();
            });
            video.setOnErrorListener((player, what, extra) -> {
                if (fireVideo == video) {
                    Toast.makeText(this, "Não foi possível reproduzir a lareira", Toast.LENGTH_SHORT).show();
                    closeFireplace();
                }
                return true;
            });
            video.setOnClickListener(v -> closeFireplace());
            video.setVideoPath(fireTemp.getAbsolutePath());
            video.requestFocus();
        } catch (Exception e) {
            Log.e("MotionUI", "Fireplace unavailable", e);
            closeFireplace();
            Toast.makeText(this, "Lareira indisponível", Toast.LENGTH_SHORT).show();
        }
    }

    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        if (fireVideo != null) {
            int key = event.getKeyCode();
            if (key == KeyEvent.KEYCODE_BACK || key == KeyEvent.KEYCODE_ENTER || key == KeyEvent.KEYCODE_DPAD_CENTER ||
                key == KeyEvent.KEYCODE_DPAD_LEFT || key == KeyEvent.KEYCODE_DPAD_RIGHT) {
                if (event.getAction() == KeyEvent.ACTION_UP) {
                    if (key == KeyEvent.KEYCODE_DPAD_LEFT) playFireplace((fireIndex + FIRE_FILES.length - 1) % FIRE_FILES.length);
                    else if (key == KeyEvent.KEYCODE_DPAD_RIGHT) playFireplace((fireIndex + 1) % FIRE_FILES.length);
                    else closeFireplace();
                }
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    public final class NativeBridge {
        @JavascriptInterface public boolean isNative() { return true; }

        @JavascriptInterface public void openFireplace(int index) { runOnUiThread(() -> playFireplace(index)); }

        @JavascriptInterface public String getInstalledApps() {
            if (cachedAppsJson != null) return cachedAppsJson;
            JSONArray apps = new JSONArray();
            PackageManager pm = getPackageManager();
            List<ApplicationInfo> installed = pm.getInstalledApplications(0);
            for (ApplicationInfo app : installed) {
                if (app.packageName.equals(getPackageName()) ||
                    app.packageName.equals("pro.creativezone.hy300launcher")) continue;
                Intent open = pm.getLeanbackLaunchIntentForPackage(app.packageName);
                if (open == null) open = pm.getLaunchIntentForPackage(app.packageName);
                if (open == null) continue;
                try {
                    JSONObject item = new JSONObject();
                    item.put("pkg", app.packageName);
                    item.put("name", pm.getApplicationLabel(app).toString());
                    item.put("system", (app.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
                    try {
                        Drawable icon = pm.getApplicationIcon(app.packageName);
                        Bitmap bitmap = Bitmap.createBitmap(72, 72, Bitmap.Config.ARGB_8888);
                        Canvas canvas = new Canvas(bitmap);
                        icon.setBounds(0, 0, 72, 72);
                        icon.draw(canvas);
                        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                        bitmap.compress(Bitmap.CompressFormat.PNG, 95, bytes);
                        item.put("icon", "data:image/png;base64," + Base64.encodeToString(bytes.toByteArray(), Base64.NO_WRAP));
                        bitmap.recycle();
                    } catch (Exception iconError) {
                        Log.w("MotionUI", "Icon unavailable for " + app.packageName);
                    }
                    apps.put(item);
                } catch (Exception ignored) {}
            }
            cachedAppsJson = apps.toString();
            return cachedAppsJson;
        }

        @JavascriptInterface public void launchPackage(String pkg) {
            if (pkg == null || !pkg.matches("[A-Za-z0-9._]{3,180}")) return;
            runOnUiThread(() -> {
                try {
                    PackageManager pm = getPackageManager();
                    Intent target = pm.getLeanbackLaunchIntentForPackage(pkg);
                    if (target == null) target = pm.getLaunchIntentForPackage(pkg);
                    if (target == null) throw new IllegalStateException("Not installed");
                    startActivity(target);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Aplicativo indisponível", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface public void openProjectorSettings() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent("action.htcsettings.prjsettings");
                    intent.setPackage("com.htc.htcsettings");
                    intent.addCategory(Intent.CATEGORY_DEFAULT);
                    startActivity(intent);
                } catch (Exception e) { openAndroidSettings(); }
            });
        }

        @JavascriptInterface public void openAndroidSettings() {
            runOnUiThread(() -> {
                try { startActivity(new Intent(Settings.ACTION_SETTINGS)); }
                catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Configurações indisponíveis", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface public void reload() {
            runOnUiThread(() -> {
                inOfflineMode = false;
                web.loadUrl(LIVE_URL);
            });
        }
    }

    @Override public void onBackPressed() {
        if (fireVideo != null) { closeFireplace(); return; }
        if (web != null) web.evaluateJavascript("(function(){if(document.querySelector('[data-ambient-active]')){window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return true;}return false;})()", result -> {
            if (!"true".equals(result) && web != null) {
                if (web.canGoBack()) web.goBack();
                else web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))", null);
            }
        });
    }

    @Override protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }
    @Override protected void onPause() {
        if (fireVideo != null) closeFireplace();
        if (web != null) web.onPause();
        super.onPause();
    }
    @Override protected void onDestroy() {
        releaseFireVideo();
        if (networkManager != null && networkCallback != null) {
            try { networkManager.unregisterNetworkCallback(networkCallback); }
            catch (Exception ignored) {}
            networkCallback = null;
        }
        if (web != null) {
            web.removeJavascriptInterface("MotionNative");
            web.destroy();
        }
        super.onDestroy();
    }
}
