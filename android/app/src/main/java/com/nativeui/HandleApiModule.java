package com.nativeui;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.nativeui.thetapi.HttpConnector;

import org.json.JSONException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class HandleApiModule extends ReactContextBaseJavaModule {

    private String mIpAddress = "192.168.1.1";

    private static ReactApplicationContext reactContext;
    HandleApiModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "HandleApiModule";
    }
    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return super.getConstants();
    }

    @ReactMethod(isBlockingSynchronousMethod = false)
    public void handleCallApiGetLivePreview() {
        HttpConnector camera = new HttpConnector(mIpAddress);
        try {
            InputStream is = camera.getLivePreview();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }



}
