class NetworkUtil {
  static async get(url) {
    var response = await fetch(url);
    var data;
    try {
      data = await response.json();
    } catch (e) {
      console.error(e);
      data = {};
    }
    return data;
  }
}
export default NetworkUtil;
