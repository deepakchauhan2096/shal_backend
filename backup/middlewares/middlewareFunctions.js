const mongoose = require('../db/mongo_connection')
const mongoSchemaModel = require('../models/schema')
require("dotenv").config();
const Schema = mongoose.Schema;
const msgObject = require('../responseMsg.json')


module.exports = middlewareFunctions = {
    checkAuth: (req, res, next) => {
        try {
            console.log("header : ", req.headers.authorization_key)
            if (req.headers.authorization_key == process.env.API_KEY) {
                next()
            } else {
                res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: 'Invaild User'
                })
            }
        } catch (error) {
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }

    },

    verifying: (req, res, next) => {
        try {
            console.log('verifying : ', req.body)


            let CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_USERNAME)
            CompanyModel.find({}, (err, x) => {
                console.log("user data : ", x)
                if (x.length > 0) {
                    res.json({
                        operation: msgObject.failed,
                        result: x,
                        errorMsg: msgObject.userAlreadyExist
                    })
                } else {

                    next()
                }
            }).limit(2)

        } catch (error) {
            console.log("error : ", error)
            res.json({
                operation: msgObject.failed,
                result: null,
                errorMsg: error
            })
        }
    },

    vaildateMember: (req, res, next) => {
        try {
            console.log('vaildateMember : ', req.body, msgObject)
            let CompanyModel = mongoSchemaModel.CompanyModel(req.body.MEMBER_PARENT_USERNAME)

            CompanyModel.find({ COMPANY_USERNAME: req.body.MEMBER_PARENT_USERNAME, COMPANY_ID: req.body.MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (x.length == 1) {
                    const MemberModel = mongoSchemaModel.MemberModel(req.body.MEMBER_PARENT_USERNAME)

                    MemberModel.find({ MEMBER_USERNAME: req.body.MEMBER_USERNAME }, (error, re) => {
                        if (re.length > 0) {
                            res.json({
                                operation: msgObject.failed,
                                result: x,
                                errorMsg: msgObject.memberAlreadyExist
                            })
                        } else {

                            next()
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
    },

    vaildateClient: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let CompanyModel = mongoSchemaModel.CompanyModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

            CompanyModel.find({ COMPANY_USERNAME: req.body.CLIENT_MEMBER_PARENT_USERNAME, COMPANY_ID: req.body.CLIENT_MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let MemberModel = mongoSchemaModel.MemberModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)

                    MemberModel.find({ MEMBER_USERNAME: req.body.CLIENT_PARENT_USERNAME, MEMBER_ID: req.body.CLIENT_PARENT_ID }, (errMember, resMember) => {
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                         
                            let ClientModel = mongoSchemaModel.ClientModel(req.body.CLIENT_MEMBER_PARENT_USERNAME)
                            ClientModel.find({ CLIENT_USERNAME: req.body.CLIENT_USERNAME }, (errorClient, resClient) => {
                                if(errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.clinetAlreadyExist
                                    })
                                } else {

                                    next()
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
    }
}