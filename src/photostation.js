const axios = require("axios");
const qs = require("qs");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const { CookieJar } = require("tough-cookie");

const http = axios.create();
http.defaults.withCredentials = true;
http.defaults.jar = new CookieJar();
axiosCookieJarSupport(http);

const request = async opts => {
  let options = Object.assign(
    {
      method: "POST"
    },
    opts
  );

  if (opts.data) options.data = qs.stringify(opts.data);
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
    this.token = null;
  }

  async login() {
    if (this.token) return this.token;
    let data = {
      api: "SYNO.PhotoStation.Auth",
      method: "photo_login",
      version: 1,
      username: this.syno.username,
      password: this.syno.password,
      enable_syno_token: true
    };
    let resData = await request({ url: `${this.url}/auth.php`, data });
    if (resData.success) {
      console.log("===== Logged In ==========");
      this.token = resData.data.sid;
      return this.token;
    } else {
      throw Error("Login unsuccessful");
    }
  }

  async listAlbums(options) {
    await this.login();

    let data = Object.assign(
      {
        api: "SYNO.PhotoStation.Album",
        method: "list",
        version: 1,
        offset: 0,
        limit: 250,
        recursive: false,
        type: "album,photo,video",
        additional:
          "album_permission,photo_exif,video_codec,video_quality,thumb_size,file_location",
        sort_direction: "desc",
        sort_by: "preference"
      },
      options
    );

    return request({
      url: `${this.url}/album.php?SynoToken=${this.token}`,
      data
    });
  }

  async getAlbumInfo(options) {
    await this.login();

    let data = Object.assign(
      {
        api: "SYNO.PhotoStation.Album",
        method: "getinfo",
        version: 1,
        type: "album,photo,video",
        additional: "album_sorting,item_count"
      },
      options
    );

    return request({
      url: `${this.url}/album.php?SynoToken=${this.token}`,
      data
    });
  }

  async getPhotoInfo(options) {
    await this.login();

    let data = Object.assign(
      {
        api: "SYNO.PhotoStation.Photo",
        method: "getexif",
        version: 1
      },
      options
    );

    return request({
      url: `${this.url}/photo.php`,
      data
    });
  }

  async updatePhotoRating(id, rating) {
    return this.updatePhotoInfo({
      id,
      rating
    });
  }

  async updatePhotoInfo(options) {
    await this.login();

    let data = Object.assign(
      {
        api: "SYNO.PhotoStation.Photo",
        version: 1
      },
      options
    );
    data.method = "edit";
    console.log(`${this.url}/photo.php?SynoToken=${this.token}`);

    return request({
      url: `${this.url}/photo.php?SynoToken=${this.token}`,
      data
    });
  }

  getPhoto(id, size = "large") {
    return request({
      method: "GET",
      responseType: "stream",
      url: `${this.url}/thumb.php?api=SYNO.PhotoStation.Thumb&method=get&version=1&size=${size}&id=${id}&rotate_version=0&SynoToken=${this.token}`
    });
  }
}

module.exports = PhotoStation;
