// const { json } = require('express');
// const calculate = require('calculate-geo-distance');
const app = require('express')();
const axios = require('axios').default;
const { json } = require('body-parser');
const bodyParser = require('body-parser');
const { symlink } = require('fs');
const { type } = require('os');
const http = require('http').createServer(app);
const io = require('socket.io')(http)



// app.use(express.json());


io.on("disconnect", function(client) {

    console.log('disconectado: ' + client.id)
        //     io.open();
})

io.on("connection", function(client) {

    client.on("TopRoute-login", function(name) {


        if (name.pais == 'Colombia') {
            console.log(`id:${client.id}  - ${name.name} conectou COLOMBIA`)

        } else {
            console.log(`id:${client.id}  -  ${name.name.NM_FUNCIONARIOS} conectou BRASIL`)
        }

    });


});

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/routeasyReturn', (req, res) => {
    const site = req.body.routing.site;
    const route = req.body.routing.name.split('-')
    const cod_roteirizacao = route[0]
    const cod_rota = route[1]
    const rotas = req.body.results.routes
    const services = req.body.routing.data.services
    const locations = req.body.routing.data.locations

    var pais = "";

    if (site == "5f3c08365502a6110593b7f7") {
        pais = "Colombia"
    } else {
        pais = "Brasil"
    }

    const filialRouter = {
        name_retorno: req.body.routing.name,
        cod_roteirizacao: cod_roteirizacao,
        cod_rota: cod_rota,
        rotasRouteasy: [],
        pais: pais
    }

    rotas.forEach(function(route) {

        //pegar dados do veiculo
        const item = {
            _idRoute: route._id,
            veiculo: route.name,
            kms: route.distance,
            tempoServico: route.time,
            capacidade: route.capacities[0],
            locations: []
        }
        const delivery_order = route.delivery_order
        delivery_order.forEach(function(order) {

            //pegando somente os serviços de coleta e entrega desconsidentando a saida da filial e retorno a filial
            if (order.type != "depot") {
                const location = {
                    location: order.location._id,
                    order: order.order,
                    distance: order.distance,
                    duration: order.duration,
                    arrival_time: order.arrival_time,
                    departure_time: order.departure_time,
                    services: mylocationsCompany(order.location._id, locations),
                    consolidations: myConsolidations(order.location, services)
                }
                item.locations.push(location)
            }
        })

        filialRouter.rotasRouteasy.push(item)

    })

    io.emit('middleware-retorno', filialRouter);

    res.json(filialRouter)

})

