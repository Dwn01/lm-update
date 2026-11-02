import JSZip from 'jszip';
import { TailscaleProfile } from '../types';

export async function generateApkProjectBundle(profile: TailscaleProfile): Promise<Blob> {
  const zip = new JSZip();

  const appTitle = 'Finora Mobile';
  const packageName = 'id.finora.mobile';
  const targetHost = `${profile.useHttps ? 'https' : 'http'}://${profile.ip}:${profile.userPort}`;
  const adminHost = `${profile.useHttps ? 'https' : 'http'}://${profile.ip}:${profile.adminPort}`;

  // 1. AndroidManifest.xml
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <!-- Permissions required for Tailscale network access -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appTitle}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FinoraMobile"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  // 2. MainActivity.java (Native Android WebView wrapper for Tailscale)
  const mainActivityJava = `package ${packageName};

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView mWebView;
    private ProgressBar mProgressBar;
    private SwipeRefreshLayout mSwipeRefresh;
    private SharedPreferences mPrefs;
    private static final String PREF_KEY_IP = "tailscale_ip";
    private static final String PREF_KEY_PORT = "tailscale_port";
    private static final String DEFAULT_IP = "${profile.ip}";
    private static final int DEFAULT_PORT = ${profile.userPort};

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mPrefs = getSharedPreferences("FinoraConfig", MODE_PRIVATE);
        mWebView = findViewById(R.id.webView);
        mProgressBar = findViewById(R.id.progressBar);
        mSwipeRefresh = findViewById(R.id.swipeRefresh);

        // Configure WebView settings for persistent sessions & performance
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setSupportZoom(false);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        // Persistent Cookies & Login Session
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(mWebView, true);

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress == 100) {
                    mProgressBar.setVisibility(View.GONE);
                    mSwipeRefresh.setRefreshing(false);
                } else {
                    mProgressBar.setVisibility(View.VISIBLE);
                    mProgressBar.setProgress(newProgress);
                }
            }
        });

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                mProgressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showConnectionErrorDialog();
                }
            }
        });

        mSwipeRefresh.setOnRefreshListener(() -> mWebView.reload());

        // Load the configured Tailscale URL
        loadFinoraUrl();
    }

    private String getTargetUrl() {
        String ip = mPrefs.getString(PREF_KEY_IP, DEFAULT_IP);
        int port = mPrefs.getInt(PREF_KEY_PORT, DEFAULT_PORT);
        return "http://" + ip + ":" + port;
    }

    private void loadFinoraUrl() {
        String url = getTargetUrl();
        Toast.makeText(this, "Menghubungkan ke Tailscale: " + url, Toast.LENGTH_SHORT).show();
        mWebView.loadUrl(url);
    }

    private void showConnectionErrorDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Gagal Terhubung ke Tailscale");
        builder.setMessage("Pastikan perangkat ini sudah terhubung ke aplikasi Tailscale dan IP/Port sudah sesuai.\\n\\nTarget: " + getTargetUrl());
        builder.setPositiveButton("Coba Lagi", (dialog, which) -> mWebView.reload());
        builder.setNeutralButton("Ubah IP Tailscale", (dialog, which) -> showConfigDialog());
        builder.setNegativeButton("Tutup", null);
        builder.show();
    }

    public void showConfigDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Konfigurasi IP Tailscale Finora");

        final View dialogView = getLayoutInflater().inflate(R.layout.dialog_config, null);
        final EditText inputIp = dialogView.findViewById(R.id.editIp);
        final EditText inputPort = dialogView.findViewById(R.id.editPort);

        inputIp.setText(mPrefs.getString(PREF_KEY_IP, DEFAULT_IP));
        inputPort.setText(String.valueOf(mPrefs.getInt(PREF_KEY_PORT, DEFAULT_PORT)));

        builder.setView(dialogView);
        builder.setPositiveButton("Simpan & Hubungkan", (dialog, which) -> {
            String newIp = inputIp.getText().toString().trim();
            int newPort = Integer.parseInt(inputPort.getText().toString().trim());

            mPrefs.edit()
                .putString(PREF_KEY_IP, newIp)
                .putInt(PREF_KEY_PORT, newPort)
                .apply();

            loadFinoraUrl();
        });
        builder.setNegativeButton("Batal", null);
        builder.show();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
`;

  // 3. build.gradle
  const buildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}`;

  // 4. README Guide
  const readmeContent = `# Panduan Pemasangan APK Finora Mobile

