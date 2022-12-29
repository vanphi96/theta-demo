import axios from 'axios';

export default async function callApi(
  method,
  endPoint,
  callback,
  data,
  contentType,
) {
  try {
    const BASE_URL = 'http://192.168.1.1';
    const url =`${BASE_URL}${endPoint}`;
    const contentTypeHeader = contentType || 'application/json';
    const config = {
      headers: {
        'Content-Type': contentTypeHeader,
      },
    //   credentials: 'omit',
    //   withCredentials: false,
    //   timeout: 30000
    };
    let response = false;
    switch (method.toUpperCase()) {
      case 'GET': {
        response = await axios.get(url, config);
        break;
      }
      case 'PUT': {
        response = await axios.put(url, data, config);
        break;
      }
      case 'POST': {
        response = await axios.post(url, data, config);
        break;
      }
      case 'DELETE': {
        response = await axios.delete(url, config);
        break;
      }
      default:
        break;
    }
    console.log('success',url);
    if(data) console.log(data)
    callback.onSuccess(response);
  } catch (apiError) {
    console.log('error', apiError);
    let response = apiError?.response;
    const errorStatus = response?.status;
    const errorMessage =
      response?.data?.error?.message ?? `Something went wrong`;
    
    callback.onFail(response);
  }
}
