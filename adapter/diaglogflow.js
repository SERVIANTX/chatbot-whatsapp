const dialogflow = require('@google-cloud/dialogflow');
const fs = require('fs')
const nanoid = require('nanoid')

/**
 * Debes de tener tu archivo con el nombre "chatbot-account.json" en la raíz del proyecto
 */

const KEEP_DIALOG_FLOW = (process.env.KEEP_DIALOG_FLOW === 'true')
let PROJECID;
let CONFIGURATION;
let sessionClient;

const checkFileCredentials = () => {
    if(!fs.existsSync(`${__dirname}/../chatbot-account.json`)){
        return false
    }

    const parseCredentials = JSON.parse(fs.readFileSync(`${__dirname}/../chatbot-account.json`));
    PROJECID = parseCredentials.project_id;
    CONFIGURATION = {
        credentials: {
            private_key: parseCredentials['private_key'],
            client_email: parseCredentials['client_email']
        }
    }
    sessionClient = new dialogflow.SessionsClient(CONFIGURATION);
}

// Create a new session


// Detect intent method
const detectIntent = async (queryText) => {
    let media = null;
    const sessionId = KEEP_DIALOG_FLOW ? 1 : nanoid();
    const sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);
    const languageCode = process.env.LANGUAGE
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    const [singleResponse] = responses;
    const { queryResult } = singleResponse
    const { intent } = queryResult || { intent: {} }
    const parseIntent = intent['displayName'] || null
    const parsePayload = queryResult['fulfillmentMessages'].find((a) => a.message === 'payload');

    if (parsePayload && parsePayload.payload) {
        const { fields } = parsePayload.payload
        media = fields.media.stringValue || null
    }

    if(queryResult['queryText'].substr(0, 4) == 'prod'){
        var product = queryResult['queryText'].slice(5);
        const axios = require('axios');
        const config = {
            method: 'get',
            url: 'https://api.e-angelamaria.me/products?select=*&linkTo=name_product&search='+product+'&startAt=0&endAt=5',
            headers: {
            'Authorization': 'YJEntU7gJwbnqeukvXxnRgNzA3jg9Q'
            }
        };
        let urlproducto;
        try{
            let response = await axios(config);

            if(response.data.status == 200){

                let textrespond = '🤖 ¡Gracias por escribirnos! Estos son los productos top que coinciden con su búsqueda.\n\n'
                for(var i = 0; i < response.data.total;i++){

                    urlproducto = response.data.results[i].url_product;
                    textrespond = textrespond+'-> https://e-angelamaria.me/'+urlproducto+'\n';

                }
                const parseData = {
                    replyMessage:  textrespond,
                    media,
                    trigger: null
                }
                return parseData

            }

        }
        catch(error){
            let textrespond = '🤖 Lo sentimos no encontre ninguna coincidencia con su búsqueda.'

            const parseData = {
                replyMessage:  textrespond,
                media,
                trigger: null
            }
            return parseData
        }
    }else if(queryResult.fulfillmentText == 'CRH4L5Dc9KtW2'){

        const axios = require('axios');
        const config = {
            method: 'get',
            url: 'https://api.e-angelamaria.me/products?select=url_product&linkTo=productoffer_product&search=[&startAt=0&endAt=3&orderBy=id_product&orderMode=DESC',
            headers: {
            'Authorization': 'YJEntU7gJwbnqeukvXxnRgNzA3jg9Q'
            }
        };
        let urlproducto;
        try{
            let response = await axios(config);

            if(response.data.status == 200){

                let textrespond = '🤖 ¡Gracias por escribirnos! Estos son las ofertas vigentes hasta la fecha.\n\n'
                for(var i = 0; i < response.data.total;i++){

                    urlproducto = response.data.results[i].url_product;
                    textrespond = textrespond+'-> https://e-angelamaria.me/'+urlproducto+'\n';

                }
                const parseData = {
                    replyMessage:  textrespond,
                    media,
                    trigger: null
                }
                return parseData

            }

        }
        catch(error){
            let textrespond = '🤖 Lo sentimos no encontre ninguna oferta vigente.'

            const parseData = {
                replyMessage:  textrespond,
                media,
                trigger: null
            }
            return parseData
        }
    }else if(queryResult['queryText'].substr(0, 3) == 'cod'){
        var idorder = queryResult['queryText'].slice(4);

        const axios = require('axios');
        const config = {
            method: 'get',
            url: 'https://api.e-angelamaria.me/orders?select=id_order,status_order&linkTo=id_order&equalTo=' + idorder,
            headers: {
            'Authorization': 'YJEntU7gJwbnqeukvXxnRgNzA3jg9Q'
            }
        };
        try{
            let response = await axios(config);

            if(response.data.status == 200){

                let textrespond;

                if(response.data.results[0].status_order == 0){

                    textrespond = '🤖 ¡Gracias por escribirnos! Tu pedido ya fue recibido, esta en espera de un repartidor.'

                }else if(response.data.results[0].status_order == 1){

                    textrespond = '🤖 ¡Gracias por escribirnos! Tenemos noticias sobre tu pedido: ¡Sonríe! 😄 Tu pedido ya fue asignado a un repartidor.📦'

                }else if(response.data.results[0].status_order == 2){

                    textrespond = '🤖 ¡Gracias por escribirnos! ¡Tu producto se encuentra en tránsito! ✅ Muy pronto estará contigo.🤗'

                }else if(response.data.results[0].status_order == 3){

                    textrespond = '🤖 ¡Gracias por escribirnos! Tu pedido ya fue entregado. ¡Muchas gracias por comprar en Angela Maria!. Esperando que su experiencia haya sido de su agrado.'

                }

                const parseData = {
                    replyMessage:  textrespond,
                    media,
                    trigger: null
                }
                return parseData

            }

        }
        catch(error){
            let textrespond = '🤖 Verifique que su codigo de pedido ingresado sea el correcto.'

            const parseData = {
                replyMessage:  textrespond,
                media,
                trigger: null
            }
            return parseData
        }
    }else if(queryResult.fulfillmentText == 'CRqAHXKmPX6XE'){

        var textmessage = "";
        let date = new Date();
        date.setHours(date.getHours());

        if ((date.getHours() >= 0) && (date.getHours() < 12)) {
            textmessage = "Buenos días!";
        } else if ((date.getHours() >=12) && (date.getHours()<18)) {
            textmessage = "Buenas tardes!";
        } else if ((date.getHours() >=18) && (date.getHours()<24)) {
            textmessage = "Buenas noches!";
        }

        textrespond = textmessage + ' Mi nombre es Angelo 🤖 y me gustaría darte la bienvenida a nombre del minimarket Angela Maria. Si esta es tu primera vez aquí, me gustaría agradecerle por venir y espero que se sienta cómodo.'

        const parseData = {
            replyMessage:  textrespond,
            media,
            trigger: null
        }
        return parseData

    }

    const parseData = {
        replyMessage:  queryResult.fulfillmentText,
        media,
        trigger: null
    }
    return parseData
}

const getDataIa = (message = '', cb = () => { }) => {
    detectIntent(message).then((res) => {
        cb(res)
    })
}

checkFileCredentials();

module.exports = { getDataIa }
