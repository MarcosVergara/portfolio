const db = require('../database.js');
var nodemailer = require('nodemailer');

module.exports = {
    sendRequest: sendRequest,
    getRequests: getRequests
};


function getRequests(req, res){
    db.any("SELECT * FROM user_requests")
        .then(requests => { 
            console.log(requests);
            res.render('admin_panel', { requests:requests });
        })
        .catch(error => { 
            console.log(error);
            res.send("wrong data");
        });
}

function getUserRequests(req, res){
    db.any("SELECT * FROM user_requests where user_id == $1", req.session.user.id)
        .then(requests => { 
            console.log(requests);
            res.render('client_panel', { requests:requests });
        })
        .catch(error => { 
            console.log(error);
            res.send("wrong data");
        });
}

function sendRequest(req, res) {
    var request;
    if (req.session.docRequest != null) {
        request = req.session.docRequest;
    } else {
        request = req.body;
    }
    console.log(request);

    db.task(t => {
        // execute a chain of queries against the task context, and return the result:
        return t.one('INSERT INTO user_requests(question_text, user_name, user_email, subject, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id', 
            [request.message, request.name, request.email, request.subject, req.session.user.id]
        )
            .then(data => {
                console.log(data);
                if (data.id > 0) {
                    return t.none('INSERT INTO request_docs(file_url, request_id) VALUES ($1, $2)', [request.file, data.id])               
                }
            });
    })
        .then(data => {
            sendConfirmationEmail(req.session.user);
            sendAdminNotification(request);
            // success, data = either {count} or {count, logs}
            console.log("task sycces");
            req.session.docRequest = null;
        })
        .catch(error => {
            console.log(error);
        });
}

function sendConfirmationEmail(user){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'lasgarantiasmobiliarias@gmail.com',
          pass: 'garantias2018mobiliarias'
        }
      }); 
      var mailOptions = {
        from: 'lasgarantiasmobiliarias@gmail.com',
        to: user.email,
        subject: `${user.name}, Bienvenido`,
        html: `<h2>${user.name}, tu consulta se enviado con éxito.</h2>
              <p>Gracias por utilizar nuestro servicio!</p>
              <p>Te enviaremos una notificación a esta dirección en cuanto tu consulta sea respondida.</p>
              <p>Puedes acceder a tu cuenta en Garantías Mobiliarias haciendo click en el link siguiente:
              <a href="http://lasgarantiasmobiliarias.com">http://lasgarantiasmobiliarias.com</a></p>
              `,
      }
      transporter.sendMail(mailOptions)
        .then((error, info) => { 
            console.log(error || info);
      })
      .catch(error => {
          console.log(error); 
      });
}

function sendAdminNotification(request){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'lasgarantiasmobiliarias@gmail.com',
          pass: 'garantias2018mobiliarias'
        }
      }); 
      var mailOptions = {
        from: 'lasgarantiasmobiliarias@gmail.com',
        to: 'lasgarantiasmobiliarias@gmail.com',
        subject: `Consulta Recibida`,
        html: `<h2>${request.name}, ha realizado una consulta.</h2>
              <p>Asunto: ${request.subject}</p>
              <p>Accede a la consulta y los archivos en :</p>
              <a href="http://lasgarantiasmobiliarias.com/admin-panel">http://lasgarantiasmobiliarias.com/admin-panel</a></p>
              `,
      }
      transporter.sendMail(mailOptions)
        .then((error, info) => { 
            console.log(error || info);
      })
      .catch(error => {
          console.log(error); 
      });
}