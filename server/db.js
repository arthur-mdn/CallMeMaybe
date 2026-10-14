import mongoose from 'mongoose'
import config from './config.js'

console.log(config)

mongoose.connect(config.dbUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion MongoDB:'));
db.once('open', function() {
    console.log("Connexion à la base de données réussie");
});

export default db