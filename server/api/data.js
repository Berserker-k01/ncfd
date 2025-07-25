const { Router } = require("express");
// Import Prisma client pour toutes les opérations de base de données
const prisma = require("../prisma");
const cashStore = require("../cashStore");
const papi = require("../papi");
const R = require("ramda");
const router = Router();
var { auth } = require("../middlewares");

const commons = async (req, res) => {
  var payeer = req.session.payeer;
  var loggedin, user;
  if (payeer) {
    loggedin = true;
    try {
      // Utilisation de Prisma pour récupérer l'utilisateur
      user = await prisma.User.findUnique({
        where: { payeer: payeer }
      });
      if (!user) {
        console.log("Utilisateur non trouvé dans la base de données:", payeer);
      }
    } catch (error) {
      console.log("Erreur lors de la récupération de l'utilisateur:", error);
      user = undefined;
      loggedin = false;
    }
  } else {
    loggedin = false;
    user = undefined;
  }
  var message = req.session.message ? req.session.message : undefined;
  delete req.session.message;
  return { user, loggedin, message };
};

router.get("/index", async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  
  // Utilisation de Prisma pour les retraits
  var operations_withdrawal = [];
  try {
    operations_withdrawal = await prisma.Transaction.findMany({
      where: {
        status: "successful",
        type: { in: ["withdraw", "commition"] }
      },
      orderBy: { created: 'desc' },
      take: 40
    });
  } catch (error) {
    console.log("Erreur Prisma pour operations_withdrawal:", error);
  }

  // Utilisation de Prisma pour les dépôts
  var operations_deposit = [];
  try {
    operations_deposit = await prisma.Transaction.findMany({
      where: {
        status: "successful",
        type: "deposit"
      },
      orderBy: { created: 'desc' },
      take: 40
    });
  } catch (error) {
    console.log("Erreur Prisma pour operations_deposit:", error);
  }

  // Comptage des utilisateurs avec Prisma
  var users = 0;
  try {
    users = await prisma.User.count();
  } catch (error) {
    console.log("Erreur lors du comptage des utilisateurs:", error);
  }

  res.json({
    success: true,
    data: {
      total_deposit: cashStore.current,
      total_paid: cashStore.paid,
      total_user: users,
      loggedin,
      user,
      operations_deposit,
      operations_withdrawal,
      message
    },
  });
});

router.get("/dashboard", auth.api, async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  console.log("user", user);

  // Récupération des derniers dépôts avec Prisma
  var latestdeposits = [];
  try {
    latestdeposits = await prisma.Deposit.findMany({
      where: { payeer },
      orderBy: { created: 'desc' },
      take: 20
    });
  } catch (error) {
    console.log("Erreur Prisma pour latestdeposits:", error);
  }

  // Comptage des référés avec Prisma
  var total_referal = 0;
  try {
    total_referal = await prisma.User.count({
      where: { referer: user.referid }
    });
  } catch (error) {
    console.log("Erreur Prisma pour total_referal:", error);
  }

  // Récupération des commissions avec Prisma
  var total_commition_data = [];
  try {
    total_commition_data = await prisma.Commission.findMany({
      where: { referer: user.referid }
    });
  } catch (error) {
    console.log("Erreur Prisma pour total_commition:", error);
  }

  // Calcul de la somme des profits
  var total_commition = R.reduce(
    (acc, elem) => acc + elem.profit,
    0,
    total_commition_data
  );

  // Récupération des transactions avec Prisma
  var _transactions = [];
  try {
    _transactions = await prisma.Transaction.findMany({
      where: { payeer }
    });
  } catch (error) {
    console.log("Erreur Prisma pour _transactions:", error);
  }
  var payout_sum = R.reduce((acc, next) => acc + next.amount, 0, _transactions);

  // Récupération des dépôts actifs et fermés avec Prisma
  var active = [];
  var closed = [];
  try {
    active = await prisma.Deposit.findMany({
      where: { payeer, closed: false }
    });
    closed = await prisma.Deposit.findMany({
      where: { payeer, closed: true }
    });
  } catch (error) {
    console.log("Erreur Prisma pour active/closed:", error);
  }

  var active_deposit_sum = R.reduce(
    (acc, next) => acc + next.amount,
    0,
    active
  );
  var deposit_sum =
    R.reduce((acc, next) => acc + next.amount, 0, closed) + active_deposit_sum;

  res.json({
    success: true,
    data: {
      loggedin,
      user,
      latestdeposits,
      total_referal,
      total_commition,
      payout_sum,
      deposit_sum,
      message
    },
  });
});

