package com.nativeui;

import android.graphics.Color;
import android.graphics.SurfaceTexture;
import android.os.AsyncTask;
import android.util.Log;
import android.view.ContextMenu;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.nativeui.thetapi.HttpConnector;
import com.nativeui.thetapi.MJpegInputStream;
import com.nativeui.thetapi.MJpegView;

import org.json.JSONException;

import java.io.IOException;
import java.io.InputStream;

public class ReactPreviewManager extends SimpleViewManager<View> {

    public static final String REACT_CLASS = "RCTLivePreviewView";
    ReactApplicationContext mCallerContext;
    LinearLayout mView;
    private String cameraIpAddress= "192.168.1.1";
    public MJpegView mMv;
    private ShowLiveViewTask livePreviewTask = null;
    public String TAG = "PhiLV";
    TextureView temp;
    ViewGroup nativeView;

    public ReactPreviewManager(ReactApplicationContext reactContext) {
        Log.d(TAG, "ReactPreviewManager: ");
        mCallerContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext themedReactContext) {
        Log.d(TAG, "createViewInstance");

        nativeView = new LinearLayout(themedReactContext);
        nativeView.setBackgroundColor(Color.RED);

        mMv = new MJpegView(themedReactContext);
        mMv.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT));
//        mMv.setBackgroundColor(Color.YELLOW);
        nativeView.addView(mMv);
        Log.d(TAG, "createViewInstance: size "+mMv.getWidth());
        Log.d(TAG, "createViewInstance: size 2 "+nativeView.getWidth());

        if (livePreviewTask != null) {
            livePreviewTask.cancel(true);
            livePreviewTask = new ShowLiveViewTask();
            livePreviewTask.execute(cameraIpAddress);
            mMv.stopPlay();
            mMv.play();
        }
        else {
            livePreviewTask = new ShowLiveViewTask();
            livePreviewTask.execute(cameraIpAddress);
            mMv.stopPlay();
            mMv.play();
        }

        return nativeView;
    }

    @ReactProp(name = "someRandomProp")
    public void setSomeRandomProp(View view, @Nullable String string) {
        Log.d(TAG, "setSomeRandomProp");

        if (string == null) {
            return;
        }
        View anotherView = new View(view.getContext());
        anotherView.setLayoutParams(new LinearLayout.LayoutParams(100,100));
        anotherView.setBackgroundColor(Color.GREEN);
        Log.d(TAG, "setSomeRandomProp: "+anotherView.getWidth());
//        nativeView.addView(anotherView);
    }


    private class ShowLiveViewTask extends AsyncTask<String, String, MJpegInputStream> {
        @Override
        protected MJpegInputStream doInBackground(String... ipAddress) {
            MJpegInputStream mjis = null;
            final int MAX_RETRY_COUNT = 20;

            for (int retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
                try {
                    Log.d(TAG, "start Live view: "+ipAddress[0]);
                    HttpConnector camera = new HttpConnector(ipAddress[0]);
                    InputStream is = camera.getLivePreview();
                    Log.d(TAG, "camera.getLivePreview(): ");
                    mjis = new MJpegInputStream(is);
                    Log.d(TAG, "new MJpegInputStream: ");
                    retryCount = MAX_RETRY_COUNT;
                } catch (IOException e) {
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e1) {
                        e1.printStackTrace();
                    }
                } catch (JSONException e) {
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e1) {
                        e1.printStackTrace();
                    }
                }
            }

            return mjis;
        }

        @Override
        protected void onProgressUpdate(String... values) {
            for (String log : values) {
                Log.d("PhiLV", "onProgressUpdate: "+values);
            }
        }

        @Override
        protected void onPostExecute(MJpegInputStream mJpegInputStream) {
            if (mJpegInputStream != null) {
                Log.d(TAG, "onPostExecute: setSource");
                mMv.setSource(mJpegInputStream);
            } else {
                Log.d("PhiLV","failed to start live view");
            }
        }
    }



}
