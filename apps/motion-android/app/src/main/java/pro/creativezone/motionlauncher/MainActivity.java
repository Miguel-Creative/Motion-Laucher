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
import android.widget.FrameLayout;
import java.io.File;
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
                    path.equals("/settings") || path.equals("/apps") || path.equals("/welcome") || path.equals("/onboarding") || path.equals("/recovery"))) {
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

    public final class NativeBridge {
        @JavascriptInterface public boolean isNative() { return true; }

        @JavascriptInterface public String getManagedApps() {
            JSONArray result=new JSONArray();PackageManager pm=getPackageManager();
            for(ApplicationInfo app:pm.getInstalledApplications(0)) {
                try {
                    JSONObject row=new JSONObject();
                    row.put("pkg",app.packageName);row.put("name",pm.getApplicationLabel(app).toString());
                    row.put("enabled",app.enabled);row.put("system",(app.flags&ApplicationInfo.FLAG_SYSTEM)!=0);
                    row.put("version",pm.getPackageInfo(app.packageName,0).versionName);
                    long apkBytes=app.sourceDir==null?0:new File(app.sourceDir).length();
                    if(app.splitSourceDirs!=null)for(String split:app.splitSourceDirs)apkBytes+=new File(split).length();
                    row.put("apkBytes",apkBytes);
                    row.put("self",app.packageName.equals(getPackageName()));
                    row.put("launchable",pm.getLeanbackLaunchIntentForPackage(app.packageName)!=null||pm.getLaunchIntentForPackage(app.packageName)!=null);
                    result.put(row);
                }catch(Exception ignored){}
            }
            return result.toString();
        }
        @JavascriptInterface public void openAppDetails(String pkg) {
            if(pkg==null||!pkg.matches("[A-Za-z0-9._]{3,180}"))return;
            runOnUiThread(()->{
                try { getPackageManager().getApplicationInfo(pkg,0);startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+pkg))); }
                catch(Exception error){Toast.makeText(MainActivity.this,"Detalhes indisponíveis",Toast.LENGTH_SHORT).show();}
            });
        }
        @JavascriptInterface public void requestUninstall(String pkg) {
            if(pkg==null||pkg.equals(getPackageName())||!pkg.matches("[A-Za-z0-9._]{3,180}"))return;
            runOnUiThread(()->{
                try {
                    ApplicationInfo info=getPackageManager().getApplicationInfo(pkg,0);
                    if((info.flags&ApplicationInfo.FLAG_SYSTEM)!=0){Toast.makeText(MainActivity.this,"Gerencie este app de sistema nos ajustes do Android",Toast.LENGTH_SHORT).show();return;}
                    startActivity(new Intent(Intent.ACTION_DELETE,Uri.parse("package:"+pkg)));
                }catch(Exception error){Toast.makeText(MainActivity.this,"Desinstalação indisponível",Toast.LENGTH_SHORT).show();}
            });
        }


        @JavascriptInterface public String getInstalledApps() {
            if (cachedAppsJson != null) return cachedAppsJson;
            JSONArray apps = new JSONArray();
            PackageManager pm = getPackageManager();
            List<ApplicationInfo> installed = pm.getInstalledApplications(0);
            for (ApplicationInfo app : installed) {
                if (!app.enabled || app.packageName.equals(getPackageName()) ||
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
                    // Launch from the HOME task into the TV app's own task.
                    target.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
                    startActivity(target);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Aplicativo indisponível", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface public void openInputSources() {
            runOnUiThread(() -> {
                try {
                    // Source picker is a firmware activity without a LAUNCHER intent.
                    // It was verified on HY300por: com.softwinner.awsource/.MainActivity.
                    Intent source = new Intent(Intent.ACTION_MAIN);
                    source.setClassName("com.softwinner.awsource", "com.softwinner.awsource.MainActivity");
                    startActivity(source);
                } catch (Exception error) {
                    Log.w("MotionUI", "HDMI source picker unavailable", error);
                    Toast.makeText(MainActivity.this, "Entrada HDMI indisponível", Toast.LENGTH_SHORT).show();
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
        if (web != null) web.evaluateJavascript("(function(){if(document.querySelector('[data-ambient-active], [role=dialog][data-state=open]')){window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return true;}return false;})()", result -> {
            if (!"true".equals(result) && web != null) {
                if (web.canGoBack()) web.goBack();
                else web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))", null);
            }
        });
    }

    @Override protected void onResume() {
        super.onResume();
        cachedAppsJson=null;
        if (web != null) {web.onResume();web.evaluateJavascript("window.dispatchEvent(new Event('motion-apps-changed'));window.dispatchEvent(new Event('motion-foreground'))",null);}
    }
    @Override protected void onPause() {
        if (web != null) {web.evaluateJavascript("window.dispatchEvent(new Event('motion-background'))",null);web.onPause();}
        super.onPause();
    }
    @Override protected void onDestroy() {
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
