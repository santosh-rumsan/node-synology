const auth = require("./auth");
const router = require("./router");
const photostation = require("./photostation");

class Synology {
  constructor(config) {
    // Requests protocol : 'http' or 'https' (default: http)
    this.protocol = config.protocol || "http";
    // DSM host : ip, domain name (default: localhost)
    this.host = config.host || "localhost";
    // DSM port : port number (default: 5000)
    this.port = config.port || "5000";
    // PhotoStation port : port number (default: 80)
    this.ps_port = config.ps_port || "80";
    // DSM User account (required)
    this.username = config.account || config.username || null;
    // DSM User password (required)
    this.password = config.password || null;
    // DSM API version (optional, default: 6.0.2)
    this.apiVersion = config.apiVersion || "6.0.2";

    this.token = null;
    this.url = `${this.protocol}://${this.host}:${this.port}`;
    this.ps_url = `${this.protocol}://${this.host}:${this.ps_port}`;

    //this.auth = new auth(this);
    this.Photostation = new photostation(this);
    //this.Router = new router(this);
  }
}

module.exports = Synology;
