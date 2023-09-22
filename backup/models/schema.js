const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = {
    id: {
      type: String
    },
    seq: {
      type: Number
    }
  };

const CompanySchema = Schema({
    COMPANY_ID:{type:Number,required:true},
    COMPANY_ROLE:{type:String,default:''},
    COMPANY_NAME:{type:String,default:''},
    COMPANY_PHONE:{type:Number,required:false,default:''},
    COMPANY_EMAIL:{type:String,default:''},
    COMPANY_ADD2:{type:String,default:''},
    COMPANY_STATE:{type:String,default:''},
    COMPANY_USERNAME:{type:String,default:''},
    // COMPANY_EMPLOYEE:{type:Array,default:[]},
    
  });

const MemberSchema = new Schema({
    MEMBER_ID:{type:Number,required:true},
    MEMBER_PARENT_ID:{type:Number,required:true},
    MEMBER_PARENT_USERNAME:{type:String,required:true},
    MEMBER_ROLE:{type:String,default:''},
    MEMBER_NAME:{type:String,default:''},
    MEMBER_PHONE:{type:Number,required:false,default:''},
    MEMBER_EMAIL:{type:String,default:''},
    MEMBER_USERNAME:{type:String,default:''},
    MEMBER_CLIENTS:{type:Array,default:[]},
    
  });

const ClientSchema = new Schema({
    CLIENT_ID:{type:Number,required:true},
    CLIENT_PARENT_ID:{type:Number,required:true},
    CLIENT_PARENT_USERNAME:{type:String,required:true},
    CLIENT_MEMBER_PARENT_ID:{type:Number,required:true},
    CLIENT_MEMBER_PARENT_USERNAME:{type:String,required:true},
    CLIENT_ROLE:{type:String,default:''},
    CLIENT_NAME:{type:String,default:''},
    CLIENT_PHONE:{type:Number,required:false,default:''},
    CLIENT_EMAIL:{type:String,default:''},
    CLIENT_USERNAME:{type:String,default:''},
  });

const EmailTaskAutomation = new Schema({
  // Purpose:{type:String,default:""},
  Details:{type:Object}
})
  
module.exports = mongoSchemaModel = {
    
    CompanyModel : (parm)=>mongoose.model(`company_${parm}`,CompanySchema),
    MemberModel : (parm)=>mongoose.model(`member_${parm}`,MemberSchema),
    ClientModel : (parm)=>mongoose.model(`client_${parm}`,ClientSchema),
    countermodel : mongoose.model("counter", counterSchema),
    CompanySchema:CompanySchema,
    EmailTaskAutomation:mongoose.model(`EmailTaskAutomation`,EmailTaskAutomation),
    
}
