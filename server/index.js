var cookieSession = require("cookie-session");
var express = require("express");
var Keygrip = require("keygrip");
var bodyParser = require("body-parser");
var cors = require("cors");
var config = require("../config.json");
var payeerControler = require("./payeerControler");
var api = require("./api");
var { auth } = require("./middlewares");
var prisma = require("./prisma");
var mongoose = require("mongoose");

// Test the connection to PostgreSQL
prisma.$connect()
  .then(() => {
    console.log("PostgreSQL connection has been established successfully with Prisma.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });
  
// Gestion facultative de MongoDB pour les composants legacy
if (process.env.MONGODB_URI) {
  // Suppression de l'avertissement sur strictQuery
  mongoose.set('strictQuery', true);
  
  console.log("Tentative de connexion à MongoDB pour les composants legacy...");
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connection established for legacy components.");
  })
  .catch(err => {
    console.log("MongoDB non disponible - certaines fonctionnalités legacy pourraient ne pas fonctionner.");
  });
} else {
  console.log("Variable MONGODB_URI non définie - fonctionnement en mode PostgreSQL uniquement.");
}

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  var server = express();
  server.use(
    cors({
      origin: "*",
    })
  );

  server.use(
    cookieSession({
      name: "session",
      keys: new Keygrip(
        config.keys ,
        "SHA384",
        "base64"
      ),
      // Cookie Options
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    })
  );

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use(function (req, res, next) {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    next();
  });

  server.use("/api", api(app));

  server.get("/success", payeerControler.success);
  server.use("/fail", payeerControler.fail);
  server.use("/status", payeerControler.status);

  server.use("/dashboard", auth.ui);
  server.use("/deposit", auth.ui);
  server.use("/depositlist", auth.ui);
  server.use("/referal", auth.ui);
  server.use(handle);

  //   server.get('/',(req,res) =>{
  //       app.render(req,req,'index')
  //   })

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
