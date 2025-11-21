module.exports = {
  apps: [
    {
      name: "tienda",
      script: "./backend/server.js",
    }
  ],

  deploy: {
    production: {
      user: "root",
      host: "91.99.200.199",
      ref: "origin/main",
      repo: "https://github.com/havycal/cistelldor.git",
      path: "/root/cistelldor",
      "post-deploy":
        "git pull && npm install && pm2 restart tienda && cp -r /root/cistelldor/* /var/www/tienda/ && systemctl reload nginx"
    }
  }
};
