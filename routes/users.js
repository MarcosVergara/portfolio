const db = require('../database.js');
const requests = require('./requests.js');

module.exports = {
    getLogin: getLogin,
    registerUser: registerUser,
    login: login,
    logout: logout,
    requiresRegister: requiresRegister,
    requiresLogin: requiresLogin,
};

function getLogin(req, res) {
    res.render('login');
}

function registerUser(req, res, next) {
    var user = req.body;
    console.log(user);
    db.none(`INSERT INTO users (email, password, name) VALUES
            ($1, $2, $3)`,
        [user.email, user.password, user.name])
        .then(() => {
            console.log("Registrado");
            if (req.session.docRequest != null) {
                return requests.sendRequest(req, res);
            }
            res.redirect(req.baseUrl + '/');
        })
        .catch(error => {
            console.log(error);
        });
}

function login(req, res, next) {
    if(req.session.user != null){
        res.redirect(req.baseUrl + "/");
    }

    const email = req.body.email;
    const password = req.body.password;
    console.log("email: ", email);
    console.log("password: ", password);

    db.one("SELECT * FROM users WHERE email like '" + email + "' AND password like '" + password + "'")
        .then(user => { //USER FOUND 
            console.log(user);
            req.session.user = user;
            res.locals.name = user.name;
            console.log("Logueado");
            res.locals.user = req.session.user;

            if (req.session.docRequest != null) {
                return requests.sendRequest(req, res);
            }
            if (user.admin == 1) {
                return requests.getRequests(req, res);
            } else {

            }
            res.redirect(req.baseUrl + '/');
        })
        .catch(error => { //NOT FOUND 
            console.log(error);
            res.render('login', { login: false });
        });
}

function logout(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                res.locals.user = null;
                return res.redirect('/');
            }
        });
    }
}

function requiresRegister(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        req.session.docRequest = req.body;
        res.redirect(req.baseUrl + '/login-form');
    }
}

function requiresLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect(req.baseUrl + '/login');
        /* var err = new Error('Debes iniciar sesión para ver esta página.');
      err.status = 401;
      return next(err);
    */
    }
}