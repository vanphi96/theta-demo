/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,

} from 'react-native';

import callApi from './src/api/callApi';

import { WebView } from 'react-native-webview';
import getThetaLivePreview from './src/utils/theta'
import axios from 'axios';
import {fetch as fetchPolyfill} from 'whatwg-fetch'
import HandleApiModule from './src/native_module/HandleImageModule';
import { RCTLivePreviewView, RCTLivePreviewIOS } from './src/native_module/LivePreviewComponent';

const App = () => {

  const [messageLog, setMessageLog] = useState('');
  const [filePath, setFilePath] = useState(''); 
  const [dataStatus, setStatus] = useState('');
  const  [mjepgUrl, setMjepg] = useState('')

  const handleGetInfoDevices = () => {
    let endPoint = '/osc/info';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('GET', endPoint, callback);
  }
   const setImageMode = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.setOptions",
      "parameters": {
        "options": {
          "previewFormat": {
          },
        }
      }
    }
    callApi('POST', endPoint, callback,data);
  }
  const handleTakePicture = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data));
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {"name": "camera.takePicture"};
    callApi('POST', endPoint, callback, data);
  }
  const handleGetListFile = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        if(response.data.results.entries[0]) {
          setFilePath(response.data.results.entries[0]?.fileUrl)
          setMessageLog(JSON.stringify(response.data))
        } else {
          setFilePath(null)
          setMessageLog(JSON.stringify(response.data))
        }
       
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.listFiles",
      "parameters": {
          "fileType": "all",
          "entryCount": 1,
          "maxThumbSize": 0
      }
    }
    callApi('POST', endPoint, callback, data);
  }
  const handleSetNoSleep = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.setOptions",
      "parameters": {
        "options": {
            "offDelay": 1500,
            "sleepDelay": 1500
        }
      }
    }
    callApi('POST', endPoint, callback,data);
    
  }

  const setOptionPreview = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.setOptions",
      "parameters": {
        "options": {
          "previewFormat": {"width": 640, "height": 320, "framerate": 10},
          "_wlanChannel": 11
        }
      }
    }

    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback,data);
  }

  const resetCamera  = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.reset",
    }
    callApi('POST', endPoint, callback,data);
    
  }

  const handleSetSleepDefault = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.setOptions",
      "parameters": {
        "options": {
            "offDelay": 600,
            "sleepDelay": 600
        }
      }
    }
    callApi('POST', endPoint, callback,data);
  }
  const handleGetStatus = () => {
    let endPoint = '/osc/state';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    
    callApi('POST', endPoint, callback);     
  }
  const handleGetOffDelay = () => {
    let endPoint = '/osc/commands/execute';
    let callback = {
      onSuccess: (response) => {
        console.log(JSON.stringify(response.data));
        setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.getOptions",
        "parameters": {
          "optionNames": [
            // "iso",
            // "isoSupport",
            "offDelay",
            "sleepDelay",
            "captureMode",
            "previewFormat",
            "_wlanChannel",
            "remainingSpace",
            "_colorTemperature",
          ]
        }            
    };
    callApi('POST', endPoint, callback, data);
  }

  const startSession = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.startSession",
    };
    setStatus(data);
    let callback = {
      onSuccess: (response) => {
        console.log('success camera.startSession');
        console.log(JSON.stringify(response));
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback, data);
  }

  const setCaptureMode = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.setOptions",
      "parameters":{
        "options": {
          "captureMode":"image"
        }
      }
    };
    setStatus(data);
    let callback = {
      onSuccess: (response) => {
        console.log('success camera.setOptions');
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback, data);
  }

  const handleGetLiveView = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.getLivePreview",
      "parameters": {}
    };
    setStatus(data);
    let callback = {
      onSuccess: (response) => {
        console.log('success camera.getLivePreview');
        // console.log(response);
        if (!response.ok) {
          console.log('response.ok fail');
        }
        if (!response.body) {
            throw Error('ReadableStream not yet supported in this browser.')
        }
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
   
    console.log('call live preview');
    callApi('POST', endPoint, callback, data, 'application/json');
    // getThetaLivePreview();

  }

  const stopRecording = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.stopCapture",
      "parameters": {}
    };
    
    let callback = {
      onSuccess: (response) => {
        console.log('success camera.stopCapture');
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback, data);
  }

  const stopLivePreview = () => {
    let endPoint = '/osc/commands/execute';
    let data = {
      "name": "camera.startCapture",
      "parameters": {}
    };
    
    let callback = {
      onSuccess: (response) => {
        console.log('success camera.startCapture');
        var retryIntervalId = setTimeout(stopRecording, 500);
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback, data, 'application/json');
  }

  const getLivePreviewFetch = async () => {
    let url = 'http://192.168.1.1:80/osc/commands/execute'
    const postData = { name: "camera.getLivePreview" };
    console.log('Philv getLivePreviewFetch');
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
      }).then((response) => {
        console.log('philv');
      })
      .catch(error => {})
  }

  const getLivePreviewFetch2 = async () => {
  }


  const deleteFile = () => {
    let endPoint = '/osc/commands/execute';
    if(!filePath) return;
    let callback = {
      onSuccess: (response) => {
        console.log('delete success');
        // console.log(JSON.stringify(response.data));
        // setMessageLog(JSON.stringify(response.data))
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    let data = {
      "name": "camera.delete",
      "parameters": {
        "fileUrls": [filePath]
      }
    };
    console.log('call delete file');
    callApi('POST', endPoint, callback, data);
  }

  const getStatusCommand = () => {
    let endPoint = '/osc/commands/status';
    if(!dataStatus || dataStatus == '') {
      return;
    }
    let callback = {
      onSuccess: (response) => {
        console.log('/osc/commands/status success');
      },
      onFail: (error) => {
        console.log('error ',error);
      }
    }
    callApi('POST', endPoint, callback, dataStatus);
  }

    const formatHtml = () => {
    return (`<html>
    <body style="width: 100%; height: 100%; background-color: aquamarine;">
        <p style="font-size: 20px; color: black;" id="status">philv call api</p>
    </body>
    <script type="text/javascript">
        (function () {
          document.getElementById("status").innerHTML = 'script ok ok';
          let url = 'http://192.168.1.1:80/osc/commands/execute'
          const postData = { name: "camera.getLivePreview" };
          fetch(url, {
          method: 'POST',
          body: JSON.stringify(postData),
          headers: {
              'Content-Type': 'application/json; charset=utf-8',
          }
          }).then((response) => {
              console.log('success');
              document.getElementById("status").innerHTML = 'call success';
          })
          .catch(error => {
              console.log('error');
              document.getElementById("status").innerHTML = error;
          });
        })()
    </script>
</html>`);
    }

    const getScript = () => {
      return `
      alert('philv')
      document.getElementById("status").innerHTML = 'injectscript runing';
      let url = 'http://192.168.1.1/osc/commands/execute'
      const postData = { name: "camera.takePicture" };
      let temp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
          'Content-Type': 'application/json',
      }
      }).then((response) => {
          console.log('success');
          document.getElementById("status").innerHTML = 'call success';
          alert('success')
      })
      .catch(error => {
          console.log('error');
          document.getElementById("status").innerHTML = error;
          alert(error)
      });`
    }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.liveView}>
        <Text style={{color: 'black'}}>{messageLog}</Text>
        {/* <WebView
          style={{flex: 1}}
          injectedJavaScriptBeforeContentLoaded={getScript()}
          javaScriptEnabled = {true}
          contentInset={{top: 0, right: 0, left: 0, bottom: 0}}
          scrollEnabled={false}
          source={{html: formatHtml(), baseUrl: '/'}} /> */}
         {Platform.OS == 'android' ? 
          <RCTLivePreviewView  style={{ flex: 1 }} someRandomProp={"levanphi"} />
        : <RCTLivePreviewIOS style={{flex:1}}/>}
      </View>
      <View style={{justifyContent: 'space-between'}}>
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <TouchableOpacity onPress={handleGetInfoDevices} style={styles.button}>
            <Text style={styles.labelBtn}>
                Get info
            </Text>
          </TouchableOpacity> 
          <TouchableOpacity onPress={handleGetOffDelay} style={styles.button}>
            <Text style={styles.labelBtn}>
                Get Options Info
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <TouchableOpacity onPress={handleTakePicture} style={[styles.button]}>
            <Text style={styles.labelBtn}>
                Take Picture
            </Text>
          </TouchableOpacity> 
          <View style={{justifyContent: 'space-between', flexDirection: 'row', width: '42%'}}>
            <TouchableOpacity onPress={handleGetListFile} style={[styles.button, {marginLeft: 0, marginRight: 0}]}>
              <Text style={styles.labelBtn}>
                  Get List File
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteFile} style={[styles.button, {marginLeft: 0}]}>
              <Text style={styles.labelBtn}>
                  Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <TouchableOpacity onPress={handleGetInfoDevices} style={styles.button}>
            <Text style={styles.labelBtn}>
                Download file
            </Text>
          </TouchableOpacity> 
          <TouchableOpacity onPress={handleGetStatus} style={styles.button}>
            <Text style={styles.labelBtn}>
                Get Status
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <TouchableOpacity onPress={handleSetNoSleep} style={styles.button}>
            <Text style={styles.labelBtn}>
                No Sleep
            </Text>
          </TouchableOpacity> 
          <TouchableOpacity onPress={handleSetSleepDefault} style={styles.button}>
            <Text style={styles.labelBtn}>
                Set Sleep Default
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <TouchableOpacity onPress={handleGetLiveView} style={styles.button}>
            <Text style={styles.labelBtn}>
              Start Live Preview
            </Text>
          </TouchableOpacity> 
          <TouchableOpacity onPress={setOptionPreview} style={styles.button}>
            <Text style={styles.labelBtn}>
              Set Option Preview
            </Text>
          </TouchableOpacity>
        </View>
        <View  style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          {/* <TouchableOpacity onPress={deleteFile} style={styles.button}>
            <Text style={styles.labelBtn}>
              Delete File
            </Text>
          </TouchableOpacity>  */}
          <TouchableOpacity onPress={stopLivePreview}  style={styles.button}>
            <Text style={styles.labelBtn}>
              stopLivePreview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={setCaptureMode}  style={styles.button}>
            <Text style={styles.labelBtn}>
              setCaptureMode
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  liveView: {
    width: '100%',
    height: '50%',
    backgroundColor: 'gray'
  },
  button: {
    backgroundColor: '#fff',
    width: '40%',
    height: 40,
    borderRadius: 8,
    borderColor: '#B06FD6',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  labelBtn: {
    color: '#B06FD6',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default App;