Aplikasi ini adalah paket mobile resmi untuk **Finora LM Finance**, dengan dukungan koneksi langsung ke server Anda melalui jaringan **Tailscale VPN**.

## 📌 Informasi Konfigurasi Default
- **IP Tailscale**: \`${profile.ip}\`
- **Pintu Pengguna (User)**: Port \`${profile.userPort}\`
- **Pintu Super Admin**: Port \`${profile.adminPort}\`
- **URL Pintu User**: \`${targetHost}\`
- **URL Pintu Admin**: \`${adminHost}\`

---

## 🚀 Cara 1: Pasang Langsung Tanpa Install Software (PWA / WebAPK) — Paling Mudah!
1. Buka aplikasi Finora di browser Chrome Android pada HP Anda.
2. Klik tombol **"Pasang Aplikasi (PWA)"** di banner atas atau menu APK.
3. Aplikasi akan langsung terpasang di menu utama HP Anda dengan ikon dan pengalaman layar penuh (Full Screen) tanpa browser bar.

---

## 🛠️ Cara 2: Kompilasi Menjadi APK Menggunakan Android Studio
1. Ekstrak file zip ini ke komputer Anda.
2. Buka folder ini di **Android Studio**.
3. Hubungkan HP Android Anda via kabel USB (atau gunakan Emulator).
4. Klik tombol **Run 'app'** atau menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. File \`app-debug.apk\` siap di-install ke ponsel Anda!

---

## ⚡ Cara Menghubungkan Tailscale di HP Android:
1. Unduh aplikasi **Tailscale** dari Google Play Store pada HP Anda.
2. Login ke akun Tailscale yang sama dengan server Finora Anda.
3. Aktifkan sakelar Tailscale (Status: Connected).
4. Buka aplikasi **Finora Mobile**. IP Tailscale (\`${profile.ip}\`) akan otomatis terhubung!
5. Jika IP server berubah, Anda dapat mengubahnya kapan saja melalui tombol **Ubah IP Tailscale** di dalam aplikasi.
`;

  // 5. XML Layouts
  const activityMainXml = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#f5f7f6">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:progressTint="#126b50"
        app:layout_constraintTop_toTopOf="parent" />

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/progressBar"
        app:layout_constraintBottom_toBottomOf="parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />
    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`;

  const dialogConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="20dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Masukkan IP Tailscale Server:"
        android:textColor="#333"
        android:textStyle="bold" />

    <EditText
        android:id="@+id/editIp"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="contoh: 100.84.12.90"
        android:inputType="textUri"
        android:layout_marginBottom="12dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Port (8080 untuk User, 8081 untuk Admin):"
        android:textColor="#333"
        android:textStyle="bold" />

    <EditText
        android:id="@+id/editPort"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="8080"
        android:inputType="number" />
</LinearLayout>`;

  // Add files to zip
  zip.file('app/src/main/AndroidManifest.xml', manifestXml);
  zip.file('app/src/main/java/id/finora/mobile/MainActivity.java', mainActivityJava);
  zip.file('app/src/main/res/layout/activity_main.xml', activityMainXml);
  zip.file('app/src/main/res/layout/dialog_config.xml', dialogConfigXml);
  zip.file('app/build.gradle', buildGradle);
  zip.file('PANDUAN-INSTALL-APK-ANDROID.md', readmeContent);
  zip.file('tailscale-config.json', JSON.stringify(profile, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}
