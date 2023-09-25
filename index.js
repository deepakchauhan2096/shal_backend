const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const middlewareFunctions = require('./middlewares/middlewareFunctions')
const multer = require('multer');
const app = express();
const axios = require('axios')
const fs = require('fs')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
const jwt = require("jsonwebtoken")
const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
    apiKey: "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"
})
const openai = new OpenAIApi(configuration)

const upload = multer({ dest: 'uploads/' });
// app.use(cors());

const corsOptions = {
    origin: 'https://teal-sherbet-de8014.netlify.app/', 
  };
  
app.use(cors(corsOptions));

app.options('*', cors()); // Enable CORS for OPTIONS requests



app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, useNewUrlParser: true, parameterLimit: 50000, limit: "50mb" }));
const helmet = require('helmet');
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https:'],
        },
    })
);
const path = require('path');


const mongoose = require('./db/mongo_connection')
const mongoSchemaModel = require('./models/schema')

const msgObject = require('./responseMsg.json')
const Schema = mongoose.Schema;


// app.use(express.static(path.join(__dirname, 'build')));

// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, '/opt/render/project/src/build', 'index.html'));
// });


// const server = http.createServer((req, res) => {
//     // Check if the request URL is for the index.html file
//     if (req.url === '/index.html') {
//       const filePath = path.join('/opt/render/project/src/build', 'index.html');
  
//       // Read the file asynchronously
//       fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//           // Handle any errors, such as the file not existing
//           res.writeHead(404, { 'Content-Type': 'text/plain' });
//           res.end('File not found');
//         } else {
//           // Send the file contents as the response
//           res.writeHead(200, { 'Content-Type': 'text/html' });
//           res.end(data);
//         }
//       });
//     } else {
//       // Handle other requests, e.g., for other assets or routes
//       res.writeHead(404, { 'Content-Type': 'text/plain' });
//       res.end('Not Found');
//     }
//   });



