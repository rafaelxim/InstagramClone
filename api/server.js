var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var multiparty = require('connect-multiparty');
ObjectId = require('mongodb').ObjectId;
//biblioteca FileSystem para manipulacao de arquivos
var fs = require('fs');

var app = express();

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	next();
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());
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
	

	var date = new Date();
	var time_stamp = date.getTime();
	var url_imagem = time_stamp+'_'+req.files.arquivo.originalFilename;
	var path_origem = req.files.arquivo.path;
	var path_destino = './upload/' +url_imagem;
	

	fs.rename(path_origem, path_destino, function(err){
		if (err) {
			res.status(500).json(err);
			return;
		}
		var dados ={
			url_imagem: url_imagem,
			titulo: req.body.titulo
		}
	

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

app.get('/imagens/:imagem', function(req, res){
	var img = req.params.imagem;
	fs.readFile('./upload/'+img, function(err, content){
		if (err) {
			res.status(400).json(err);
			return;
		}
		res.writeHead(200, {'content-type': 'image/jpg'})
		res.end(content);


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
	res.send(req.body.comentario);
	
	/*db.open(function(err, mongoclient){
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
	})	*/
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