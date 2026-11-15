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
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
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
    private boolean inOfflineMode = false;
    private volatile String cachedAppsJson;

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
        setContentView(web);
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
            if (!OFFLINE_HOST.equals(u.getHost()) && !LIVE_HOST.equals(u.getHost())) return null;
            String path = u.getPath();
            if (path == null || path.equals("/")) path = "/index.html";
            if (path.contains("..") || path.indexOf('\\') >= 0) return null;
            try {
                InputStream stream = getAssets().open("webroot" + path);
                String ext = path.toLowerCase(Locale.ROOT);
                String mime = ext.endsWith(".js") ? "application/javascript" :
                    ext.endsWith(".css") ? "text/css" :
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

    public final class NativeBridge {
        @JavascriptInterface public boolean isNative() { return true; }

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
        if (web != null && web.canGoBack()) web.goBack();
        else if (web != null) web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))", null);
    }

    @Override protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }
    @Override protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }
    @Override protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("MotionNative");
            web.destroy();
        }
        super.onDestroy();
    }
}
