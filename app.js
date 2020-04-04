var express = require('express');

var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler')
, expressSession = require('express-session');
var app = express();

app.set('view engine','jade');
app.set('views','views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));   //body-paser middle-wear 를 먼저 실행 후 라우팅
app.use(express.static('public'));
app.use(cookieParser());
app.use(expressSession({
      secret:'my key',
      resave:true,
      saveUninitialized:true
}));  

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/blog')

var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
    console.log('db connect');
});

var user_schema = new Schema({
    id : String,
    pw : String
});
var userModel = mongoose.model('userModel',user_schema,'user');

var visitor_schema = new Schema({
    id : String,
    content : String
});

var visitorModel = mongoose.model('visitorModel',visitor_schema,'visitor');


// Authrization
var authUser = function(db, id, pw,callback) {
	console.log('auth : ' + id + ', ' + pw);
    
      //login 
      userModel.find({"id":id,"pw":pw},function(err,docs){
        console.log(docs);
        
        if(err){
            callback(err,null);
        }
        console.log (id + pw);
        console.dir(docs);

        if(docs.length > 0){
            console.log('login success');
            callback(null,docs);
        }
        else{
            console.log('login fail');
            callback(null,null);
        }
    });
};

function addUser(id,pw){
    var newUser = new userModel;

    newUser.id = id;
    newUser.pw = pw;

    console.log('add user : ' + newUser.id + newUser.pw);

    newUser.save(function (err) {
        if (err) throw err;
    });
}


function addVisitor(id,visitor){
    var newVisitor = new visitorModel;
    newVisitor.id = id;
    newVisitor.content = visitor;

    console.log(newVisitor.id + newVisitor.content);

    newVisitor.save(function (err) {
        if (err) throw err;
    });
}





app.get('/',function(req,res){
    res.render('index',{id:req.session.ID});
})
app.get('/profile',function(req,res){
    res.render('profile');
})
app.get('/skill',function(req,res){
    res.render('skill');
})
app.get('/photo1',function(req,res){
    res.render('photo1');
});
app.get('/photo2',function(req,res){
    res.render('photo2');
});
app.get('/photo3',function(req,res){
    res.render('photo3');
});
app.get('/game',function(req,res){
    res.render('game');
})
app.get('/register',function(req,res){
    res.render('register');
})
app.post('/register_process',function(req,res){
    var id = req.body.id;
    var pw = req.body.pw;
    console.log(id + '+' + pw);
    addUser(id,pw);
    res.redirect('/');
})

app.get('/login',function(req,res){
    res.render('login');
})
app.post('/login_auth',function(req,res){
    var id = req.body.id;
    var pw = req.body.pw;
  
    authUser(db, id, pw, function(err, docs){
        if(docs){
            console.log(id);
            req.session.ID = id;
            res.redirect('/');
        }
        else
            res.render('login_fail');
    });   
});
app.get('/login_fail',function(req,res){
    res.render('login_fail');
});
app.get('/logout',function(req,res){
    req.session.destroy(function(err){
        if(err) console.error('err',err);
    res.redirect('/');    
    })
});
app.get('/visitor',function(req,res){
   
    user_id = req.session.ID;

    visitorModel.find({}).sort({date:-1}).exec(function(err, docs){
        // db에서 날짜 순으로 데이터들을 가져옴
         console.log(docs);
         console.log(docs.length);
         if(err) throw err;
         res.render('visitor', {title: "visitor", docs: docs, u_id : user_id}); 
         // board.ejs의 title변수엔 “Board”를, contents변수엔 db 검색 결과 json 데이터를 저장해줌.
     });
 })
app.get('/visitor_process',function(req,res){
    id = req.session.ID;
    var visitor = req.query.visitor;

    console.log(id+"+"+visitor);
    addVisitor(id,visitor);
    res.redirect('visitor');
});

app.listen('3000',function(){
    console.log('web server start');

})
