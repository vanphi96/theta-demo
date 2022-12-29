package com.nativeui.thetapi;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Timer;

/**
 * HTTP connection to device
 */
public class HttpConnector {
    private final static long CHECK_STATUS_PERIOD_MS = 50;
    private String mIpAddress = null;

    private String mContinuationToken = null;
    private String mFingerPrint = null;
    private Timer mCheckStatusTimer = null;

    public enum ShootResult {
        SUCCESS, FAIL_CAMERA_DISCONNECTED, FAIL_STORE_FULL, FAIL_DEVICE_BUSY
    }

    /**
     * Constructor
     * @param cameraIpAddress IP address of connection destination
     */
    public HttpConnector(String cameraIpAddress) {
        mIpAddress = cameraIpAddress;
    }


    /**
     * Check still image shooting status
     * @param commandId Command ID for shooting still images
     * @return ID of saved file (null is returned if the file is not saved)
     */
    private String checkCaptureStatus(String commandId) {
        HttpURLConnection postConnection = createHttpConnection("POST", "/osc/commands/status");
        JSONObject input = new JSONObject();
        String responseData;
        String capturedFileId = null;
        InputStream is = null;

        try {
            // send HTTP POST
            input.put("id", commandId);

            OutputStream os = postConnection.getOutputStream();
            os.write(input.toString().getBytes());
            postConnection.connect();
            os.flush();
            os.close();

            is = postConnection.getInputStream();
            responseData = InputStreamToString(is);

            // parse JSON data
            JSONObject output = new JSONObject(responseData);
            String status = output.getString("state");

            if (status.equals("done")) {
                JSONObject results = output.getJSONObject("results");
                capturedFileId = results.getString("fileUrl");
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return capturedFileId;
    }

    /**
     * Acquire live view stream
     * @return Stream for receiving data
     * @throws IOException
     */
    public InputStream getLivePreview() throws IOException, JSONException {

        // set capture mode to image
        setImageCaptureMode();

        HttpURLConnection postConnection = createHttpConnection("POST", "/osc/commands/execute");
        JSONObject input = new JSONObject();
        InputStream is = null;

        try {
            // send HTTP POST
            input.put("name", "camera.getLivePreview");
            JSONObject parameters = new JSONObject();

            OutputStream os = postConnection.getOutputStream();
            os.write(input.toString().getBytes());
            postConnection.connect();
            os.flush();
            os.close();

            Log.d("PhiLV", "Philv data stream geted ");
            is = postConnection.getInputStream();
            Log.d("PhiLV", "Philv data stream geted 2");
        } catch (IOException e) {
            e.printStackTrace();
            String errorMessage = null;
            InputStream es = postConnection.getErrorStream();
            try {
                if (es != null) {
                    String errorData = InputStreamToString(es);
                    JSONObject output = new JSONObject(errorData);
                    JSONObject errors = output.getJSONObject("error");
                    errorMessage = errors.getString("message");
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            } catch (JSONException e1) {
                e1.printStackTrace();
            } finally {
                if (es != null) {
                    try {
                        es.close();
                    } catch (IOException e1) {
                        e1.printStackTrace();
                    }
                }
            }
            throw e;
        } catch (JSONException e) {
            e.printStackTrace();
            throw e;
        }

        return is;
    }

    String convertStreamToString(java.io.InputStream is) {
        try {
            return new java.util.Scanner(is).useDelimiter("\\A").next();
        } catch (java.util.NoSuchElementException e) {
            return "";
        }
    }


    /**
     * Set still image as shooting mode
     * @return Error message (null is returned if successful)
     */
    private String setImageCaptureMode() {
        HttpURLConnection postConnection = createHttpConnection("POST", "/osc/commands/execute");
        JSONObject input = new JSONObject();
        String responseData;
        String errorMessage = null;
        InputStream is = null;

        try {
            // send HTTP POST
            input.put("name", "camera.setOptions");
            JSONObject parameters = new JSONObject();
            JSONObject options = new JSONObject();
            options.put("captureMode", "image");
            parameters.put("options", options);
            input.put("parameters", parameters);

            OutputStream os = postConnection.getOutputStream();
            os.write(input.toString().getBytes());
            postConnection.connect();
            os.flush();
            os.close();

            is = postConnection.getInputStream();
            responseData = InputStreamToString(is);

            // parse JSON data
            JSONObject output = new JSONObject(responseData);
            String status = output.getString("state");

            if (status.equals("error")) {
                JSONObject errors = output.getJSONObject("error");
                errorMessage = errors.getString("message");
            }
        } catch (IOException e) {
            e.printStackTrace();
            errorMessage = e.toString();
            InputStream es = postConnection.getErrorStream();
            try {
                if (es != null) {
                    String errorData = InputStreamToString(es);
                    JSONObject output = new JSONObject(errorData);
                    JSONObject errors = output.getJSONObject("error");
                    errorMessage = errors.getString("message");
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            } catch (JSONException e1) {
                e1.printStackTrace();
            } finally {
                if (es != null) {
                    try {
                        es.close();
                    } catch (IOException e1) {
                        e1.printStackTrace();
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            errorMessage = e.toString();
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return errorMessage;
    }

    /**
     * Generate connection destination URL
     * @param path Path
     * @return URL
     */
    private String createUrl(String path) {
        StringBuilder sb = new StringBuilder();
        sb.append("http://");
        sb.append(mIpAddress);
        sb.append(path);

        return sb.toString();
    }

    /**
     * Generate HTTP connection
     * @param method Method
     * @param path Path
     * @return HTTP Connection instance
     */
    private HttpURLConnection createHttpConnection(String method, String path) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(createUrl(path));
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestProperty("Content-Type", "application/json;charset=utf-8");
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoInput(true);

            if (method.equals("POST")) {
                connection.setRequestMethod(method);
                connection.setDoOutput(true);
            }

        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return connection;
    }

    /**
     * Convert input stream to string
     * @param is InputStream
     * @return String
     * @throws IOException IO error
     */
    private String InputStreamToString(InputStream is) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String lineData;
        while ((lineData = br.readLine()) != null) {
            sb.append(lineData);
        }
        br.close();
        return sb.toString();
    }
}
