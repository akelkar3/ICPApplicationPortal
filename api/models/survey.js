const mongoose = require('mongoose');

const surveySchema = mongoose.Schema({

    surveyId:{
        type:Number
    },
    qId:mongoose.Schema.Types.ObjectId,

    qText: { type: String, required: true },

    orderId:{
       type:Number
     }
});

module.exports = mongoose.model('Survey', surveySchema);