app.post('/routeasyReturn_old', (req, res) => {

    const route = req.body.routing.name.split('-')
    const cod_roteirizacao = route[0]
    const cod_rota = route[1]
    const rotas = req.body.results.routes

    const retornos = [];


    const routes = req.body.results.routes

    const paulo = req.body.routing.data.services
    const paulo1 = req.body.results.routes






    routes.forEach(function(item) {

        // const directions  =  item.directions
        const delivery_order = item.delivery_order
        const directions = item.directions

        const localtions = []

        delivery_order.forEach(function(order) {

            if (order.type != "depot") {

                const location = {
                    location: order.location,
                    order: order.order,
                    distance: order.distance,
                    duration: order.duration,
                    arrival_time: order.arrival_time,
                    departure_time: order.departure_time
                }

                localtions.push(location)
            }

        })

        const rotorno = {
            _id: item._id,
            cod_roteirizacao: cod_roteirizacao,
            cod_rota: cod_rota,
            ident_veiculo: item.name,
            kms: item.distance,
            locations: localtions
        }

        retornos.push(rotorno)
    })


    // routes.forEach(function (route) {
    //   route.directions.forEach(function (direct) {
    //     if (direct.end.delivery.type === 'service') {

    //       console.log(direct)
    //       const serv = {
    //         cod_conhecimento: direct.end.delivery.order_number,
    //         tipo_servico: direct.end.delivery.service_type,
    //         cod_cliente: direct.end.delivery.code,
    //         nome_cliente: direct.end.delivery.name,
    //         endereco: {
    //            lat: direct.end.delivery.address.geocode.lat,
    //            lng: direct.end.delivery.address.geocode.lng,
    //           logradouro: direct.end.delivery.address.route,
    //           numero: direct.end.delivery.address.neighborhood,
    //           cidade: direct.end.delivery.address.city,
    //           uf: direct.end.delivery.address.state,
    //           cep: direct.end.delivery.address.postal_code,
    //           pais: direct.end.delivery.address.country
    //         }
    //       }
    //       // console.log(serv)
    //     }
    //   })

    // })


    // console.log(routes)



    retornos.forEach(function(item) {

        console.log(item.locations)
        item.locations.forEach(async function(i) {

            paulo.forEach(function(p) {

                if (p.location === i.location) {

                    const serv = {
                        cod_conhecimento: p.order_number,
                        tipo_servico: p.service_type,
                        cod_cliente: p.code,
                        nome_cliente: p.name,
                        endereco: {
                            lat: p.address.geocode.lat,
                            lng: p.address.geocode.lng,
                            logradouro: p.address.route,
                            numero: p.address.neighborhood,
                            cidade: p.address.city,
                            uf: p.address.state,
                            cep: p.address.postal_code,
                            pais: p.address.country
                        }

                    }
                    i.services = serv;
                }
            })

        })
    })

    res.json(retornos)
    return
    res.json({ retornos: retornos, routes: routes })



    const veiculo = {
        cod_roteirizcao: cod_roteirizacao,
        cod_rota: cod_rota,
        ident_veiculo: null,
        servicos: []
    };



    res.json(sss)
    return

    if (rotas.length == 1) {
        veiculo.ident_veiculo = rotas[0].name
        veiculo.servicos = rotas[0].delivery_order
        veiculo.detalhes = rotas[0].directions

    }


    const filterItems = (query) => {

        const array = [];
        veiculo.detalhes.filter((item) => {
            if (item.end.delivery._id === query) {

                if (item.end.delivery.address.type != "depot") {
                    const dadosSerivcos = {
                        endereco: {
                            lat: item.end.delivery.address.geocode.lat,
                            lng: item.end.delivery.address.geocode.lng,
                            rua: item.end.delivery.address.route,
                            numero: item.end.delivery.address.street_number,
                            bairro: item.end.delivery.address.neighborhood,
                            cidade: item.end.delivery.address.city,
                            uf: item.end.delivery.address.state,
                            cep: item.end.delivery.address.postal_code
                        },
                        types: {
                            tipoEndereco: item.end.delivery.type,
                            tipoServico: item.end.delivery.service_type

                        },
                        cod_cliente: item.end.delivery.code,
                        nome_cliente: item.end.delivery.name,
                        nota_fiscal: item.end.delivery.invoice_number,
                        cod_conhecimento: item.end.delivery.order_number,

                    }
                    array.push(dadosSerivcos)
                }

            }

        })
        return array
    };

    const filterItems_new = (location) => {

        const array = [];
        veiculo.detalhes.filter((item) => {
            if (item.end.delivery._id === query) {

                if (item.end.delivery.address.type != "depot") {
                    const dadosSerivcos = {
                        endereco: {
                            lat: item.end.delivery.address.geocode.lat,
                            lng: item.end.delivery.address.geocode.lng,
                            rua: item.end.delivery.address.route,
                            numero: item.end.delivery.address.street_number,
                            bairro: item.end.delivery.address.neighborhood,
                            cidade: item.end.delivery.address.city,
                            uf: item.end.delivery.address.state,
                            cep: item.end.delivery.address.postal_code
                        },
                        types: {
                            tipoEndereco: item.end.delivery.type,
                            tipoServico: item.end.delivery.service_type

                        },
                        cod_cliente: item.end.delivery.code,
                        nome_cliente: item.end.delivery.name,
                        nota_fiscal: item.end.delivery.invoice_number,
                        cod_conhecimento: item.end.delivery.order_number,

                    }
                    array.push(dadosSerivcos)
                }

            }

        })
        return array
    };


    ordem_de_entrega_por_local.forEach(function(serv) {

        const servico = filterItems(serv.location)

    })

    veiculo.servicos.forEach(function(item) {
        // console.log('servi')
        item.array = filterItems_new(item.location)
    })

    res.send(JSON.stringify(sss));


    io.emit('middleware-retorno', veiculo);

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


    console.log(req.params)



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

http.listen(3000, function() {
    console.log('socket io listada na porta 3000');
});

function mylocations(location, services) {
    const array = []
    services.forEach(function(item) {

        if (item._id === location) {
            const serv = {
                localtion: location,
                cod_conhecimento: item.order_number,
                tipo_servico: item.service_type,
                cod_cliente: item.code,
                nome_cliente: item.name,
                endereco: {
                    lat: item.address.geocode.lat,
                    lng: item.address.geocode.lng,
                    logradouro: item.address.route,
                    numero: item.address.neighborhood,
                    cidade: item.address.city,
                    uf: item.address.state,
                    cep: item.address.postal_code,
                    pais: item.address.country
                }

            }

            array.push(serv)
        }
    })
    return array

}

function mylocationsCompany(location, services) {
    const array = []



    services.forEach(function(item) {


        if (item._id === location) {
            console.log(item._id)
            const serv = {
                localtion: location,
                cod_conhecimento: item.order_number,
                tipo_servico: item.service_type,
                cod_cliente: item.code,
                nome_cliente: item.name,
                endereco: {
                    lat: item.address.geocode.lat,
                    lng: item.address.geocode.lng,
                    logradouro: item.address.route,
                    numero: item.address.neighborhood,
                    cidade: item.address.city,
                    uf: item.address.state,
                    cep: item.address.postal_code,
                    pais: item.address.country
                }

            }

            array.push(serv)
            console.log(serv)
        }
    })
    return array

}

function myConsolidations(location, services) {

    const array = []
    services.forEach(function(item) {

        if (item.location === location) {
            const serv = {
                localtion: item.localtion,
                cod_conhecimento: item.order_number,
                tipo_servico: item.service_type,
                cod_cliente: item.code,
                nome_cliente: item.name

            }

            array.push(serv)
        }
    })
    return array
}