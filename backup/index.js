const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const middlewareFunctions = require('./middlewares/middlewareFunctions')
const app = express();
const axios = require('axios')
const authString = true
    ? "MeCHHkZ9:tdypsA =:lqBZghxJgaVE"
    : "lRRqlkYefuV=:lRRqlkYefuV6jJ==:qzOUsBmZFgMDlwGtrgYypxUz";
const consolere = require('console-remote-client').connect({ server: 'https://console.re', channel: 'shalbro_backend' });
const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
    apiKey: "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"
})
const openai = new OpenAIApi(configuration)
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, useNewUrlParser: true, parameterLimit: 50000, limit: "50mb" }));



const mongoose = require('./db/mongo_connection')
const mongoSchemaModel = require('./models/schema')

const msgObject = require('./responseMsg.json')
const Schema = mongoose.Schema;



app.post('/create_user', middlewareFunctions.checkAuth, middlewareFunctions.verifying, (req, res) => {
    try {

        console.log(req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {

                console.log("counter value : ", cd);

                let seqId;
                if (cd == null) {
                    const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.COMPANY_ID = cd.seq
                let CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_USERNAME)
                CompanyModel.insertMany(req.body, (err, response) => {
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    else res.json({
                        operation: msgObject.success,
                        result: response,
                        errorMsg: null
                    })
                })


            })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.post('/create_member', middlewareFunctions.checkAuth, middlewareFunctions.vaildateMember, (req, res) => {
    try {
        console.log("body : ", req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {

                console.log("counter value : ", cd);

                let seqId;
                if (cd == null) {
                    const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.MEMBER_ID = cd.seq

                let MemberModel = mongoSchemaModel.MemberModel(req.body.MEMBER_PARENT_USERNAME)

                MemberModel.insertMany(req.body, (err, resp) => {
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    else {
                        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.MEMBER_PARENT_USERNAME)

                        CompanyModel.findOneAndUpdate({ COMPANY_ID: resp[0].MEMBER_PARENT_ID }, {
                            $push: {
                                COMPANY_EMPLOYEE: {
                                    MEMBER_ID: resp[0].MEMBER_ID,
                                    MEMBER_USERNAME: resp[0].MEMBER_USERNAME,
                                },
                            }
                        }, (error, re) => {
                            if (error) res.json({
                                operation: msgObject.failed,
                                result: null,
                                errorMsg: error
                            })
                            else res.json({
                                operation: msgObject.success,
                                result: resp,
                                errorMsg: null
                            })
                        })
                    }
                })


            })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.post('/create_client', middlewareFunctions.checkAuth, middlewareFunctions.vaildateClient, (req, res) => {
    try {
        if (!res.headersSent) res.set('Content-Type', 'application/json');
        console.log("body : ", req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {

                // console.log("counter value : ", cd);

                let seqId;
                if (cd == null) {
                    let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.CLIENT_ID = cd.seq

                let ClientModel = mongoSchemaModel.ClientModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

                ClientModel.insertMany(req.body, (err, resp) => {
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    else {
                        let MemberModel = mongoSchemaModel.MemberModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

                        MemberModel.findOneAndUpdate({ MEMBER_ID: resp[0].CLIENT_PARENT_ID }, {
                            $push: {
                                MEMBER_CLIENTS: {
                                    CLIENT_ID: resp[0].CLIENT_ID,
                                    CLIENT_USERNAME: resp[0].CLIENT_USERNAME,
                                },
                            }
                        }, (errorMember, resMember) => {
                            if (errorMember) res.json({
                                operation: msgObject.failed,
                                result: null,
                                errorMsg: errorMember
                            })
                            else {

                                // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                res.json({
                                    operation: msgObject.success,
                                    result: resp,
                                    errorMsg: null
                                })
                            }
                        })
                    }
                })


            })
    } catch (error) {
        console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.put('/get_user', middlewareFunctions.checkAuth, (req, res) => {
    try {
        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_USERNAME)
        CompanyModel.find({ COMPANY_USERNAME: req.body.COMPANY_USERNAME, COMPANY_ID: req.body.COMPANY_ID }, (err, x) => {
            console.log("user data : ", x)
            if (x.length > 0) {
                res.json({
                    operation: msgObject.success,
                    result: x,
                    errorMsg: null
                })
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: x,
                    errorMsg: msgObject.invalid
                })

            }
        })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.get('/getvalidateusername/:username', middlewareFunctions.checkAuth, (req, res) => {
    try {
        console.log("req.body : ", req.params)

        mongoose.on('error', console.error.bind(console, 'connection error:'));
        mongoose.once('open', function () {
            // We're connected!
            console.log("Connected to MongoDB");

            // Check if a collection exists
            mongoose.mongoose.collection('myCollection', function (err, collection) {
                if (err || !collection) {
                    console.log("myCollection does not exist");
                } else {
                    console.log("myCollection exists");
                }
            });
        });

        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.username)
        CompanyModel.find({ COMPANY_USERNAME: req.body.username }, (err, x) => {
            console.log("user data : ", x)
            if (x.length > 0) {
                res.json({
                    operation: msgObject.success,
                    result: x,
                    errorMsg: null
                })
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: x,
                    errorMsg: msgObject.invalid
                })

            }
        })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.put('/get_members', middlewareFunctions.checkAuth, (req, res) => {
    try {


        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.MEMBER_PARENT_USERNAME)

        CompanyModel.find({ COMPANY_USERNAME: req.body.MEMBER_PARENT_USERNAME, COMPANY_ID: req.body.MEMBER_PARENT_ID }, (err, x) => {
            console.log("user data : ", x)
            if (x.length == 1) {
                const MemberModel = mongoSchemaModel.MemberModel(req.body.MEMBER_PARENT_USERNAME)

                MemberModel.find({
                    MEMBER_PARENT_ID: req.body.MEMBER_PARENT_ID,
                    MEMBER_PARENT_USERNAME: req.body.MEMBER_PARENT_USERNAME,
                    MEMBER_ID: req.body.MEMBER_ID,
                    MEMBER_USERNAME: req.body.MEMBER_USERNAME,
                }, (error, re) => {
                    if (re.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: re,
                            errorMsg: null
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: msgObject.invalid
                        })
                    }
                })
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: x,
                    errorMsg: msgObject.invalid
                })

            }
        })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.put('/get_client', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

        CompanyModel.find({ COMPANY_USERNAME: req.body.CLIENT_MEMBER_PARENT_USERNAME, COMPANY_ID: req.body.CLIENT_MEMBER_PARENT_ID }, (err, x) => {
            console.log("user data : ", x)
            if (x.length == 1) {
                const MemberModel = mongoSchemaModel.MemberModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

                MemberModel.find({
                    MEMBER_ID: req.body.CLIENT_PARENT_ID,
                    MEMBER_USERNAME: req.body.CLIENT_PARENT_USERNAME,
                    MEMBER_PARENT_ID: req.body.CLIENT_MEMBER_PARENT_ID,
                    MEMBER_PARENT_USERNAME: req.body.CLIENT_MEMBER_PARENT_USERNAME,
                }, (error, re) => {
                    if (re.length > 0) {
                        const ClientModel = mongoSchemaModel.ClientModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

                        ClientModel.find({
                            CLIENT_ID: req.body.CLIENT_ID,
                            CLIENT_USERNAME: req.body.CLIENT_USERNAME,
                            CLIENT_PARENT_ID: req.body.CLIENT_PARENT_ID,
                            CLIENT_PARENT_USERNAME: req.body.CLIENT_PARENT_USERNAME,
                            CLIENT_MEMBER_PARENT_ID: req.body.CLIENT_MEMBER_PARENT_ID,
                            CLIENT_MEMBER_PARENT_USERNAME: req.body.CLIENT_MEMBER_PARENT_USERNAME,
                        }, (errorClient, resClient) => {
                            if (errorClient) res.json({
                                operation: msgObject.failed,
                                result: resClient,
                                errorMsg: msgObject.invalid
                            })
                            else if (resClient.length > 0) {
                                res.json({
                                    operation: msgObject.success,
                                    result: resClient,
                                    errorMsg: null
                                })

                            } else {

                                res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: msgObject.invalid
                                })
                            }
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: msgObject.invalid
                        })
                    }
                })
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: x,
                    errorMsg: msgObject.invalid
                })

            }
        })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.post('/querytochatgpt', async (req, res) => {
    try {
        console.log("trigger : /querytochatgpt")

        // let text = req.body.query.replace(/[\r\n]/g, "\\n")
        let text = `can you anlyze given message what the purpose of that '${req.body.query.replace(/[\r\n]/g, "\\n").replaceAll(/[\n]+/g, "\\n")}' and give the output in json`
        console.log("body : ", text)

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            // prompt: `i give you two object fill key's value according to the second object {\n      'first':\"\",\n      'father name':\"\",\n      'phone number':\"\"\n    },{\n      \"Class : \": \"BCA 3rd \",\n      \"Name : \": \"DEEPANSHU \",\n      \"Father's Name : \": \"KARAN SINGH \",\n      \"Roll No. : \": \"1360610094 \",\n      \"Mobile No. : \": \"7206685433 \",\n      \"Address: : \": \"SANJAY COLONY, ROHTAK \",\n      \"Ph.: \": \"01262-274190 \",\n      \"Session \": \"2019-20 \"\n  }\n  and give the output in json format\n\n{\n    'first': \"DEEPANSHU\",\n    'father name': \"KARAN SINGH\",\n    'phone number': \"7206685433\"\n}`,

            // prompt: `can you anlyze given message what the purpose of that "Dear vikash, I hope this email finds you well. I am writing to let you know that I have attached the invoice for invoice pdf to this email. Please find the invoice attached and review it at your convenience. If you have any questions or concerns about the invoice, please do not hesitate to reach out to me. I will be more than happy to provide you with any further information that you may need. Thank you for your business and prompt payment. I appreciate your cooperation and look forward to working with you again in the future. Best regards, Deepanshu" and give the output in json`,
            prompt: `can you anlyze given message what the purpose of '${text}' and give the output in json`,
            max_tokens: 3000,
            temperature: 0,
            top_p: 1,
            // frequency_penalty: 0,
            // presence_penalty: 0,
            // stop: ["\n"],
        })
        let finaldata = response.data.choices[0].text
        let index = finaldata.indexOf("{")
        let index2 = finaldata.lastIndexOf("}")
        console.log("result  : ", finaldata, "end")
        console.log("result  : ", JSON.parse(finaldata.slice(index, (index2 + 1))), "end")

        let data = JSON.parse(finaldata.slice(index, (index2 + 1)))

        mongoSchemaModel.EmailTaskAutomation.insertMany([{ Details: data }], (err, x) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: "There was an issue on the mongo server"
                })
            } else {
                res.status(200).json({
                    success: true,
                    data: response.data.choices[0].text,
                    json_data: JSON.parse(finaldata.slice(index, (index2 + 1))),
                    fulldata: response.data
                });
            }
        })

        // res.status(200).json({
        //     success: true,
        //     data: response.data.choices[0].text,
        //     json_data: JSON.parse(finaldata.slice(index, (index2 + 1))),
        //     fulldata: response.data
        // });
    } catch (error) {
        console.log("error : ", error)
        res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "There was an issue on the server",
        });
    }
})

app.get('/getalltask', (req, res) => {
    try {
        console.log("trigger : /getalltask")
        mongoSchemaModel.EmailTaskAutomation.find({}, { _id: 0, __v: 0 }, (err, x) => {
            if (err) return res.send(
                {
                    success: false,
                    error: "something gonna wrong with mongo"
                }
            )
            else return res.send(
                {
                    success: true,
                    data: x,
                    error: "no"
                }
            )
        })
    } catch (error) {
        return res.send({
            success: false,
            data: "something gonna wrong"
        })
    }
})

app.post('/testapi', (req, res) => {
    try {
        return res.json({
            success: true,
            dataReceived: req.body
        })
    } catch (error) {

        return res.json({
            success: false,
            dataReceived: "error"
        })
    }
})

let PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server Running on => `, PORT);
});