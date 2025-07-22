const { Router } = require("express");
const prisma = require("../prisma");
const cashStore = require("../cashStore");
const papi = require("../papi");
const R = require("ramda");
const router = Router();
const data = require("./data");

const m = (app) => {
  router.post("/join", async (req, res) => {
    var payeer = req.body.payeer;
    const existingUser = await prisma.user.findUnique({
      where: { payeer }
    });
    
    if (existingUser) {
      req.session = { payeer };
      app.render(req, res, "");
      res.redirect("/dashboard");
    } else {
      // validate payeer adress

      // var validation = await papi.checkUser(payeer);
      // if (validation.errors.length !== 0) {
      //   res.json({
      //     success: true,
      //     data: {
      //       loggedin: false,
      //       message: "invalid payeer adress",
      //     },
      //   });
      // }

      const userData = { payeer };
      
      if (!R.isNil(req.session.referer)) {
        userData.referer = req.session.referer;
      }

      await prisma.user.create({
        data: userData
      });
      
      req.session = { payeer };
      // app.render(req, res, "/dashboard");
      
      res.redirect("/dashboard");
    }
  });

  router.get("/logout", async (req, res) => {
    delete req.session.payeer;

    res.redirect("/");
  });

  router.use("/data", data);

  return router;
};

router.post("/deposit", async (req, res) => {
  var payeer = req.session.payeer;
  var amount = req.body.amount;

  const transaction = await prisma.transaction.create({
    data: {
      payeer: payeer,
      amount: parseFloat(amount),
      type: "deposit",
      status: "pending"
    }
  });

  var result = await papi.makeInvoice(amount, transaction.id);
  var { url } = result;
  res.redirect(url);
});

router.post("/withdraw", async (req, res) => {
  var payeer = req.session.payeer;
  var id = parseInt(req.body.id);

  const deposit = await prisma.deposit.findUnique({
    where: { id }
  });
  
  var profit = deposit.profit;
  
  await prisma.deposit.update({
    where: { id },
    data: { closed: true }
  });

  const transaction = await prisma.transaction.create({
    data: {
      payeer,
      amount: profit,
      type: "withdraw",
      status: "successful"
    }
  });

  cashStore.pay(profit);

  // todo transfer funds to payeer

  req.session.message = "withdraw successful"

  if (cashStore.current > profit)
    await papi.makePayment(profit, payeer, transaction.id);

  res.redirect("/depositlist");
});


module.exports = m;