package de.abbate.lernraum.preview;

import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import android.widget.*;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

// A dedicated, first-party HTTPS viewer. No remote native JavaScript bridge.
public class MainActivity extends Activity {
    private static final String HOST = "app.gabelstaplerfahrschule-andreas.de";
    private static final String HOME = "https://" + HOST + "/dist/index.html";
    private WebView web;
    private LinearLayout error;
    private String retryUrl = HOME;
    private boolean rendererGone = false;

    static boolean trusted(Uri uri) {
        return uri != null && "https".equalsIgnoreCase(uri.getScheme())
            && HOST.equalsIgnoreCase(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && uri.getUserInfo() == null;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(247,247,242));
        ViewCompat.setOnApplyWindowInsetsListener(frame, (v, insets) -> {
            androidx.core.graphics.Insets bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(bars.left,bars.top,bars.right,bars.bottom);
            return insets;
        });
        web = new WebView(this);
        frame.addView(web, new FrameLayout.LayoutParams(-1,-1));
        error = new LinearLayout(this);
        error.setOrientation(LinearLayout.VERTICAL);
        error.setGravity(android.view.Gravity.CENTER);
        error.setPadding(32,32,32,32);
        error.setBackgroundColor(Color.rgb(247,247,242));
        TextView label = new TextView(this);
        label.setText("Abbate Lernraum\n\nKeine Verbindung zum Lernraum.\nBitte prüfe deine Internetverbindung.");
        label.setGravity(android.view.Gravity.CENTER);
        label.setTextSize(19);
        label.setTextColor(Color.rgb(25,57,66));
        error.addView(label);
        Button retry = new Button(this);
        retry.setText("Erneut versuchen");
        retry.setOnClickListener(v -> {
            if (rendererGone) { recreate(); return; }
            error.setVisibility(View.GONE);
            web.loadUrl(retryUrl);
        });
        error.addView(retry);
        frame.addView(error, new FrameLayout.LayoutParams(-1,-1));
        error.setVisibility(View.GONE);
        setContentView(frame);
        WebView.setWebContentsDebuggingEnabled(false);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setUserAgentString(settings.getUserAgentString()+" AbbateAndroid/2");
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!request.isForMainFrame()) return !trusted(uri);
                if (trusted(uri)) return false;
                if (request.hasGesture()) openExternal(uri);
                return true;
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                if (!trusted(Uri.parse(url))) { view.stopLoading(); showError(); return; }
                retryUrl = url;
                error.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError failure) {
                if (request.isForMainFrame()) showError();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame()) showError();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError failure) {
                handler.cancel();
                showError();
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                rendererGone = true;
                ((android.view.ViewGroup)view.getParent()).removeView(view);
                view.destroy();
                web = null;
                showError();
                return true;
            }
        });
        web.setDownloadListener((url,agent,disposition,mime,length) -> {
            Uri uri = Uri.parse(url);
            if (trusted(uri)) openExternal(uri);
            else Toast.makeText(this,"Bitte nutze für diesen Download die Browser-Version.",Toast.LENGTH_LONG).show();
        });
        web.loadUrl(HOME);
    }

    private void showError() { error.setVisibility(View.VISIBLE); }
    private void openExternal(Uri uri) {
        if (!"https".equalsIgnoreCase(uri.getScheme()) && !"mailto".equalsIgnoreCase(uri.getScheme())) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
        catch (ActivityNotFoundException ignored) { Toast.makeText(this,"Kein Browser verfügbar.",Toast.LENGTH_SHORT).show(); }
    }
    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (web != null) { web.stopLoading(); ((android.view.ViewGroup)web.getParent()).removeView(web); web.destroy(); web=null; }
        super.onDestroy();
    }
}
