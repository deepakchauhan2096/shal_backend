const mongoose = require('../db/mongo_connection')
const mongoSchemaModel = require('../models/schema')
require("dotenv").config();
const Schema = mongoose.Schema;
const msgObject = require('../responseMsg.json')


module.exports = middlewareFunctions = {
    checkAuth: (req, res, next) => {
        try {
            console.log("header : ", req.headers.authorization_key)
            if (req.headers.authorization_key == "qzOUsBmZFgMDlwGtrgYypxUz") {
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
            let AdminModel = mongoSchemaModel.AdminModel(req.body.ADMIN_USERNAME)
            AdminModel.find({}, (err, x) => {
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
            console.log('vaildateMember : ', req.body)
            let AdminModel = mongoSchemaModel.AdminModel(req.body.COMPANY_PARENT_USERNAME)

            AdminModel.find({ ADMIN_USERNAME: req.body.COMPANY_PARENT_USERNAME, ADMIN_ID: req.body.COMPANY_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (x.length == 1) {
                    const CompanyModel = mongoSchemaModel.CompanyModel(req.body.COMPANY_PARENT_USERNAME)

                    CompanyModel.find({ COMPANY_USERNAME: req.body.COMPANY_USERNAME }, (error, re) => {
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

    vaildateEmpAttendance: (req, res, next) => {
        try {
            console.log('vaildateEmpAttendance : ', req.body, msgObject)
            let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

            AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.EMPLOYEE_MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (x.length == 1) {
                    const EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_PARENT_USERNAME)

                    EmployeeModel.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (error, re) => {
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
            let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

            AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.EMPLOYEE_MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)
                    CompanyModel.find({ COMPANY_USERNAME: req.body.EMPLOYEE_PARENT_USERNAME, COMPANY_ID: req.body.EMPLOYEE_PARENT_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)
                            EmployeeModel.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
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
    },

    vaildateProject: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let AdminModel = mongoSchemaModel.AdminModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)

            AdminModel.find({ ADMIN_USERNAME: req.body.PROJECT_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.PROJECT_MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)
                    CompanyModel.find({ COMPANY_USERNAME: req.body.PROJECT_PARENT_USERNAME, COMPANY_ID: req.body.PROJECT_PARENT_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let ProjectModel = mongoSchemaModel.ProjectModel(req.body.PROJECT_MEMBER_PARENT_USERNAME)
                            ProjectModel.find({ PROJECT_USERNAME: req.body.PROJECT_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
                                    operation: msgObject.failed,
                                    result: null,
                                    errorMsg: errorClient
                                })
                                if (resClient.length > 0) {
                                    // if(!res.headersSent) res.set('Content-Type', 'application/json');
                                    res.json({
                                        operation: msgObject.failed,
                                        result: x,
                                        errorMsg: msgObject.ProjectExists
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
    },

    // vaildateSubContractor: (req, res, next) => {
    //     try {
    //         console.log('vaildatesubContractor : ', req.body, msgObject)
    //         let AdminModel = mongoSchemaModel.AdminModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)

    //         AdminModel.find({ ADMIN_USERNAME: req.body.EMPLOYEE_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.EMPLOYEE_MEMBER_PARENT_ID }, (err, x) => {
    //             console.log("user data : ", x)
    //             if (err) res.json({
    //                 operation: msgObject.failed,
    //                 result: null,
    //                 errorMsg: err
    //             })
    //             else if (x.length == 1) {
    //                 let CompanyModel = mongoSchemaModel.CompanyModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)
    //                 CompanyModel.find({ COMPANY_USERNAME: req.body.EMPLOYEE_PARENT_USERNAME, COMPANY_ID: req.body.EMPLOYEE_PARENT_ID }, (errMember, resMember) => {
    //                     console.log("companymodel : ", resMember,errMember)
    //                     if (errMember) res.json({
    //                         operation: msgObject.failed,
    //                         result: null,
    //                         errorMsg: err
    //                     })
    //                     else if (resMember.length > 0) {
    //                         let EmployeeModel = mongoSchemaModel.EmployeeModel(req.body.EMPLOYEE_MEMBER_PARENT_USERNAME)
    //                         EmployeeModel.find({ EMPLOYEE_USERNAME: req.body.EMPLOYEE_USERNAME }, (errorClient, resClient) => {
    //                             console.log("EmployeeModel : ", resClient)

    //                             if (errorClient) res.json({
    //                                 operation: msgObject.failed,
    //                                 result: null,
    //                                 errorMsg: errorClient
    //                             })
    //                             if (resClient.length > 0) {
    //                                 // if(!res.headersSent) res.set('Content-Type', 'application/json');
    //                                 res.json({
    //                                     operation: msgObject.failed,
    //                                     result: x,
    //                                     errorMsg: msgObject.clinetAlreadyExist
    //                                 })
    //                             } else {

    //                                 next()
    //                             }
    //                         })


    //                     } else {
    //                         res.json({
    //                             operation: msgObject.failed,
    //                             result: x,
    //                             errorMsg: msgObject.invalid
    //                         })

    //                     }
    //                 })


    //             } else {
    //                 res.json({
    //                     operation: msgObject.failed,
    //                     result: x,
    //                     errorMsg: msgObject.invalid
    //                 })

    //             }
    //         })
    //     } catch (error) {
    //         res.json({
    //             operation: msgObject.failed,
    //             result: null,
    //             errorMsg: error
    //         })
    //     }
    // },

    vaildateSubContractor: (req, res, next) => {
        try {
            console.log('vaildateClient : ', req.body, msgObject)
            let AdminModel = mongoSchemaModel.AdminModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)

            AdminModel.find({ ADMIN_USERNAME: req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME, ADMIN_ID: req.body.SUBCONTRACTOR_MEMBER_PARENT_ID }, (err, x) => {
                console.log("user data : ", x)
                if (err) res.json({
                    operation: msgObject.failed,
                    result: null,
                    errorMsg: err
                })
                else if (x.length == 1) {
                    let CompanyModel = mongoSchemaModel.CompanyModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)
                    CompanyModel.find({ COMPANY_USERNAME: req.body.SUBCONTRACTOR_PARENT_USERNAME, COMPANY_ID: req.body.SUBCONTRACTOR_PARENT_ID }, (errMember, resMember) => {
                        console.log("companymodel : ", resMember,errMember)
                        if (errMember) res.json({
                            operation: msgObject.failed,
                            result: null,
                            errorMsg: err
                        })
                        else if (resMember.length > 0) {
                            let SubContractorModel = mongoSchemaModel.SubContractorModel(req.body.SUBCONTRACTOR_MEMBER_PARENT_USERNAME)
                            SubContractorModel.find({ SUBCONTRACTOR_USERNAME: req.body.SUBCONTRACTOR_USERNAME }, (errorClient, resClient) => {
                                console.log("EmployeeModel : ", resClient)

                                if (errorClient) res.json({
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
    },
    
}