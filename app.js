
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var express    = require('express'); 
var app        = express(); 
var bodyParser = require('body-parser');

var config = require('./config/app');
var deploy = require('./controllers/deploy');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router(); 
router.post('/hook', deploy.postHook);
router.get('/hook', deploy.getHook);

app.use('/api', router);

app.listen(config.port);
console.log('Simaya deploy running on port ' + config.port);