router.get("/deposit", auth.api, async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  var latestdeposits = await Deposit.find({ payeer })
    .sort({ created: -1 })
    .limit(20);

  // Comptage des utilisateurs avec Prisma
  var users = 0;
  try {
    users = await prisma.User.count();
  } catch (error) {
    console.log("Erreur Prisma pour le comptage d'utilisateurs:", error);
  }

  // Récupération du dernier dépôt avec Prisma
  var last_deposit = null;
  try {
    const lastDeposits = await prisma.Transaction.findMany({
      where: {
        type: "deposit",
        status: "successful"
      },
      orderBy: { created: 'desc' },
      take: 1
    });
    last_deposit = lastDeposits.length > 0 ? lastDeposits[0] : null;
  } catch (error) {
    console.log("Erreur Prisma pour le dernier dépôt:", error);
  }

  res.json({
    success: true,
    data: {
      loggedin,
      user,
      latestdeposits,
      message
    },
  });
});

// activedeposits = [],
// closeddeposits = [],
// active_deposit_sum = 0,
// deposit_sum = 0,

router.get("/depositlist", auth.api, async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  var activedeposits = await Deposit.find({ payeer, closed: false }).sort({
    created: -1,
  });

  var closeddeposits = await Deposit.find({ payeer, closed: true })
    .sort({ created: -1 })
    .limit(20);

  var active_deposit_sum = R.reduce(
    (acc, next) => acc + next.amount,
    0,
    activedeposits
  );
  var deposit_sum =
    R.reduce((acc, next) => acc + next.amount, 0, closeddeposits) +
    active_deposit_sum;

  res.json({
    success: true,
    data: {
      loggedin,
      user,
      deposit_sum,
      activedeposits,
      active_deposit_sum,
      closeddeposits,
      message
    },
  });
});

router.get("/referal", auth.api, async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  var commitions = await Commition.find({ referer: user.referid });

  var referals = R.reduceBy(
    (acc, elem) => {
      acc.amount += elem.amount;
      acc.profit = elem.profit;
      return acc;
    },
    { amount: 0, profit: 0 },
    (elem) => elem.payeer,
    commitions
  );

  var total_referal = await User.countDocuments({ referer: user.referid });

  total_commition = R.reduce((acc, elem) => acc + elem.profit, 0, commitions);

  res.json({
    success: true,
    data: {
      loggedin,
      user,
      total_commition,
      total_referal,
      referals,
      host: req.headers.host,
      message
    },
  });
});

router.get("/transactions", auth.api, async (req, res) => {
  var payeer = req.session.payeer;
  var { user, loggedin, message } = await commons(req, res);
  
  // Utiliser Prisma pour les transactions
  var _transactions = [];
  var transactions = [];
  try {
    // Récupérer toutes les transactions pour calculer la somme
    _transactions = await prisma.Transaction.findMany({
      where: { payeer: payeer }
    });
    
    // Récupérer les transactions limitées et triées
    transactions = await prisma.Transaction.findMany({
      where: { payeer: payeer },
      orderBy: { created: 'desc' },
      take: 40
    });
  } catch (error) {
    console.log("Erreur Prisma pour les transactions:", error);
  }

  var payout_sum = R.reduce((acc, next) => acc + next.amount, 0, _transactions);
  
  // Utiliser Prisma pour les dépôts
  var deps = [];
  try {
    deps = await prisma.Deposit.findMany({
      where: { payeer: payeer }
    });
  } catch (error) {
    console.log("Erreur Prisma pour les dépôts:", error);
  }
  
  var deposit_sum = R.reduce((acc, next) => acc + next.amount, 0, deps);

  res.json({
    success: true,
    data: {
      loggedin,
      user,
      transactions,
      payout_sum,
      deposit_sum,
      message,
    },
  });
});

module.exports = router;