app.post('/create_admin', middlewareFunctions.checkAuth, middlewareFunctions.verifying, (req, res) => {
    try {
        const Users = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);
        const user = Users.findOne({ ADMIN_USERNAME: req.body.ADMIN_USERNAME });
        // console.log("my name", user)
        result = req.body.ADMIN_USERNAME === user.ADMIN_USERNAME;

        if (!result) {

            // console.log(req.body)
            mongoSchemaModel.countermodel.findOneAndUpdate(
                { id: "autoval" },
                { "$inc": { "seq": 1 } },
                { new: true }, (err, cd) => {

                    // console.log("counter value : ", cd);

                    let seqId;
                    if (cd == null) {
                        const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                        newval.save();
                        seqId = 1;
                    } else {
                        seqId = cd.seq
                    }
                    req.body.ADMIN_ID = cd.seq
                    let AdminModel = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME)
                    AdminModel.insertMany(req.body, (err, response) => {
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

        } else {
            res.status(400).json({
                error: "User Already exist"
            })
            console.log("exist")
        }

    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})


app.post("/login", async function (req, res) {
    try {
        // check if the user exists
        const Users = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME);
        const user = await Users.findOne({ ADMIN_USERNAME: req.body.ADMIN_USERNAME });
        console.log(user, "user")
        if (user) {
            //check if password matches
            const passwordMatch = req.body.ADMIN_PASSWORD === user.ADMIN_PASSWORD;
            if (passwordMatch) {
                const token = jwt.sign({ userId: user._id }, process.env.API_KEY, { expiresIn: '7d' });

                res.json({
                    operation: "successfull",
                    result: user,
                    token: token

                })

            } else {
                res.status(400).json({
                    error: "Authentication failed"
                })
            }
        } else {
            res.status(400).json({
                error: "User doesn't exist"
            })
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});


app.post("/emplogin", async function (req, res) {
    try {
        // check if the user exists
        const Users = mongoSchemaModel.EmployeeModel(req.body.ADMIN_USERNAME);
        const user = await Users.findOne({ EMPLOYEE_ID: req.body.EMPLOYEE_ID });
        console.log(user, "user")
        if (user) {
            //check if password matches
            const result = req.body.EMPLOYEE_PASSWORD === user.EMPLOYEE_PASSWORD
                ;
            if (result) {

                res.json({
                    operation: "successfull",
                    result: user
                })

            } else {
                res.status(400).json({
                    error: "Authentication failed"
                })
            }
        } else {
            res.status(400).json({
                error: "User doesn't exist"
            })
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});



app.post('/create_company', middlewareFunctions.checkAuth, middlewareFunctions.vaildateMember, (req, res) => {
    try {
        const Users = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME);
        const user = Users.findOne({ COMPANY_USERNAME: req.body.COMPANY_USERNAME });
        result = req.body.COMPANY_USERNAME === user.COMPANY_USERNAME;

        // console.log("body : ", req.body)
        if (!result) {
            mongoSchemaModel.countermodel.findOneAndUpdate(
                { id: "autoval" },
                { "$inc": { "seq": 1 } },
                { new: true }, (err, cd) => {

                    // console.log("counter value : ", cd);

                    let seqId;
                    if (cd == null) {
                        const newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                        newval.save();
                        seqId = 1;
                    } else {
                        seqId = cd.seq
                    }
                    req.body.COMPANY_ID = cd.seq

                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME)

                    CompanyModel.insertMany(req.body, (err, resp) => {
                        if (err) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else {
                            let AdminModel = mongoSchemaModel.AdminModel(req.body.COMPANY_PARENT_USERNAME)

                            AdminModel.findOneAndUpdate({ ADMIN_ID: resp[0].COMPANY_PARENT_ID }, {
                                $push: {
                                    ADMIN_COMPANIES: {
                                        COMPANY_ID: resp[0].COMPANY_ID,
                                        COMPANY_USERNAME: resp[0].COMPANY_USERNAME,
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
        } else {
            res.status(400).json({
                error: "User Already exist"
            })
            console.log("exist")
        }

    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.put('/update_company', middlewareFunctions.checkAuth, (req, res) => {
    try {
        const Users = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME);
        const user = Users.findOne({ COMPANY_USERNAME: req.body.COMPANY_USERNAME });
        result = req.body.COMPANY_USERNAME === user.COMPANY_USERNAME;

        // console.log("body : ", req.body)
        if (!result) {
            let { COMPANY_ID,
                COMPANY_USERNAME,
                COMPANY_ADMIN_USERNAME,
                COMPANY_DETAILS_FOR_UPDATE } = req.body
            let CompanyModel = mongoSchemaModel.CompanyModel(COMPANY_ADMIN_USERNAME)

            CompanyModel.findOneAndUpdate({ COMPANY_ID, COMPANY_USERNAME }, { ...COMPANY_DETAILS_FOR_UPDATE }, { COMPANY_EMPLOYIES: 0 }, (err, resp) => {
                console.log("resp : ", resp)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (resp !== null) {
                    res.json({
                        operation: msgObject.success,
                        result: resp,
                        errorMsg: null
                    })
                } else {
                    res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: "Company Not Exist"
                    })
                }
            })
        } else {
            res.status(400).json({
                error: "User Already exist"
            })
            console.log("exist")
        }

    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})



app.post('/create_employee', middlewareFunctions.checkAuth, middlewareFunctions.vaildateClient, (req, res) => {
    try {
        if (!res.headersSent) res.set('Content-Type', 'application/json');
        // console.log("body : ", req.body)
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {
                let seqId;
                if (cd == null) {
                    let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.EMPLOYEE_ID = cd.seq

                let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

                EmployeeModel.insertMany(req.body, (err, resp) => {
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    else {
                        let CompanyModel = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

                        CompanyModel.findOneAndUpdate({ COMPANY_ID: resp[0].EMPLOYEE_PARENT_ID }, {
                            $push: {
                                COMPANY_EMPLOYIES: {
                                    EMPLOYEE_ID: resp[0].EMPLOYEE_ID,
                                    EMPLOYEE_USERNAME: resp[0].EMPLOYEE_USERNAME,
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
        // console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})


app.post('/create_project', middlewareFunctions.checkAuth, middlewareFunctions.vaildateProject, (req, res) => {
    try {
        const Users = mongoSchemaModel.ProjectModel(req.body.PROJECT_MEMBER_PARENT_USERNAME);
        const user = Users.findOne({ PROJECT_MEMBER_PARENT_USERNAME: req.body.PROJECT_MEMBER_PARENT_USERNAME });
        result = req.body.PROJECT_MEMBER_PARENT_USERNAME === user.PROJECT_MEMBER_PARENT_USERNAME;

        if (!result) {
            if (!res.headersSent) res.set('Content-Type', 'application/json');

            mongoSchemaModel.countermodel.findOneAndUpdate(
                { id: "autoval" },
                { "$inc": { "seq": 1 } },
                { new: true }, (err, cd) => {

                    let seqId;
                    if (cd == null) {
                        let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                        newval.save();
                        seqId = 1;
                    } else {
                        seqId = cd.seq
                    }
                    req.body.PROJECT_ID = cd.seq

                    let ProjectModel = mongoSchemaModel.ProjectModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

                    ProjectModel.insertMany(req.body, (err, resp) => {
                        if (err) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else {
                            let CompanyModel = mongoSchemaModel.CompanyModel(req.body.PROJECT_PARENT_USERNAME)

                            CompanyModel.findOneAndUpdate({ COMPANY_ID: resp[0].PROJECT_PARENT_ID }, {
                                $push: {
                                    COMPANY_PROJECTS: {
                                        PROJECT_ID: resp[0].PROJECT_PARENT_ID,
                                        PROJECT_USERNAME: resp[0].PROJECT_PARENT_USERNAME,
                                    },
                                }
                            }, (errorMember, resMember) => {
                                if (errorMember) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorMember
                                })
                                else {
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
        } else {
            res.status(400).json({
                error: "User Already exist"
            })
            console.log("exist")
        }




    } catch (error) {
        // console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.post('/create_subcontractor', middlewareFunctions.checkAuth, middlewareFunctions.vaildateSubContractor, (req, res) => {
    try {
        const Users = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME);
        const user = Users.findOne({ SUBCONTRACTOR_MEMBER_PARENT_USERNAME: req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME });
        result = req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME === user.SUBCONTRACTOR_MEMBER_PARENT_USERNAME;

        if (!result) {

            if (!res.headersSent) res.set('Content-Type', 'application/json');

            mongoSchemaModel.countermodel.findOneAndUpdate(
                { id: "autoval" },
                { "$inc": { "seq": 1 } },
                { new: true }, (err, cd) => {

                    let seqId;
                    if (cd == null) {
                        let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                        newval.save();
                        seqId = 1;
                    } else {
                        seqId = cd.seq
                    }
                    req.body.SUBCONTRACTOR_ID = cd.seq

                    let SubContractorModel = mongoSchemaModel.SubContractorModel
                        (req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

                    SubContractorModel.insertMany(req.body, (err, resp) => {
                        if (err) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else {
                            let CompanyModel = mongoSchemaModel.CompanyModel(req.body.SUBCONTRACTOR_PARENT_USERNAME)

                            CompanyModel.findOneAndUpdate({ COMPANY_ID: resp[0].SUBCONTRACTOR_PARENT_ID }, {
                                $push: {
                                    COMPANY_SUBCONTRACTOR: {
                                        SUBCONTRACTOR_ID: resp[0].SUBCONTRACTOR_PARENT_ID,
                                        SUBCONTRACTOR_USERNAME: resp[0].SUBCONTRACTOR_PARENT_USERNAME,
                                    },
                                }
                            }, (errorMember, resMember) => {
                                if (errorMember) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorMember
                                })
                                else {
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
        } else {
            res.status(400).json({
                error: "User Already exist"
            })
            console.log("exist")
        }

    } catch (error) {
        // console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})



app.post('/attendance', middlewareFunctions.checkAuth, middlewareFunctions.vaildateMember, (req, res) => {
    try {
        const { employeeId, timeIn, timeOut } = req.body;

        // Create a new attendance record
        const attendance = new mongoSchemaModel.AttendanceModel({
            employeeId,
            timeIn,
            timeOut,
        });

        // Save the attendance record to the database
        attendance.save((err, record) => {
            if (err) {
                res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                });
            } else {
                res.json({
                    operation: msgObject.success,
                    result: record,
                    errorMsg: null
                });
            }
        });
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        });
    }
});


app.put('/get_admin', middlewareFunctions.checkAuth, (req, res) => {
    try {
        let AdminModel = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME)
        AdminModel.find({ ADMIN_USERNAME: req.body.ADMIN_USERNAME, ADMIN_EMAIL: req.body.ADMIN_EMAIL }, (err, x) => {
            // console.log("user data : ", x)
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
            result: [],
            errorMsg: error
        })
    }
})

app.get('/getvalidateusername/:username', middlewareFunctions.checkAuth, (req, res) => {
    try {
        // console.log("req.body : ", req.params)

        mongoose.on('error', console.error.bind(console, 'connection error:'));
        mongoose.once('open', function () {
            // We're connected!
            // console.log("Connected to MongoDB");

            // Check if a collection exists
            mongoose.mongoose.collection('myCollection', function (err, collection) {
                if (err || !collection) {
                    // console.log("myCollection does not exist");
                } else {
                    // console.log("myCollection exists");
                }
            });
        });

        let AdminModel = mongoSchemaModel.AdminModel(req.body.username)
        AdminModel.find({ ADMIN_USERNAME: req.body.username }, (err, x) => {
            // console.log("user data : ", x)
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

app.put('/get_company', middlewareFunctions.checkAuth, (req, res) => {
    try {


        let AdminModel = mongoSchemaModel.AdminModel(req.body.COMPANY_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.COMPANY_PARENT_USERNAME, ADMIN_ID: req.body.COMPANY_PARENT_ID }, (err, x) => {
            // console.log("user data : ", x)
            if (x.length == 1) {
                const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME)

                CompanyModel.find({
                    COMPANY_PARENT_ID: req.body.COMPANY_PARENT_ID,
                    COMPANY_PARENT_USERNAME: req.body.COMPANY_PARENT_USERNAME,
                    COMPANY_ID: req.body.COMPANY_ID,
                    COMPANY_USERNAME: req.body.COMPANY_USERNAME,
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

app.put('/get_companies/:user', middlewareFunctions.checkAuth, (req, res) => {
    try {


        let AdminModel = mongoSchemaModel.AdminModel(req.body.COMPANY_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.COMPANY_PARENT_USERNAME, ADMIN_ID: req.body.COMPANY_PARENT_ID }, (err, x) => {
            // console.log("user data : ", x)
            if (x.length == 1) {
                const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME)

                CompanyModel.find({
                    COMPANY_PARENT_ID: req.body.COMPANY_PARENT_ID,
                    COMPANY_PARENT_USERNAME: req.body.COMPANY_PARENT_USERNAME,
                    COMPANY_USERNAME: req.params.user
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

app.post('/querytochatgpt', async (req, res) => {
    try {
        // console.log("trigger : /querytochatgpt")

        // let text = req.body.query.replace(/[\r\n]/g, "\\n")
        let text = `can you anlyze given message what the purpose of that '${req.body.query.replace(/[\r\n]/g, "\\n").replaceAll(/[\n]+/g, "\\n")}' and give the output in json`
        // console.log("body : ", text)

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
        // console.log("result  : ", finaldata, "end")
        // console.log("result  : ", JSON.parse(finaldata.slice(index, (index2 + 1))), "end")

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
        // console.log("error : ", error)
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
        // console.log("trigger : /getalltask")
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

app.put('/get_employee', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.EMPLOYEE_MEMBER_PARENT_ID }, (err, x) => {
            // console.log("employee data : ", x)
            if (x.length == 1) {

                const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

                EmployeeModel.find({
                    EMPLOYEE_PARENT_USERNAME: req.body.EMPLOYEE_PARENT_USERNAME,
                    EMPLOYEE_PARENT_ID: req.body.EMPLOYEE_PARENT_ID
                }, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})

app.put('/update_employee', middlewareFunctions.checkAuth, (req, res) => {
    try {
        console.log("update_employee body : ", req.body)

        let { EMPLOYEE_ID,
            EMPLOYEE_PARENT_ID,
            EMPLOYEE_PARENT_USERNAME,
            EMPLOYEE_MEMBER_PARENT_ID,
            EMPLOYEE_MEMBER_PARENT_USERNAME,
            EMPLOYEE_DETAILS_FOR_UPDATES } = req.body
        const EmployeeModel = mongoSchemaModel.EmployeeModel(EMPLOYEE_MEMBER_PARENT_USERNAME)

        EmployeeModel.findOneAndUpdate({
            EMPLOYEE_ID,
            EMPLOYEE_PARENT_ID,
            EMPLOYEE_PARENT_USERNAME,
            EMPLOYEE_MEMBER_PARENT_ID,
            EMPLOYEE_MEMBER_PARENT_USERNAME,
        }, { ...EMPLOYEE_DETAILS_FOR_UPDATES }, (error_emp, x_emp) => {
            if (error_emp) res.json({
                operation: msgObject.failed,
                result: recontract,
                errorMsg: msgObject.invalid
            })
            else if (x_emp !== null) {
                res.json({
                    operation: msgObject.success,
                    result: x_emp,
                    errorMsg: []
                })

            } else {

                res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: "Employee Not Exist"
                })
            }
        })


    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})

app.put('/get_employee_for_employee', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME }, (err, x) => {
            // console.log("employee data : ", x)
            if (x.length == 1) {

                const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

                EmployeeModel.find({
                    EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME,
                    EMPLOYEE_EMAIL: req.body.EMPLOYEE_EMAIL
                }, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})

app.put('/get_employee_all', middlewareFunctions.checkAuth, (req, res) => {
    y
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME }, (err, x) => {
            // console.log("employee data : ", x)
            if (x.length == 1) {

                const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

                EmployeeModel.find({}, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})


app.put('/get_employee_all_for_attendence', middlewareFunctions.checkAuth, (req, res) => {

    try {

        // console.log("req : ", req.body)
        let EmpModel = mongoSchemaModel.EmployeeModel(req.body.ATTENDANCE_ADMIN_USERNAME)

        EmpModel.find({ EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME }, (err, x) => {
            // console.log("employee data : ", x)
            if (x.length == 1) {

                const AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ATTENDANCE_ADMIN_USERNAME)

                AttendanceModel.find({
                    ATTENDANCE_EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
                    ATTENDANCE_DATE_ID: {
                        "$gte": req.body.ATTENDANCE_START_DATE,
                        "$lte": req.body.ATTENDANCE_END_DATE
                    }
                }, (error_attendance, x_attendance) => {
                    // console.log("x_attendance : ", x_attendance, error_attendance)
                    if (error_attendance) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (x_attendance.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: x_attendance,
                            errorMsg: null
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
                            errorMsg: msgObject.invalid
                        })
                    }
                })

            } else {
                res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: msgObject.invalid
                })

            }
        })
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})


app.put('/get_projects', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.PROJECT_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.PROJECT_MEMBER_PARENT_ID }, (err, x) => {
            // console.log("Project data : ", x)
            if (x.length == 1) {

                const ProjectModel = mongoSchemaModel.ProjectModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

                ProjectModel.find({
                    PROJECT_PARENT_ID: req.body.PROJECT_PARENT_ID,
                    PROJECT_PARENT_USERNAME: req.body.PROJECT_PARENT_USERNAME,
                }, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})

app.put('/get_projects_one', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.PROJECT_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.PROJECT_MEMBER_PARENT_ID }, (err, x) => {
            // console.log("Project data : ", x)
            if (x.length == 1) {

                const ProjectModel = mongoSchemaModel.ProjectModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

                ProjectModel.find({
                    PROJECT_ID: req.body.PROJECT_ID,
                }, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})

app.put('/get_subcontractor', middlewareFunctions.checkAuth, (req, res) => {
    try {

        let AdminModel = mongoSchemaModel.AdminModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.SUBCONTRACTOR_MEMBER_PARENT_ID }, (err, x) => {
            // console.log("Project data : ", x)
            if (x.length == 1) {

                const SubContractorModel = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

                SubContractorModel.find({
                    SUBCONTRACTOR_PARENT_ID: req.body.SUBCONTRACTOR_PARENT_ID,
                    SUBCONTRACTOR_PARENT_USERNAME: req.body.SUBCONTRACTOR_PARENT_USERNAME,
                }, (errorcontract, recontract) => {
                    if (errorcontract) res.json({
                        operation: msgObject.failed,
                        result: recontract,
                        errorMsg: msgObject.invalid
                    })
                    else if (recontract.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: recontract,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})

app.put('/update_projects', middlewareFunctions.checkAuth, (req, res) => {
    try {
        console.log("update_projects body : ", req.body)

        let { PROJECT_ID,
            PROJECT_PARENT_ID,
            PROJECT_PARENT_USERNAME,
            PROJECT_MEMBER_PARENT_ID,
            PROJECT_MEMBER_PARENT_USERNAME,
            PROJECT_DETAILS_FOR_UPDATES } = req.body

        if (PROJECT_DETAILS_FOR_UPDATES) {

            const ProjectModel = mongoSchemaModel.ProjectModel(PROJECT_MEMBER_PARENT_USERNAME)

            ProjectModel.findOneAndUpdate({
                PROJECT_ID,
                PROJECT_PARENT_ID,
                PROJECT_PARENT_USERNAME,
                PROJECT_MEMBER_PARENT_ID,
                PROJECT_MEMBER_PARENT_USERNAME
            }, { ...PROJECT_DETAILS_FOR_UPDATES }, (error_project, x_project) => {
                console.log("x_project : ", x_project)
                if (error_project) res.json({
                    operation: msgObject.failed,
                    result: error_project,
                    errorMsg: msgObject.invalid
                })
                else if (x_project !== null) {
                    res.json({
                        operation: msgObject.success,
                        result: x_project,
                        errorMsg: []
                    })

                } else {

                    res.json({
                        operation: msgObject.failed,
                        result: [],
                        errorMsg: "Project Not Exist"
                    })
                }
            })

        } else {

            res.json({
                operation: msgObject.failed,
                result: [],
                errorMsg: "Details Missing"
            })
        }

    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})

app.put('/get_all_company', middlewareFunctions.checkAuth, (req, res) => {
    try {


        let AdminModel = mongoSchemaModel.AdminModel(req.body.COMPANY_PARENT_USERNAME)

        AdminModel.find({ ADMIN_USERNAME: req.body.COMPANY_PARENT_USERNAME, ADMIN_ID: req.body.COMPANY_PARENT_ID }, (err, x) => {
            // console.log("user data : ", x)
            if (x.length == 1) {
                const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME)

                CompanyModel.find({}, (error, re) => {
                    if (re.length > 0) {
                        res.json({
                            operation: msgObject.success,
                            result: re,
                            errorMsg: []
                        })

                    } else {

                        res.json({
                            operation: msgObject.failed,
                            result: [],
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
            result: [],
            errorMsg: error
        })
    }
})


app.post('/create_emp_attendence', middlewareFunctions.checkAuth, (req, res) => {
    try {
        console.log("body: ", req.body);

        let temp_body = { ...req.body };
        console.log("tempdata", temp_body);

        let AttendanceModel = mongoSchemaModel.AttendanceModel(
            req.body.ATTENDANCE_ADMIN_USERNAME
        );

        AttendanceModel.findOne(
            {
                ATTENDANCE_DATE_ID: temp_body.ATTENDANCE_DATE_ID,
                ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
                ATTENDANCE_PROJECT_ID: temp_body.ATTENDANCE_PROJECT_ID,
            },
            (errAt, attendanceRecord) => {
                console.log(attendanceRecord);
                if (errAt) {
                    res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: errAt,
                    });
                } else {
                    if (!attendanceRecord) {
                        // Handle the case when there's no existing attendance record
                        mongoSchemaModel.countermodel.findOneAndUpdate(
                            { id: "autoval" },
                            { $inc: { seq: 1 } },
                            { new: true },
                            (err, cd) => {
                                console.log("counter value: ", cd);

                                let seqId;
                                if (cd == null) {
                                    const newval = new mongoSchemaModel.countermodel({
                                        id: "autoval",
                                        seq: 1,
                                    });
                                    newval.save();
                                    seqId = 1;
                                } else {
                                    seqId = cd.seq;
                                }
                                req.body.ATTENDANCE_ID = seqId;

                                // Insert a new attendance record with "in" punch
                                req.body.ATTENDANCE_IN = req.body.ATTENDANCE_IN;
                                req.body.ATTENDANCE_OUT = req.body.ATTENDANCE_OUT; // Clear out "out" punch

                                AttendanceModel.insertMany(req.body, (err, resp) => {
                                    if (err)
                                        res.json({
                                            operation: msgObject.failed,
                                            result: null,
                                            errorMsg: err,
                                        });
                                    else {
                                        updateEmployeeAttendanceStatus(req, res, "IN", resp);
                                    }
                                });
                            }
                        );
                    } else {
                        if (attendanceRecord.ATTENDANCE_IN && !attendanceRecord.ATTENDANCE_OUT) {
                            // Update the existing attendance record for the "out" punch
                            AttendanceModel.findOneAndUpdate(
                                { ATTENDANCE_ID: attendanceRecord.ATTENDANCE_ID },
                                {
                                    $set: {
                                        ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
                                    },
                                },
                                { new: true },
                                (error, updatedAttendanceRecord) => {
                                    if (error) {
                                        res.json({
                                            operation: msgObject.failed,
                                            result: null,
                                            errorMsg: error,
                                        });
                                    } else {
                                        updateEmployeeAttendanceStatus(req, res, "OUT", updatedAttendanceRecord);
                                    }
                                }
                            );
                        } else {
                            res.json({
                                operation: msgObject.failed,
                                result: null,
                                errorMsg: "Employee is not punched in for this project.",
                            });
                        }
                    }
                }
            }
        );
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error,
        });
    }
});
// app.post("/create_emp_attendance3", middlewareFunctions.checkAuth, (req, res) => {
//   try {
//     console.log("body: ", req.body);

//     let temp_body = { ...req.body };
//     console.log("tempdata", temp_body);

//     let AttendanceModel = mongoSchemaModel.AttendanceModel(
//       req.body.ATTENDANCE_ADMIN_USERNAME
//     );

//     AttendanceModel.findOne(
//       {
//         ATTENDANCE_DATE_ID: temp_body.ATTENDANCE_DATE_ID,
//         ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
//         ATTENDANCE_PROJECT_ID: temp_body.ATTENDANCE_PROJECT_ID,
//       },
//       (errAt, attendanceRecord) => {
//         console.log(attendanceRecord);
//         if (errAt) {
//           res.json({
//             operation: msgObject.failed,
//             result: null,
//             errorMsg: errAt,
//           });
//         } else {
//           if (!attendanceRecord) {
//             // Handle the case when there's no existing attendance record
//             mongoSchemaModel.countermodel.findOneAndUpdate(
//               { id: "autoval" },
//               { $inc: { seq: 1 } },
//               { new: true },
//               (err, cd) => {
//                 console.log("counter value: ", cd);

//                 let seqId;
//                 if (cd == null) {
//                   const newval = new mongoSchemaModel.countermodel({
//                     id: "autoval",
//                     seq: 1,
//                   });
//                   newval.save();
//                   seqId = 1;
//                 } else {
//                   seqId = cd.seq;
//                 }
//                 req.body.ATTENDANCE_ID = seqId;

//                 // Insert a new attendance record with "in" punch
//                 req.body.ATTENDANCE_IN = req.body.ATTENDANCE_IN;
//                 req.body.ATTENDANCE_OUT = ""; // Clear out "out" punch

//                 // Calculate overtime
//                 const overtime = calculateOvertime(req.body);

//                 // Insert overtime into the request body
//                 req.body.ATTENDANCE_OVERTIME = overtime;

//                 AttendanceModel.insertMany(req.body, (err, resp) => {
//                   if (err)
//                     res.json({
//                       operation: msgObject.failed,
//                       result: null,
//                       errorMsg: err,
//                     });
//                   else {
//                     updateEmployeeAttendanceStatus(req, res, "IN", resp);
//                   }
//                 });
//               }
//             );
//           } else {
//             if (attendanceRecord.ATTENDANCE_IN && !attendanceRecord.ATTENDANCE_OUT) {
//               // Update the existing attendance record for the "out" punch
//               AttendanceModel.findOneAndUpdate(
//                 { ATTENDANCE_ID: attendanceRecord.ATTENDANCE_ID },
//                 {
//                   $set: {
//                     ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
//                     // Calculate overtime
//                     ATTENDANCE_OVERTIME: calculateOvertime(req.body),
//                   },
//                 },
//                 { new: true },
//                 (error, updatedAttendanceRecord) => {
//                   if (error) {
//                     res.json({
//                       operation: msgObject.failed,
//                       result: null,
//                       errorMsg: error,
//                     });
//                   } else {
//                     // Update overtime and employee attendance status
//                     updateEmployeeAttendanceStatus(
//                       req,
//                       res,
//                       "OUT",
//                       updatedAttendanceRecord,
//                       updatedAttendanceRecord.ATTENDANCE_OVERTIME
//                     );
//                   }
//                 }
//               );
//             } else {
//               res.json({
//                 operation: msgObject.failed,
//                 result: null,
//                 errorMsg: "Employee is not punched in for this project.",
//               });
//             }
//           }
//         }
//       }
//     );
//   } catch (error) {
//     res.json({
//       operation: msgObject.failed,
//       result: null,
//       errorMsg: error,
//     });
//   }
// });

// function calculateOvertime(attendanceRecord) {
//   if (!attendanceRecord.ATTENDANCE_IN || !attendanceRecord.ATTENDANCE_OUT) {
//     // No overtime if either in or out time is missing
//     return 0;
//   } else {
//     // Calculate overtime in hours
//     const inTime = moment(attendanceRecord.ATTENDANCE_IN, "HH:mm");
//     const outTime = moment(attendanceRecord.ATTENDANCE_OUT, "HH:mm");
//     const regularWorkingHours = 8; // Assuming 8 hours as regular working hours

//     // Calculate the duration in hours
//     const duration = moment.duration(outTime.diff(inTime));
//     const workedHours = duration.asHours();

//     // Calculate overtime
//     const overtime = Math.max(0, workedHours - regularWorkingHours);

//     return overtime;
//   }
// }


// function updateEmployeeAttendanceStatus(req, res, punchType, attendanceRecord, overtime) {
//   let EmployeeModel = mongoSchemaModel.EmployeeModel(
//     req.body.ATTENDANCE_ADMIN_USERNAME
//   );

//   EmployeeModel.findOneAndUpdate(
//     {
//       EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
//       EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
//     },
//     {
//       $set: {
//         EMPLOYEE_ATTENDANCE_STATUS: {
//           date: attendanceRecord.ATTENDANCE_DATE_ID,
//           [punchType]: true,
//           PROJECTED_ID: req.body.ATTENDANCE_PROJECT_ID,
//           TOTAL_WORKING_HOURS: req.body.ATTENDANCE_WORKING_HOURS,
//           OVERTIME: overtime,
//         },
//       },
//     },
//     { new: true },
//     (emp_err, emp_x) => {
//       console.log("emp_x: ", emp_x);
//       if (emp_err) {
//         res.json({
//           operation: msgObject.failed,
//           result: null,
//           errorMsg: emp_err,
//         });
//       } else {
//         res.json({
//           operation: msgObject.success,
//           result: attendanceRecord,
//           errorMsg: null,
//         });
//       }
//     }
//   );
// }

function updateEmployeeAttendanceStatus(req, res, punchType, attendanceRecord) {
    let EmployeeModel = mongoSchemaModel.EmployeeModel(
        req.body.ATTENDANCE_ADMIN_USERNAME
    );

    EmployeeModel.findOneAndUpdate(
        {
            EMPLOYEE_ID: req.body.ATTENDANCE_EMPLOYEE_ID,
            EMPLOYEE_USERNAME: req.body.ATTENDANCE_EMPLOYEE_USERNAME,
        },
        {
            $set: {
                EMPLOYEE_ATTENDANCE_STATUS: {
                    date: attendanceRecord.ATTENDANCE_DATE_ID,
                    [punchType]: true,
                    PROJECTED_ID: req.body.ATTENDANCE_PROJECT_ID,
                    TOTAL_WORKING_HOURS: req.body.ATTENDANCE_WORKING_HOURS,
                    OVERtIME: req.body.ATTENDANCE_OVERTIME,
                },
            },
        },
        { new: true },
        (emp_err, emp_x) => {
            console.log("emp_x: ", emp_x);
            if (emp_err)
                res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: emp_err,
                });
            else
                res.json({
                    operation: msgObject.success,
                    result: attendanceRecord,
                    errorMsg: null,
                });
        }
    );
}


//   app.post("/create_emp_attendance", middlewareFunctions.checkAuth, (req, res) => {
//     try {
//         console.log("body: ", req.body);

//         let temp_body = { ...req.body };
//         console.log("tempdata", temp_body);

//         let AttendanceModel = mongoSchemaModel.AttendanceModel(
//           req.body.ATTENDANCE_ADMIN_USERNAME
//         );

//         AttendanceModel.findOne(
//           {
//             ATTENDANCE_DATE_ID: temp_body.ATTENDANCE_DATE_ID,
//             ATTENDANCE_EMPLOYEE_ID: temp_body.ATTENDANCE_EMPLOYEE_ID,
//             ATTENDANCE_PROJECT_ID: temp_body.ATTENDANCE_PROJECT_ID,
//           },
//           (errAt, attendanceRecord) => {
//             console.log(attendanceRecord);
//             if (errAt) {
//               res.json({
//                 operation: msgObject.failed,
//                 result: null,
//                 errorMsg: errAt,
//               });
//             } else {
//               if (!attendanceRecord) {
//                 // Handle the case when there's no existing attendance record
//                 mongoSchemaModel.countermodel.findOneAndUpdate(
//                   { id: "autoval" },
//                   { $inc: { seq: 1 } },
//                   { new: true },
//                   (err, cd) => {
//                     console.log("counter value: ", cd);

//                     let seqId;
//                     if (cd == null) {
//                       const newval = new mongoSchemaModel.countermodel({
//                         id: "autoval",
//                         seq: 1,
//                       });
//                       newval.save();
//                       seqId = 1;
//                     } else {
//                       seqId = cd.seq;
//                     }
//                     req.body.ATTENDANCE_ID = seqId;

//                     // Insert a new attendance record with "in" punch
//                     req.body.ATTENDANCE_IN = req.body.ATTENDANCE_IN;
//                     req.body.ATTENDANCE_OUT = req.body.ATTENDANCE_OUT; // Clear out "out" punch

//                     AttendanceModel.insertMany(req.body, (err, resp) => {
//                       if (err)
//                         res.json({
//                           operation: msgObject.failed,
//                           result: null,
//                           errorMsg: err,
//                         });
//                       else {
//                         updateEmployeeAttendanceStatus(req, res, "IN", resp);
//                       }
//                     });
//                   }
//                 );
//               } else {
//                 if (attendanceRecord.ATTENDANCE_IN && !attendanceRecord.ATTENDANCE_OUT) {
//                   // Update the existing attendance record for the "out" punch
//                   AttendanceModel.findOneAndUpdate(
//                     { ATTENDANCE_ID: attendanceRecord.ATTENDANCE_ID },
//                     {
//                       $set: {
//                         ATTENDANCE_OUT: req.body.ATTENDANCE_OUT,
//                       },
//                     },
//                     { new: true },
//                     (error, updatedAttendanceRecord) => {
//                       if (error) {
//                         res.json({
//                           operation: msgObject.failed,
//                           result: null,
//                           errorMsg: error,
//                         });
//                       } else {
//                         updateEmployeeAttendanceStatus(req, res, "OUT", updatedAttendanceRecord);
//                       }
//                     }
//                   );
//                 } else {
//                   res.json({
//                     operation: msgObject.failed,
//                     result: null,
//                     errorMsg: "Employee is not punched in for this project.",
//                   });
//                 }
//               }
//             }
//           }
//         );
//       } catch (error) {
//         res.json({
//           operation: msgObject.failed,
//           result: null,
//           errorMsg: error,
//         });
// }
// });


// Required Api's 
// Edit Project, Edit Subcontract, Delete Project, Delete Subcontract, 


app.post('/testapi', (req, res) => {
    console.log("trigger >> /testapi")
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




app.post('/create_document', middlewareFunctions.checkAuth, upload.single('file'), (req, res) => {
    try {

        // console.log("fileData2 : ", req.file)

        const fileData = fs.readFileSync(req.file.path);

        // console.log("fileData : ", fileData)
        // console.log("fileData2 : ", req.file)
        // console.log("body : ", req.body)
        if (!res.headersSent) res.set('Content-Type', 'application/json');
        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }, (err, cd) => {

                // // console.log("counter value : ", cd);

                let seqId;
                if (cd == null) {
                    let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 })
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq
                }
                req.body.DOCUMENT_ID = cd.seq

                let DocumentModel = mongoSchemaModel.DocumentModel(req.body.DOCUMENT_ADMIN_USERNAME)

                DocumentModel.insertMany({ ...req.body, ['DOCUMENT_FILEDATA']: { ...req.file, ['base64']: fileData.toString('base64') } }, { new: true }, (err, resp) => {
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: null,
                        errorMsg: err
                    })
                    else {
                        fs.unlink(req.file.path, (err) => {
                            if (err) {
                                console.error('Error deleting file:', err);
                            } else {
                                // console.log('File deleted successfully');
                            }
                        });
                        res.json({
                            operation: msgObject.success,
                            result: resp,
                            errorMsg: null
                        })
                    }
                })


            })
    } catch (error) {
        // console.log("error : ", error)
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        })
    }
})

app.post('/create_documentnew', middlewareFunctions.checkAuth, upload.single('file'), (req, res) => {
    try {
        const fileData = fs.readFileSync(req.file.path);

        if (!res.headersSent) res.set('Content-Type', 'application/json');

        mongoSchemaModel.countermodel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true },
            (err, cd) => {
                let seqId;
                if (cd == null) {
                    let newval = new mongoSchemaModel.countermodel({ id: "autoval", seq: 1 });
                    newval.save();
                    seqId = 1;
                } else {
                    seqId = cd.seq;
                }

                const currentDate = new Date(); // Create date
                const expiryDate = new Date(req.body.EXPIRY_DATE); // Expiry date from request body

                req.body.DOCUMENT_ID = seqId;
                req.body.CREATE_DATE = currentDate; // Add create date
                req.body.EXPIRY_DATE = expiryDate; // Add expiry date

                let DocumentModel = mongoSchemaModel.DocumentModel(req.body.DOCUMENT_ADMIN_USERNAME);

                DocumentModel.insertMany(
                    { ...req.body, ['DOCUMENT_FILEDATA']: { ...req.file, ['base64']: fileData.toString('base64') } },
                    (err, resp) => {
                        if (err) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        });
                        else {
                            fs.unlink(req.file.path, (err) => {
                                if (err) {
                                    console.error('Error deleting file:', err);
                                } else {
                                    // console.log('File deleted successfully');
                                }
                            });
                            res.json({
                                operation: msgObject.success,
                                result: resp,
                                errorMsg: null
                            });
                        }
                    }
                );
            }
        );
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: null,
            errorMsg: error
        });
    }
});

// Delete Document 
// Assuming you already have the required dependencies and middleware functions imported and defined.

app.delete('/delete_document/:DOCUMENT_ID', middlewareFunctions.checkAuth, (req, res) => {
    try {
        const documentId = req.params.DOCUMENT_ID;
        console.log("delete_document : ", documentId)

        let DocumentModel = mongoSchemaModel.DocumentModel(req.body.DOCUMENT_ADMIN_USERNAME)

        // First, check if the document exists before attempting to delete it.
        DocumentModel.findOne({ DOCUMENT_ID: documentId }, (err, document) => {
            if (err) {
                res.json({
                    operation: msgObject.failed,
                    errorMsg: err
                });
            } else if (!document) {
                res.json({
                    operation: msgObject.failed,
                    errorMsg: "Document not found."
                });
            } else {
                // Document found, proceed with deletion.
                DocumentModel.deleteOne({ DOCUMENT_ID: documentId }, (err, result) => {
                    if (err) {
                        res.json({
                            operation: msgObject.failed,
                            errorMsg: err
                        });
                    } else {
                        res.json({
                            operation: msgObject.success,
                            result: result,
                            errorMsg: null
                        });
                    }
                });
            }
        });
    } catch (error) {
        res.json({
            operation: msgObject.failed,
            errorMsg: error
        });
    }
});

// not in use yet
// app.delete('/delete_emp/:EMPLOYEE_ID', middlewareFunctions.checkAuth, (req, res) => {
//     try {
//         const employeeId = req.params.EMPLOYEE_ID;
//         console.log("delete_employeeId : ", employeeId)

//         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_ADMIN_USERNAME)

//         // First, check if the document exists before attempting to delete it.
//         EmployeeModel.findOne({ EMPLOYEE_ID: employeeId }, (err, resQuery) => {
//             if (err) {
//                 res.json({
//                     operation: msgObject.failed,
//                     errorMsg: err
//                 });
//             } else if (!resQuery) {
//                 res.json({
//                     operation: msgObject.failed,
//                     errorMsg: "Employee not found."
//                 });
//             } else {
//                 // Document found, proceed with deletion.
//                 EmployeeModel.deleteOne({ EMPLOYEE_ID: employeeId }, (err, result) => {
//                     if (err) {
//                         res.json({
//                             operation: msgObject.failed,
//                             errorMsg: err
//                         });
//                     } else {
//                         res.json({
//                             operation: msgObject.success,
//                             result: result,
//                             errorMsg: null
//                         });
//                     }
//                 });
//             }
//         });
//     } catch (error) {
//         res.json({
//             operation: msgObject.failed,
//             errorMsg: error
//         });
//     }
// });


app.put('/download_document', (req, res) => {
    try {

        // console.log("body : ", req.body)

        let DocumentModel = mongoSchemaModel.DocumentModel(req.body.DOCUMENT_ADMIN_USERNAME)

        DocumentModel.find({ DOCUMENT_ID: req.body.DOCUMENT_ID }, (err, x) => {
            // console.log("DOCUMENT data : ", x.length)
            if (x.length == 1) {

                res.setHeader('Content-Disposition', `attachment; filename=${x[0].DOCUMENT_FILEDATA.filename}`);
                res.setHeader('Content-Type', x[0].DOCUMENT_FILEDATA.mimetype);

                // res.download(Buffer.from(x[0].DOCUMENT_FILEDATA.base64, 'base64'));
                res.send(x[0].DOCUMENT_FILEDATA.base64);
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
            result: [],
            errorMsg: error
        })
    }
});


app.put('/get_all_document', (req, res) => {
    try {

        // console.log("body : ", req.body)

        let DocumentModel = mongoSchemaModel.DocumentModel(req.body.DOCUMENT_ADMIN_USERNAME)

        DocumentModel.find({ DOCUMENT_REF_ID: req.body.DOCUMENT_REF_ID }, { DOCUMENT_FILEDATA: { base64: 0 } }, (err, x) => {
            // console.log("DOCUMENT data : ", x)
            if (x.length > 0) {

                res.json({
                    operation: msgObject.success,
                    result: x,
                    errorMsg: []
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
            result: [],
            errorMsg: error
        })
    }
});

// app.put('/get_attendance_acc_to_emp', middlewareFunctions.checkAuth, (req, res) => {
//     try {


//         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.ADMIN_USERNAME)

//         EmployeeModel.find({}, (err, x) => {
//             console.log("emp data : ", x)

//         let AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ADMIN_USERNAME)

//         let data = []
//         x.map((e,i)=>{

//             AttendanceModel.find({ATTENDANCE_EMPLOYEE_ID:x[i].EMPLOYEE_ID},(attendance_err,attendance_x)=>{
//                 data.push({...x,EMPLOYEE_ATTENDANCE:attendance_x})
//             })
//         })
//             console.log("data >> : ",data)
//         })
//     } catch (error) {
//         res.json({
//             operation: msgObject.failed,
//             result: [],
//             errorMsg: error
//         })
//     }
// })

app.post('/assign_project', (req, res) => {
    try {

        console.log("body : ", req.body)
        let { PROJECT_ID,
            PROJECT_PARENT_ID,
            PROJECT_MEMBER_PARENT_ID,
            PROJECT_MEMBER_PARENT_USERNAME,
            PROJECT_USERNAME,
            EMPLOYEE_ID,
            EMPLOYEE_PARENT_ID,
            EMPLOYEE_PARENT_USERNAME,
            EMPLOYEE_MEMBER_PARENT_ID,
            EMPLOYEE_MEMBER_PARENT_USERNAME } = req.body

        let EmployeeModel = mongoSchemaModel.EmployeeModel(EMPLOYEE_MEMBER_PARENT_USERNAME)
        EmployeeModel.findOneAndUpdate({
            EMPLOYEE_ID,
            EMPLOYEE_PARENT_ID,
            EMPLOYEE_PARENT_USERNAME,
            EMPLOYEE_MEMBER_PARENT_ID,
            EMPLOYEE_MEMBER_PARENT_USERNAME,
            EMPLOYEE_ASSIGN: {
                $not: {
                    $elemMatch: {
                        EMPLOYEE_ID: EMPLOYEE_ID,
                        PROJECT_ID: PROJECT_ID
                    }
                }
            }
        }, {
            $push: {
                EMPLOYEE_ASSIGN: {
                    EMPLOYEE_ID,
                    PROJECT_ID,
                    PROJECT_PARENT_ID,
                    PROJECT_MEMBER_PARENT_ID,
                    PROJECT_MEMBER_PARENT_USERNAME,
                    PROJECT_USERNAME,
                }
            }
        }, (err_emp, x_emp) => {
            console.log("EmployeeModel : ", x_emp, err_emp)
            if (x_emp) {
                let ProjectModel = mongoSchemaModel.ProjectModel(PROJECT_MEMBER_PARENT_USERNAME)

                ProjectModel.findOneAndUpdate({
                    PROJECT_ID,
                    PROJECT_PARENT_ID,
                    PROJECT_MEMBER_PARENT_ID,
                    PROJECT_MEMBER_PARENT_USERNAME,
                    PROJECT_USERNAME,
                    PROJECT_ASSIGN: {
                        $not: {
                            $elemMatch: {
                                PROJECT_ID: PROJECT_ID,
                                EMPLOYEE_ID: EMPLOYEE_ID
                            }
                        }
                    }
                }, {
                    $push: {
                        PROJECT_ASSIGN: {
                            PROJECT_ID,
                            EMPLOYEE_ID,
                            EMPLOYEE_PARENT_ID,
                            EMPLOYEE_PARENT_USERNAME,
                            EMPLOYEE_MEMBER_PARENT_ID,
                            EMPLOYEE_MEMBER_PARENT_USERNAME
                        }
                    }
                }, (err, x) => {
                    // console.log("ProjectModel : ", x)
                    if (err) res.json({
                        operation: msgObject.failed,
                        result: [],
                        errorMsg: err
                    })
                    else if (x !== null) {

                        res.json({
                            operation: msgObject.success,
                            result: x,
                            errorMsg: null
                        })
                    } else {
                        res.json({
                            operation: msgObject.failed,
                            result: [],
                            errorMsg: 'May be Employee Already Assigned OR Project Not Exist'
                        })
                    }
                })

            } else {
                res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: "Employee Not Exist OR Project Already Assigned"
                })
            }
        })

    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})

// app.post('/assign_project', (req, res) => {
//     try {

//         // console.log("body : ", req.body)
//         let { PROJECT_ID,
//             PROJECT_PARENT_ID,
//             PROJECT_MEMBER_PARENT_ID,
//             PROJECT_MEMBER_PARENT_USERNAME,
//             PROJECT_USERNAME,
//             EMPLOYEE_ID,
//             EMPLOYEE_PARENT_ID,
//             EMPLOYEE_PARENT_USERNAME,
//             EMPLOYEE_MEMBER_PARENT_ID,
//             EMPLOYEE_MEMBER_PARENT_USERNAME } = req.body

//         let EmployeeModel = mongoSchemaModel.EmployeeModel(EMPLOYEE_MEMBER_PARENT_USERNAME)
//         EmployeeModel.find({
//             EMPLOYEE_ID,
//             EMPLOYEE_PARENT_ID,
//             EMPLOYEE_PARENT_USERNAME,
//             EMPLOYEE_MEMBER_PARENT_ID,
//             EMPLOYEE_MEMBER_PARENT_USERNAME
//         }, (err_emp, x_emp) => {
//             // console.log("EmployeeModel : ", x_emp)
//             if (x_emp.length > 0) {
//                 let ProjectModel = mongoSchemaModel.ProjectModel(PROJECT_MEMBER_PARENT_USERNAME)

//                 ProjectModel.findOneAndUpdate({
//                     PROJECT_ID,
//                     PROJECT_PARENT_ID,
//                     PROJECT_MEMBER_PARENT_ID,
//                     PROJECT_MEMBER_PARENT_USERNAME,
//                     PROJECT_USERNAME,
//                     PROJECT_ASSIGN: {
//                         $not: {
//                             $elemMatch: {
//                                 EMPLOYEE_ID: EMPLOYEE_ID
//                             }
//                         }
//                     }
//                 }, {
//                     $push: {
//                         PROJECT_ASSIGN: {
//                             EMPLOYEE_ID,
//                             EMPLOYEE_PARENT_ID,
//                             EMPLOYEE_PARENT_USERNAME,
//                             EMPLOYEE_MEMBER_PARENT_ID,
//                             EMPLOYEE_MEMBER_PARENT_USERNAME
//                         }
//                     }
//                 }, (err, x) => {
//                     // console.log("ProjectModel : ", x)
//                     if (err) res.json({
//                         operation: msgObject.failed,
//                         result: [],
//                         errorMsg: err
//                     })
//                     else if (x !== null) {

//                         res.json({
//                             operation: msgObject.success,
//                             result: x,
//                             errorMsg: null
//                         })
//                     } else {
//                         res.json({
//                             operation: msgObject.failed,
//                             result: [],
//                             errorMsg: 'May be Employee Already Assigned OR Project Not Exist'
//                         })
//                     }
//                 })

//             } else {
//                 res.json({
//                     operation: msgObject.failed,
//                     result: [],
//                     errorMsg: "Employee Not Exist"
//                 })
//             }
//         })

//     } catch (error) {
//         res.json({
//             operation: msgObject.failed,
//             result: [],
//             errorMsg: error
//         })
//     }
// })

// Made By Varun For Attendence Page Getting All Employees Values
app.put('/get_employee_details_for_attendence', middlewareFunctions.checkAuth, (req, res) => {
    try {
        let data = [];
        console.log("req is", req.body);

        let AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ADMIN_USERNAME)
        const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.ADMIN_USERNAME)

        EmployeeModel.find({ EMPLOYEE_PARENT_USERNAME: req.body.EMPLOYEE_PARENT_USERNAME }, (errorcontract, recontract) => {
            if (errorcontract) res.json({
                operation: msgObject.failed,
                result: recontract,
                errorMsg: msgObject.invalid
            })
            else if (recontract.length > 0) {
                console.log("employee details", recontract.length)


                let respData = []
                let counter = 0
                function recursion_fun() {
                    // recontract[counter]
                    AttendanceModel.find({
                        ATTENDANCE_EMPLOYEE_ID: recontract[counter].EMPLOYEE_ID,
                    })
                        .then((employees) => {

                            console.log("Employees List", employees.length, "<<>>", recontract[counter].EMPLOYEE_ID);

                            respData.push({ ...recontract[counter], AttendanceData: employees })

                            counter++
                            if (counter < recontract.length) {
                                recursion_fun()
                            } else {
                                console.log("recursion ended")
                                console.log("respData : ", respData)
                                res.json({
                                    operation: msgObject.success,
                                    result: respData,
                                    errorMsg: []
                                })
                            }
                        })
                        .catch((err) => {
                            console.error('Error fetching employee details:', err);
                        });

                }

                recursion_fun()

                // Promise.all(recontract.map(e => {
                //     AttendanceModel.find({
                //         ATTENDANCE_EMPLOYEE_ID: e.EMPLOYEE_ID,
                //     })
                //         .then((employees) => {
                //             console.log("Employees List", employees, "<<>>", e.EMPLOYEE_ID);

                //             respData.push({ ...e, AttendanceData: employees })

                //             // if(employees.length > 0 ){
                //             //     data = employees;
                //             //     console.log("data", data);
                //             //     data.forEach((emp) => {
                //             //         // Access individual properties of each emp object
                //             //         const attendanceDateId = emp.ATTENDANCE_DATE_ID;
                //             //         // Debugging logs
                //             //         console.log('emp forEach', emp,typeof Object.keys(emp));
                //             //          // Check if the property exists and has a value
                //             //         if (attendanceDateId !== undefined) {
                //             //             console.log('Attendance Date ID is valid:', attendanceDateId);
                //             //         } else {
                //             //             console.log('Attendance Date ID is undefined or missing.');
                //             //         }
                //             //     });
                //             // } 
                //         })
                //         .catch((err) => {
                //             console.error('Error fetching employee details:', err);
                //         });
                // }))


            } else {

                res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: msgObject.invalid
                })
            }
        })



    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})

app.put('/update_subcontructor', middlewareFunctions.checkAuth, (req, res) => {
    try {
        console.log("update_subcontructor body : ", req.body)

        let { SUBCONTRACTOR_ID,
            SUBCONTRACTOR_PARENT_ID,
            SUBCONTRACTOR_PARENT_USERNAME,
            SUBCONTRACTOR_MEMBER_PARENT_ID,
            SUBCONTRACTOR_MEMBER_PARENT_USERNAME,
            SUBCONTRACTOR_DETAILS_FOR_UPDATES } = req.body
        const SubContractorModel = mongoSchemaModel.SubContractorModel(SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

        SubContractorModel.findOneAndUpdate({
            SUBCONTRACTOR_ID,
            SUBCONTRACTOR_PARENT_ID,
            SUBCONTRACTOR_PARENT_USERNAME,
            SUBCONTRACTOR_MEMBER_PARENT_ID,
            SUBCONTRACTOR_MEMBER_PARENT_USERNAME,
        }, { ...SUBCONTRACTOR_DETAILS_FOR_UPDATES }, (error_emp, x_emp) => {
            if (error_emp) res.json({
                operation: msgObject.failed,
                result: recontract,
                errorMsg: msgObject.invalid
            })
            else if (x_emp !== null) {
                res.json({
                    operation: msgObject.success,
                    result: x_emp,
                    errorMsg: []
                })

            } else {

                res.json({
                    operation: msgObject.failed,
                    result: [],
                    errorMsg: "Subcontractor Not Exist"
                })
            }
        })


    } catch (error) {
        res.json({
            operation: msgObject.failed,
            result: [],
            errorMsg: error
        })
    }
})
let PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server Running on => `, PORT);
});

app.get('/calculate-overtime/:employeeId', async (req, res) => {
    try {

        let AttendanceModel = mongoSchemaModel.AttendanceModel(req.body.ADMIN_USERNAME)
        const employeeId = req.params.employeeId;

        // Fetch the employee's attendance data from the database
        const foundUsers = await Attendance.find({
            ATTENDANCE_EMPLOYEE_ID: employeeId,
        });

        // Calculate overtime based on the foundUsers data
        app.get('/calculate-overtime/:employeeId', async (req, res) => {
            try {
                const employeeId = req.params.employeeId;

                // Fetch the employee's attendance data from the database
                const foundUsers = await Attendance.find({
                    ATTENDANCE_EMPLOYEE_ID: employeeId,
                });

                // Calculate overtime based on the foundUsers data
                // Calculate overtime based on the foundUsers data
                const processedData = foundUsers?.map((employee) => {
                    const filterByDate = employee.AttendanceData.filter((item) => {
                        return (filterMethod === 'By Pay Period'
                            ? dateArray
                            : [keyword]
                        ).includes(item.ATTENDANCE_DATE_ID);
                    });

                    const regularHoursThreshold = 8; // Define your regular hours threshold (e.g., 8 hours per day)
                    let totalRegularHours = 0;
                    let totalOvertimeHours = 0;

                    // Calculate overtime for each attendance record
                    const employeeAttendance = filterByDate.map((attendance) => {
                        const attendanceIn = new Date(attendance.ATTENDANCE_IN);
                        const attendanceOut = new Date(attendance.ATTENDANCE_OUT);
                        const hoursWorked =
                            Math.abs(attendanceOut - attendanceIn) / (1000 * 60 * 60); // Convert milliseconds to hours

                        if (hoursWorked <= regularHoursThreshold) {
                            totalRegularHours += hoursWorked;
                        } else {
                            totalRegularHours += regularHoursThreshold;
                            totalOvertimeHours += hoursWorked - regularHoursThreshold;
                        }

                        return {
                            ...attendance,
                            HOURS: hoursWorked.toFixed(2),
                            REGULAR: totalRegularHours.toFixed(2), // Accumulated regular hours
                            OVERTIME: totalOvertimeHours.toFixed(2), // Accumulated overtime hours
                        };
                    });

                    // Create the modified employee data including overtime
                    const modifiedEmployee = {
                        ...employee._doc,
                        EMPLOYEE_ATTENDANCE: employeeAttendance,
                    };

                    return modifiedEmployee;
                });


                // Send the processed data as a JSON response
                res.json(processedData);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        // Send the processed data as a JSON response
        res.json(processedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





