var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
ObjectId = require('mongodb').ObjectId;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
		'instagram',
		new mongodb.Server('localhost', 27017, {}),
		{}
	);

console.log('servidor escutando');

app.get('/', function(req, res){
	res.send({msg: 'Olá'})
})

//post
app.post('/api', function(req, res){
	var dados = req.body;

	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.insert(dados, function(err, records){
				if (err){
					res.json(err);
				}
				else{
					res.json(records);
				}
				mongoclient.close();
			});
		})
	});
	
})

//get
app.get('/api', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find().toArray(function(err, result){
				if (err) {
					res.json(err);
				}
				else{
					res.json(result);
				}
				mongoclient.close();
			});
		})
	});
	
})

//get by id
app.get('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find({_id : ObjectId(req.params.id)}).toArray(function(err, result){
				if (err) {
					res.json(err);
				}
				else{
					res.json(result);
				}
				mongoclient.close();
			});
		})
	});
	
})

//put(update) by id
app.put('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.update(
				{_id : ObjectId(req.params.id)},
				{$set :{titulo : req.body.titulo} },
				{},
				function(err, result){
					if (err) {
						res.json(err);
					}
					else{
						res.json(result);
					}
					mongoclient.close();
				}
			);
		})
	})	
});
	

//delete by id
app.delete('/api/:id', function(req, res){
	db.open(function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.remove({_id : ObjectId(req.params.id)}, function(err, result){
				if (err){
					res.json(err);
				}
				else {
					res.json.status(200)(result);
				}
				mongoclient.close();
			});
		})
	})	
});