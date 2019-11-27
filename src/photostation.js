const axios = require("axios");
const qs = require("qs");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const { CookieJar } = require("tough-cookie");

const http = axios.create();
http.defaults.withCredentials = true;
http.defaults.jar = new CookieJar();
axiosCookieJarSupport(http);

const request = async ({ url, data }) => {
  let options = {
    method: "POST",
    data: qs.stringify(data),
    url
  };
  try {
    let { data } = await http(options);
    return data;
  } catch (e) {
    console.log(e.response);
  }
};

class PhotoStation {
  constructor(syno) {
    this.syno = syno;
    this.url = `${syno.ps_url}/photo/webapi`;
  }

  async login() {
    let data = {
      api: "SYNO.PhotoStation.Auth",
      method: "photo_login",
      version: 1,
      username: this.syno.username,
      password: this.syno.password,
      enable_syno_token: true
    };
    try {
      let resData = await request({ url: `${this.url}/auth.php`, data });
      if (resData.success) {
        this.token = resData.data.sid;
        return resData;
      }
      return resData;
    } catch (e) {
      console.log(e);
    }
  }

  async listAlbums() {
    await this.login();

    let data = {
      api: "SYNO.PhotoStation.Album",
      method: "list",
      version: 1,
      offset: 0,
      limit: -1,
      recursive: false,
      type: "album",
      additional: "album_permission",
      sort_direction: "desc",
      sort_by: "preference",
      ignore: "thumbnail"
    };

    let resData = await request({
      url: `${this.url}/album.php?SynoToken=${this.token}`,
      data
    });

    return resData.data;
  }
}

module.exports = PhotoStation;
