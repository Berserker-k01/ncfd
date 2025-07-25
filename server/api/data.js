const { Router } = require("express");
// Import Prisma client au lieu des modèles Mongoose
const prisma = require("../prisma");
// Conservation des imports existants pour compatibilité temporaire
const User = require("../models/User");
const Commition = require("../models/Commition");
const Deposit = require("../models/Deposit");
const Transaction = require("../models/Transaction");
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
      // Essayer d'utiliser Prisma en premier
      user = await prisma.user.findUnique({
        where: { payeer: payeer }
      });
      // Si Prisma échoue et que MongoDB est disponible, utiliser Mongoose comme fallback
      if (!user && User.findOne) {
        user = await User.findOne({ payeer });
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
    operations_withdrawal = await prisma.transaction.findMany({
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
    operations_deposit = await prisma.transaction.findMany({
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

  var users = await User.countDocuments();

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

  var latestdeposits = await Deposit.find({ payeer })
    .sort({ created: -1 })
    .limit(20);

  var total_referal = await User.countDocuments({ referer: user.referid });

  var total_commition = await Commition.find({ referer: user.referid });

  total_commition = R.reduce(
    (acc, elem) => acc + elem.profit,
    0,
    total_commition
  );

  var _transactions = await Transaction.find({ payeer });
  var payout_sum = R.reduce((acc, next) => acc + next.amount, 0, _transactions);

  var active = await Deposit.find({ payeer, closed: false });
  var closed = await Deposit.find({ payeer, closed: true });

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
    users = await prisma.user.count();
  } catch (error) {
    console.log("Erreur Prisma pour le comptage d'utilisateurs:", error);
    // Fallback sur Mongoose si disponible
    if (User.countDocuments) {
      users = await User.countDocuments();
    }
  }

  // Récupération du dernier dépôt avec Prisma
  var last_deposit = null;
  try {
    const lastDeposits = await prisma.transaction.findMany({
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
    _transactions = await prisma.transaction.findMany({
      where: { payeer: payeer }
    });
    
    // Récupérer les transactions limitées et triées
    transactions = await prisma.transaction.findMany({
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
    deps = await prisma.deposit.findMany({
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
