var prisma = require("./prisma");
var cashStore = require("./cashStore");
var papi = require("./papi");
var R = require("ramda");

module.exports.success = async (req, res) => {
  var payeer = req.session.payeer;
  var { m_orderid, m_amount: amount } = req.query;
  
  // Conversion de amount en nombre
  amount = parseFloat(amount);

  // Recherche de l'utilisateur par payeer ID
  var user = await prisma.user.findUnique({
    where: { payeer: payeer }
  });

  // Mise à jour de la transaction
  var transaction = await prisma.transaction.update({
    where: { id: parseInt(m_orderid) },
    data: { status: "successful" }
  });

  cashStore.charge(amount);

  // Traitement de la commission du référent si l'utilisateur a un référent
  if (user && user.referer) {
    var referer = await prisma.user.findUnique({
      where: { referid: user.referer }
    });

    if (referer) {
      // Création d'une nouvelle transaction pour le référent
      var commissionAmount = R.multiply(R.divide(15, 100), amount);
      var tr = await prisma.transaction.create({
        data: {
          payeer: referer.payeer,
          amount: commissionAmount,
          type: "commition",
          status: "successful"
        }
      });

      // Création d'une commission
      await prisma.commission.create({
        data: {
          payeer: payeer,
          referer: user.referer,
          amount: amount,
          profit: commissionAmount
        }
      });

      // Envoi des fonds via Payeer API
      await papi.makePayment(tr.amount, referer.payeer, tr.id);
    }
  }

  // Création d'un nouveau dépôt
  var profit = amount * 1.32;
  await prisma.deposit.create({
    data: {
      payeer: payeer,
      amount: amount,
      profit: profit
    }
  });
  
  req.session.message = "thanks for payment";
  res.redirect('/depositlist');
};

module.exports.fail = async (req, res) => {
  // Si nécessaire, vous pourriez mettre à jour une transaction échouée ici
  // const { m_orderid } = req.query;
  // if (m_orderid) {
  //   await prisma.transaction.update({
  //     where: { id: parseInt(m_orderid) },
  //     data: { status: "failed" }
  //   });
  // }
  
  req.session.message = "payment failed";
  res.redirect('/');
};

module.exports.status = async (req, res) => {
  // Cette méthode est appelée par le système Payeer pour vérifier l'état d'un paiement
  // Vous pouvez implémenter une vérification de signature et d'autres validations ici
  // Pour l'instant, nous renvoyons simplement un OK
  res.sendStatus(200);
};
