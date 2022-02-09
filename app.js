const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios').default;

const http = require('http').createServer(app);

const io = require('socket.io')(http)


//paulo

// io.on("disconnect", function (client) {

//     console.log('disconectado: ' + client.id )
// })



// io.on('disconnect', () => {
//     io.open();
// });

io.on("connection", function(client) {

    // console.log(client.client)
    // console.log( client.id + 'conectado')
    client.on("TopRoute-Emite", function(name) {
        console.log("Usuario : " + name + ' mandou uma msg para o servidor');
        //   clients[client.id] = name;
        //   client.emit("update", "You have connected to the server.");
        //   client.broadcast.emit("update", name + " has joined the server.")

        // client.broadcast.emit('RetornoRouteasy', { name: '55554433','veiculo':'emf-8535' });
        io.emit('server ready', { msg: 'hi' });
    });


});

io.on('connection', (socket) => {
    socket.broadcast.emit('RetornoRouteasy', { name: '55554433', 'veiculo': 'emf-8535' }); // everyone gets it but the sender
});




// app.use(cors());

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));




// POST method route
app.post('/testee', function(req, res) {

    console.log(req.query)
    res.send('POST request to the homepage');
});

app.post('/routeasyReturn', (req, res) => {
    //  console.log(req.body.results.routing)

    io.on('connection', (socket) => {
        socket.broadcast.emit('server ready', { name: '55554433', 'veiculo': 'emf-8535' }); // everyone gets it but the sender
    });


    res.send(JSON.stringify(req.body.routing.name))
        //  res.json( JSON.stringify(req) )

})
app.get('/RetornoRouteasy', (req, res) => {


    axios.get(`https://newsitex.expressojundiai.com.br/ApiOTM`)
        .then(function(response) {
            // handle success
            res.json(response.data);
            //    console.log(response.data);
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });
})

app.get('/buscarcep/:cep', async(req, res) => {




    const { cep } = req.params
    axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then(function(response) {
            // handle success
            res.json(response.data);
            //    console.log(response.data);
        })
        .catch(function(error) {
            // handle error
            console.log(error);
        })
        .then(function() {
            // always executed
        });

})

app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl} `, req.body)
    next()
})




app.use(express.static('public'))

// Handler for 404 - Resource Not Found
app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.status(404).send('We think you are lost!' + res)
})



// app.setHeader("Access-Control-Allow-Origin", app.getHeader("Origin"));
// app.setHeader("Access-Control-Allow-Credentials", "true");
// app.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
// app.setHeader("Access-Control-Max-Age", "3600");
// app.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me");




// Handler for Error 500
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.sendFile(path.join(__dirname, '../public/500.html'))
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))