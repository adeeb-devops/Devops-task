export const popupParams:any={
    "MinMax":{
        type:'min-max',
        min:'5',
        max:'5000',
        autoclose:false
    },
    "rules":{
        type:'game-rules',
        isBottomSheet:false
    },
    "exit":{
        type:'exit-game',
    },
    "lastChance":{
        type:'text',
        text:'Last Chance',
        autoclose:true
    },
    "confirm":{
        type:'text',
        text:'Your Bets Have Been Confirmed',
        autoclose:true,
    },
    "NoBets":{
        type:'text',
        text:'NO MORE BETS PLEASE',
        autoclose:true
    },
    "loginDevice":{
        type:'text',
        text:'User login from another device',
    },
    "gameProgress":{
        type:"text",
        text:"Please wait for next game to start",
        autoclose:true
    },
    "placeBets":{
        type:"text", 
        text:"Place your BETS",
        autoclose:true
    },
    "winner":{
        type:"winner",
        isPopupOpen:true,
        leftNumber:17,
        winNumber:21,
        rightNumber:23,
        amount:1000,
    },
    "lottery":{
        type:'lottery',
        isPopupOpen:true,
        leftNumber:17,
        winNumber:21,
        rightNumber:23,
        autoclose:true
    },
    "disconnect":{
        type:'disconnect'
    },
    "lowBalance":{
        type:'low-balance',
        autoclose:false
    },
    'history':{
        type:'history'
    },
    'welcome':{
        type:'welcome'
    },
    "unavailable":{
        type:'game-unavailable'
    },
    'payouts':{
        type:'payout'
    }


}